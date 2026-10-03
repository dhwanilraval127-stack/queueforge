import { sessionRepository } from '@/lib/repositories/session-repository';
import { registrationRepository } from '@/lib/repositories/registration-repository';
import { rulesRepository } from '@/lib/repositories/rules-repository';
import { importRepository } from '@/lib/repositories/import-repository';
import { studentRepository } from '@/lib/repositories/student-repository';
import { auditService } from './audit-service';
import { RegistrationEngine } from '@/lib/engine/registration-engine';
import { parseCsvText } from '@/lib/csv/parser';
import type { Registration } from '@/types/registration';
import type { AuditEventInput } from '@/types/audit';
import type { EngineSession } from '@/lib/engine/types';
import { deterministicRegistrationId } from '@/lib/utils/id';
import { nowIso } from '@/lib/utils/date';
import { auditEventForDecision } from '@/lib/audit/audit-log';
import { MAX_CSV_ROWS, MAX_CSV_SIZE_BYTES } from '@/lib/utils/constants';

export interface ImportResult {
  importId: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  processedRows: number;
  acceptedRows: number;
  waitlistedRows: number;
  rejectedRows: number;
  errors: string[];
}

export const importService = {
  async importCsv(filename: string, csvText: string): Promise<ImportResult> {
    if (csvText.length > MAX_CSV_SIZE_BYTES) {
      throw new Error(`CSV file exceeds maximum size of ${MAX_CSV_SIZE_BYTES} bytes`);
    }

    const sessions = await sessionRepository.getAll();
    const knownSessionIds = new Set(sessions.map((s) => s.id));
    // Also allow lookup by code
    sessions.forEach((s) => knownSessionIds.add(s.code));

    const parsed = parseCsvText(csvText, { knownSessionIds });

    if (parsed.totalRows > MAX_CSV_ROWS) {
      throw new Error(`CSV exceeds maximum row limit of ${MAX_CSV_ROWS}`);
    }

    const importRecord = await importRepository.create({
      filename,
      totalRows: parsed.totalRows,
      validRows: parsed.validRows.length,
      invalidRows: parsed.invalidRows.length,
      duplicateRows: parsed.duplicateRows.length,
      processedRows: 0,
      acceptedRows: 0,
      waitlistedRows: 0,
      rejectedRows: 0,
      status: 'PROCESSING',
      errorSummary: parsed.errors.length > 0 ? parsed.errors.slice(0, 20) : undefined,
    });

    await auditService.log({
      eventType: 'IMPORT_STARTED',
      reasonCode: 'IMPORT_INITIATED',
      message: `Import '${filename}' started with ${parsed.totalRows} rows`,
      metadata: { importId: importRecord.id, filename },
    });

    try {
      // Build engine
      const existing = await registrationRepository.getAllForEngine();
      const rules = await rulesRepository.getActive();
      const engineSessions: EngineSession[] = sessions.map((s) => ({
        id: s.id,
        code: s.code,
        capacity: s.capacity,
        active: s.active,
      }));

      const engine = new RegistrationEngine(engineSessions, existing, rules);
      const baseSequence = await registrationRepository.countAll();

      // Map session code -> id for CSV convenience
      const sessionByCode = new Map(sessions.map((s) => [s.code, s]));

      const inputs = parsed.validRows.map((row, idx) => {
        const resolvedSessionId = knownSessionIds.has(row.sessionId)
          ? sessionByCode.get(row.sessionId)?.id || row.sessionId
          : row.sessionId;
        return {
          studentId: row.studentId,
          sessionId: resolvedSessionId,
          timestamp: row.timestamp,
          originalSequence: baseSequence + idx + 1,
          rawRow: row,
        };
      });

      // Process via engine
      const batchResult = engine.processBatch(
        inputs.map((i) => ({
          studentId: i.studentId,
          sessionId: i.sessionId,
          timestamp: i.timestamp,
          originalSequence: i.originalSequence,
        }))
      );

      // Build registrations
      const now = nowIso();
      const registrations: Registration[] = batchResult.decisions.map(({ input, decision }) => ({
        id: deterministicRegistrationId(input.studentId, input.sessionId, importRecord.id),
        studentId: input.studentId,
        sessionId: input.sessionId,
        registeredAt: input.timestamp,
        originalSequence: input.originalSequence,
        status: decision.status,
        queuePosition: decision.queuePosition,
        reasonCode: decision.reasonCode,
        sourceImportId: importRecord.id,
        createdAt: now,
        updatedAt: now,
      }));

      // Add duplicate rows as rejected
      const duplicateRegistrations: Registration[] = parsed.duplicateRows.map((row, idx) => ({
        id: deterministicRegistrationId(
          row.studentId,
          row.sessionId,
          `${importRecord.id}_dup_${idx}`
        ),
        studentId: row.studentId,
        sessionId: row.sessionId,
        registeredAt: row.timestamp,
        originalSequence: baseSequence + inputs.length + idx + 1,
        status: 'REJECTED_DUPLICATE',
        reasonCode: 'DUPLICATE_IN_SOURCE',
        sourceImportId: importRecord.id,
        createdAt: now,
        updatedAt: now,
      }));

      const invalidRegistrations: Registration[] = parsed.invalidRows.map((row, idx) => ({
        id: deterministicRegistrationId(
          row.studentId || `invalid_${idx}`,
          row.sessionId || `invalid_${idx}`,
          `${importRecord.id}_inv_${idx}`
        ),
        studentId: row.studentId || '',
        sessionId: row.sessionId || '',
        registeredAt: row.timestamp || now,
        originalSequence: baseSequence + inputs.length + parsed.duplicateRows.length + idx + 1,
        status: row.errors.some((e) => e.includes('Unknown session'))
          ? 'REJECTED_SESSION_NOT_FOUND'
          : 'REJECTED_INVALID',
        reasonCode: row.errors[0] || 'VALIDATION_FAILED',
        sourceImportId: importRecord.id,
        createdAt: now,
        updatedAt: now,
      }));

      const allRegistrations = [
        ...registrations,
        ...duplicateRegistrations,
        ...invalidRegistrations,
      ];

      await registrationRepository.createBatch(allRegistrations);

      // Upsert students
      const studentCodes = Array.from(new Set(parsed.validRows.map((r) => r.studentId)));
      await studentRepository.upsertBatch(studentCodes);

      // Build audit events for engine decisions
      const auditInputs: AuditEventInput[] = batchResult.decisions.map(({ input, decision }, idx) => {
        const reg = registrations[idx]!;
        return auditEventForDecision(
          reg.id,
          decision,
          input.studentId,
          input.sessionId
        );
      });

      await auditService.logBatch(auditInputs);

      // Audit the duplicates/invalid
      const extraAudit: AuditEventInput[] = [
        ...duplicateRegistrations.map((r) => ({
          registrationId: r.id,
          studentId: r.studentId,
          sessionId: r.sessionId,
          eventType: 'REGISTRATION_REJECTED_DUPLICATE' as const,
          newStatus: r.status,
          reasonCode: r.reasonCode || 'DUPLICATE_IN_SOURCE',
          message: 'Duplicate row in source CSV',
        })),
        ...invalidRegistrations.map((r) => ({
          registrationId: r.id,
          studentId: r.studentId,
          sessionId: r.sessionId,
          eventType:
            r.status === 'REJECTED_SESSION_NOT_FOUND'
              ? ('REGISTRATION_REJECTED_SESSION_NOT_FOUND' as const)
              : ('REGISTRATION_REJECTED_INVALID' as const),
          newStatus: r.status,
          reasonCode: r.reasonCode || 'VALIDATION_FAILED',
          message: 'Invalid row in source CSV',
        })),
      ];
      await auditService.logBatch(extraAudit);

      const acceptedCount = registrations.filter((r) => r.status === 'ACCEPTED').length;
      const waitlistedCount = registrations.filter((r) => r.status === 'WAITLISTED').length;
      const rejectedCount =
        registrations.filter((r) => r.status.startsWith('REJECTED')).length +
        duplicateRegistrations.length +
        invalidRegistrations.length;

      await importRepository.setStatus(importRecord.id, 'COMPLETED', {
        processedRows: allRegistrations.length,
        acceptedRows: acceptedCount,
        waitlistedRows: waitlistedCount,
        rejectedRows: rejectedCount,
      });

      await auditService.log({
        eventType: 'IMPORT_COMPLETED',
        reasonCode: 'IMPORT_COMPLETED',
        message: `Import '${filename}' completed. Accepted: ${acceptedCount}, Waitlisted: ${waitlistedCount}, Rejected: ${rejectedCount}`,
        metadata: { importId: importRecord.id },
      });

      return {
        importId: importRecord.id,
        totalRows: parsed.totalRows,
        validRows: parsed.validRows.length,
        invalidRows: parsed.invalidRows.length,
        duplicateRows: parsed.duplicateRows.length,
        processedRows: allRegistrations.length,
        acceptedRows: acceptedCount,
        waitlistedRows: waitlistedCount,
        rejectedRows: rejectedCount,
        errors: parsed.errors,
      };
    } catch (err) {
      await importRepository.setStatus(importRecord.id, 'FAILED', {
        errorSummary: [err instanceof Error ? err.message : String(err)],
      });
      await auditService.log({
        eventType: 'IMPORT_FAILED',
        reasonCode: 'IMPORT_FAILED',
        message: `Import '${filename}' failed: ${err instanceof Error ? err.message : String(err)}`,
        metadata: { importId: importRecord.id },
      });
      throw err;
    }
  },
};