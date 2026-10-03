import { sessionRepository } from '@/lib/repositories/session-repository';
import { registrationRepository } from '@/lib/repositories/registration-repository';
import { auditService } from './audit-service';
import type { Session, SessionWithStats } from '@/types/session';
import type { SessionInput, SessionUpdateInput } from '@/lib/validation/session-schema';

export const sessionService = {
  async list(): Promise<Session[]> {
    return sessionRepository.getAll();
  },

  async listWithStats(): Promise<SessionWithStats[]> {
    const sessions = await sessionRepository.getAll();
    const results = await Promise.all(
      sessions.map(async (s) => {
        const [acceptedCount, waitlistCount] = await Promise.all([
          registrationRepository.countBySessionIdAndStatus(s.id, 'ACCEPTED'),
          registrationRepository.countBySessionIdAndStatus(s.id, 'WAITLISTED'),
        ]);
        const availableSeats = Math.max(0, s.capacity - acceptedCount);
        const utilization = s.capacity > 0 ? (acceptedCount / s.capacity) * 100 : 0;
        return {
          ...s,
          acceptedCount,
          waitlistCount,
          availableSeats,
          utilization,
        };
      })
    );
    return results;
  },

  async get(id: string): Promise<Session | null> {
    return sessionRepository.getById(id);
  },

  async create(input: SessionInput): Promise<Session> {
    const session = await sessionRepository.create(input);
    await auditService.log({
      sessionId: session.id,
      eventType: 'SESSION_CREATED',
      reasonCode: 'SESSION_CREATED',
      message: `Session '${session.code}' created with capacity ${session.capacity}`,
      newStatus: session.active ? 'ACTIVE' : 'INACTIVE',
    });
    return session;
  },

  async update(id: string, updates: SessionUpdateInput): Promise<Session> {
    const existing = await sessionRepository.getById(id);
    if (!existing) throw new Error('Session not found');
    const session = await sessionRepository.update(id, updates);
    await auditService.log({
      sessionId: session.id,
      eventType: 'SESSION_UPDATED',
      reasonCode: 'SESSION_UPDATED',
      previousStatus: existing.active ? 'ACTIVE' : 'INACTIVE',
      newStatus: session.active ? 'ACTIVE' : 'INACTIVE',
      message: `Session '${session.code}' updated`,
      metadata: { updates },
    });
    return session;
  },
};