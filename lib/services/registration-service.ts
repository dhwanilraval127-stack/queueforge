import { sessionRepository } from '@/lib/repositories/session-repository';
import { registrationRepository } from '@/lib/repositories/registration-repository';
import { auditService } from './audit-service';
import { rulesRepository } from '@/lib/repositories/rules-repository';
import { RegistrationEngine } from '@/lib/engine/registration-engine';
import type { Registration, RegistrationDecision } from '@/types/registration';
import type { CreateRegistrationInput, RegistrationFiltersInput } from '@/lib/validation/registration-schema';
import { generateId, deterministicRegistrationId } from '@/lib/utils/id';
import { nowIso } from '@/lib/utils/date';
import { auditEventForDecision } from '@/lib/audit/audit-log';
import type { EngineSession } from '@/lib/engine/types';

export const registrationService = {
  async createOne(
    input: CreateRegistrationInput,
    sourceImportId?: string
  ): Promise<{ registration: Registration; decision: RegistrationDecision }> {
    const [sessions, existing, rules] = await Promise.all([
      sessionRepository.getAll(),
      registrationRepository.getAllForEngine(),
      rulesRepository.getActive(),
    ]);

    const engineSessions: EngineSession[] = sessions.map((s) => ({
      id: s.id,
      code: s.code,
      capacity: s.capacity,
      active: s.active,
    }));

    const engine = new RegistrationEngine(engineSessions, existing, rules);

    const originalSequence =
      (await registrationRepository.countAll()) + 1;

    const decision = engine.processRegistration({
      studentId: input.studentId,
      sessionId: input.sessionId,
      timestamp: input.timestamp,
      originalSequence,
    });

    const id = sourceImportId
      ? deterministicRegistrationId(input.studentId, input.sessionId, sourceImportId)
      : generateId('reg');

    const now = nowIso();
    const registration: Registration = {
      id,
      studentId: input.studentId,
      sessionId: input.sessionId,
      registeredAt: input.timestamp,
      originalSequence,
      status: decision.status,
      queuePosition: decision.queuePosition,
      reasonCode: decision.reasonCode,
      sourceImportId,
      createdAt: now,
      updatedAt: now,
    };

    await registrationRepository.create(registration);
    await auditService.log(
      auditEventForDecision(
        registration.id,
        decision,
        input.studentId,
        input.sessionId
      )
    );

    return {
      registration,
      decision: {
        status: decision.status,
        reasonCode: decision.reasonCode,
        queuePosition: decision.queuePosition,
        trace: decision.trace,
        metadata: decision.metadata,
      },
    };
  },

  async list(filters: RegistrationFiltersInput) {
    return registrationRepository.list(filters);
  },

  async getById(id: string): Promise<Registration | null> {
    return registrationRepository.getById(id);
  },

  async getTrace(id: string): Promise<{ registration: Registration | null; auditEvents: Awaited<ReturnType<typeof auditService.forRegistration>> }> {
    const [registration, auditEvents] = await Promise.all([
      registrationRepository.getById(id),
      auditService.forRegistration(id),
    ]);
    return { registration, auditEvents };
  },
};