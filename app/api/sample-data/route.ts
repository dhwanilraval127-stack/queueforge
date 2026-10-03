import { sessionRepository } from '@/lib/repositories/session-repository';
import { registrationRepository } from '@/lib/repositories/registration-repository';
import { importService } from '@/lib/services/import-service';
import { auditService } from '@/lib/services/audit-service';
import { successResponse, handleApiError } from '@/lib/utils/response';
import { SAMPLE_IMPORT_ID } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';

const SAMPLE_SESSIONS = [
  { code: 'AI-01', name: 'Intro to AI', capacity: 5 },
  { code: 'DS-02', name: 'Data Structures', capacity: 4 },
  { code: 'WEB-03', name: 'Web Development', capacity: 6 },
];

function buildSampleCsv(): string {
  const now = new Date();
  const rows: string[] = ['student_id,session_id,timestamp'];
  const makeTime = (minutesOffset: number) =>
    new Date(now.getTime() + minutesOffset * 60_000).toISOString();

  // AI-01 (cap 5): 7 registrations -> 5 accepted + 2 waitlisted
  for (let i = 1; i <= 7; i++) {
    rows.push(`S-${1000 + i},AI-01,${makeTime(i)}`);
  }
  // DS-02 (cap 4): 4 accepted
  for (let i = 1; i <= 4; i++) {
    rows.push(`S-${2000 + i},DS-02,${makeTime(10 + i)}`);
  }
  // WEB-03 (cap 6): 5 accepted, 1 duplicate
  for (let i = 1; i <= 5; i++) {
    rows.push(`S-${3000 + i},WEB-03,${makeTime(20 + i)}`);
  }
  rows.push(`S-3001,WEB-03,${makeTime(26)}`); // duplicate
  // Unknown session (will be rejected)
  rows.push(`S-9999,UNKNOWN-X,${makeTime(30)}`);
  return rows.join('\n');
}

export async function POST() {
  try {
    // Upsert sample sessions
    for (const s of SAMPLE_SESSIONS) {
      await sessionRepository.upsertByCode({
        code: s.code,
        name: s.name,
        capacity: s.capacity,
        active: true,
      });
    }

    const csv = buildSampleCsv();
    const result = await importService.importCsv('sample-data.csv', csv);

    await auditService.log({
      eventType: 'SAMPLE_DATA_LOADED',
      reasonCode: 'SAMPLE_DATA',
      message: 'Sample data loaded',
      metadata: { importId: result.importId },
    });

    return successResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE() {
  try {
    // Clear sample imports — identify them by filename pattern
    const sessionDocs = await sessionRepository.getAll();
    const sampleCodes = SAMPLE_SESSIONS.map((s) => s.code);
    const sampleSessions = sessionDocs.filter((s) => sampleCodes.includes(s.code));

    let deleted = 0;
    // Delete registrations whose session is one of the sample sessions
    for (const session of sampleSessions) {
      const regs = await registrationRepository.getBySessionId(session.id);
      for (const reg of regs) {
        if (reg.sourceImportId) {
          deleted += await registrationRepository.deleteBySourceImport(reg.sourceImportId);
          break;
        }
      }
    }

    await auditService.log({
      eventType: 'SAMPLE_DATA_CLEARED',
      reasonCode: 'SAMPLE_DATA',
      message: `Sample data cleared (${deleted} registrations removed)`,
    });

    return successResponse({ deleted });
  } catch (err) {
    return handleApiError(err);
  }
}