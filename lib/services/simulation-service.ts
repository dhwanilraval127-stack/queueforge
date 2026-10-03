import { sessionRepository } from '@/lib/repositories/session-repository';
import { registrationRepository } from '@/lib/repositories/registration-repository';
import { rulesRepository } from '@/lib/repositories/rules-repository';
import { RegistrationEngine } from '@/lib/engine/registration-engine';
import type { SimulationInput, SimulationResult, SimulationSnapshot, SimulationDifference } from '@/types/simulation';
import type { EngineSession, EngineExistingRegistration } from '@/lib/engine/types';
import { generateId } from '@/lib/utils/id';
import { nowIso } from '@/lib/utils/date';
import { processCancellation } from '@/lib/engine/cancellation-manager';
import { buildOccupancy } from '@/lib/engine/capacity-manager';
import { SessionNotFoundError } from '@/lib/engine/errors';

export const simulationService = {
  async simulate(input: SimulationInput): Promise<SimulationResult> {
    const [sessions, existing, rules] = await Promise.all([
      sessionRepository.getAll(),
      registrationRepository.getAllForEngine(),
      rulesRepository.getActive(),
    ]);

    const targetSession = input.sessionId
      ? sessions.find((s) => s.id === input.sessionId || s.code === input.sessionId)
      : undefined;

    if (input.sessionId && !targetSession) {
      throw new SessionNotFoundError(input.sessionId);
    }

    // Build current state snapshot
    const currentState = buildSnapshot(
      targetSession,
      sessions,
      existing
    );

    // Build simulated sessions
    const simulatedSessions: EngineSession[] = sessions.map((s) => {
      if (targetSession && s.id === targetSession.id) {
        return {
          id: s.id,
          code: s.code,
          capacity: input.capacityOverride ?? s.capacity,
          active: input.sessionActive ?? s.active,
        };
      }
      return {
        id: s.id,
        code: s.code,
        capacity: s.capacity,
        active: s.active,
      };
    });

    // Build simulated rules
    const simulatedRules = {
      ...rules,
      waitlistEnabled: input.waitlistEnabled ?? rules.waitlistEnabled,
    };

    // Deep copy existing
    let simulatedExisting: EngineExistingRegistration[] = existing.map((r) => ({ ...r }));

    // Apply cancellations
    if (input.cancellations && input.cancellations.length > 0) {
      for (const cancelId of input.cancellations) {
        const reg = simulatedExisting.find((r) => r.id === cancelId);
        if (!reg) continue;
        const session = simulatedSessions.find((s) => s.id === reg.sessionId);
        if (!session) continue;
        const acceptedCount = simulatedExisting.filter(
          (r) => r.sessionId === reg.sessionId && r.status === 'ACCEPTED'
        ).length;
        const waitlistCount = simulatedExisting.filter(
          (r) => r.sessionId === reg.sessionId && r.status === 'WAITLISTED'
        ).length;
        const occupancy = buildOccupancy(session.id, session.capacity, acceptedCount, waitlistCount);
        try {
          const result = processCancellation(reg, simulatedExisting, occupancy, simulatedRules);
          simulatedExisting = simulatedExisting.map((r) => {
            if (r.id === cancelId) return { ...r, status: 'CANCELLED' as const };
            if (result.promotedRegistration && r.id === result.promotedRegistration.id) {
              return { ...r, status: 'ACCEPTED' as const, queuePosition: undefined };
            }
            const posUpdate = result.updatedQueuePositions.find((p) => p.id === r.id);
            if (posUpdate) return { ...r, queuePosition: posUpdate.newPosition };
            return r;
          });
        } catch {
          // Ignore invalid cancellation in simulation
        }
      }
    }

    // Rebuild engine state after cancellations
    const activeSimulated = simulatedExisting.filter(
      (r) => r.status === 'ACCEPTED' || r.status === 'WAITLISTED'
    );

    const simEngine = new RegistrationEngine(simulatedSessions, activeSimulated, simulatedRules);

    // Apply additional registrations
    if (input.additionalRegistrations && input.additionalRegistrations.length > 0) {
      const base = existing.length + 1000; // high synthetic sequence
      input.additionalRegistrations.forEach((reg, idx) => {
        const decision = simEngine.processRegistration({
          studentId: reg.studentId,
          sessionId: reg.sessionId,
          timestamp: reg.timestamp,
          originalSequence: base + idx,
        });
        simulatedExisting.push({
          id: `sim_${idx}`,
          studentId: reg.studentId,
          sessionId: reg.sessionId,
          status: decision.status,
          queuePosition: decision.queuePosition,
          originalSequence: base + idx,
        });
      });
    }

    const simulatedState = buildSnapshot(
      targetSession,
      simulatedSessions.map((s) => ({ ...s, name: s.code, createdAt: '', updatedAt: '' })),
      simulatedExisting
    );

    const differences = buildDifferences(existing, simulatedExisting);

    return {
      id: generateId('sim'),
      input,
      currentState,
      simulatedState,
      differences,
      createdAt: nowIso(),
    };
  },
};

function buildSnapshot(
  targetSession: { id: string; capacity: number } | undefined,
  sessions: Array<{ id: string; capacity: number }>,
  registrations: EngineExistingRegistration[]
): SimulationSnapshot {
  const sessionId = targetSession?.id;
  const relevantRegs = sessionId
    ? registrations.filter((r) => r.sessionId === sessionId)
    : registrations;

  const accepted = relevantRegs.filter((r) => r.status === 'ACCEPTED').length;
  const waitlist = relevantRegs.filter((r) => r.status === 'WAITLISTED').length;

  const capacity = targetSession
    ? targetSession.capacity
    : sessions.reduce((sum, s) => sum + s.capacity, 0);

  return {
    sessionCapacity: capacity,
    acceptedCount: accepted,
    waitlistCount: waitlist,
    availableSeats: Math.max(0, capacity - accepted),
    utilization: capacity > 0 ? (accepted / capacity) * 100 : 0,
    registrations: relevantRegs.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      sessionId: r.sessionId,
      status: r.status,
      queuePosition: r.queuePosition,
    })),
  };
}

function buildDifferences(
  current: EngineExistingRegistration[],
  simulated: EngineExistingRegistration[]
): SimulationDifference[] {
  const diffs: SimulationDifference[] = [];
  const currentMap = new Map(current.map((r) => [r.id, r]));

  for (const sim of simulated) {
    const curr = currentMap.get(sim.id);
    if (!curr) {
      diffs.push({
        registrationId: sim.id,
        studentId: sim.studentId,
        currentStatus: 'N/A',
        simulatedStatus: sim.status,
        simulatedQueuePosition: sim.queuePosition,
        reason: 'New in simulation',
      });
      continue;
    }
    if (curr.status !== sim.status || curr.queuePosition !== sim.queuePosition) {
      diffs.push({
        registrationId: sim.id,
        studentId: sim.studentId,
        currentStatus: curr.status,
        simulatedStatus: sim.status,
        currentQueuePosition: curr.queuePosition,
        simulatedQueuePosition: sim.queuePosition,
        reason:
          curr.status !== sim.status
            ? `Status change: ${curr.status} -> ${sim.status}`
            : `Queue position change: #${curr.queuePosition} -> #${sim.queuePosition}`,
      });
    }
  }

  return diffs;
}