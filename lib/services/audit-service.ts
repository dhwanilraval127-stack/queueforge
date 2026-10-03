import { auditRepository } from '@/lib/repositories/audit-repository';
import type { AuditEventInput, AuditEvent } from '@/types/audit';
import type { AuditFilters } from '@/types/api';
import { logger } from '@/lib/utils/logger';

export const auditService = {
  async log(input: AuditEventInput): Promise<AuditEvent> {
    try {
      return await auditRepository.create(input);
    } catch (err) {
      logger.error('Failed to create audit event', {
        eventType: input.eventType,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },

  async logBatch(inputs: AuditEventInput[]): Promise<void> {
    try {
      await auditRepository.createBatch(inputs);
    } catch (err) {
      logger.error('Failed to create audit batch', {
        count: inputs.length,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },

  async list(filters: AuditFilters) {
    return auditRepository.list(filters);
  },

  async forRegistration(registrationId: string) {
    return auditRepository.getByRegistrationId(registrationId);
  },

  async recent(limit = 10) {
    return auditRepository.recent(limit);
  },
};