import type { EngineExistingRegistration, SessionOccupancy } from './types';
import type { DecisionTraceStep } from '@/types/registration';
import type { RuleSet } from '@/types/rules';

export interface WaitlistEligibilityResult {
  eligible: boolean;
  queuePosition: number;
  trace: DecisionTraceStep;
}

export function checkWaitlistEligibility(
  sessionId: string,
  occupancy: SessionOccupancy,
  existingRegistrations: EngineExistingRegistration[],
  rules: RuleSet
): WaitlistEligibilityResult {
  if (!rules.waitlistEnabled) {
    return {
      eligible: false,
      queuePosition: 0,
      trace: {
        step: 6,
        name: 'Waitlist eligibility',
        result: 'FAIL',
        detail: 'Waitlist is disabled by current rules',
      },
    };
  }

  if (rules.maxWaitlistSize !== undefined && rules.maxWaitlistSize !== null) {
    const currentWaitlistCount = existingRegistrations.filter(
      (r) => r.sessionId === sessionId && r.status === 'WAITLISTED'
    ).length;

    if (currentWaitlistCount >= rules.maxWaitlistSize) {
      return {
        eligible: false,
        queuePosition: 0,
        trace: {
          step: 6,
          name: 'Waitlist eligibility',
          result: 'FAIL',
          detail: `Waitlist has reached maximum size of ${rules.maxWaitlistSize}`,
        },
      };
    }
  }

  const queuePosition = calculateNextQueuePosition(sessionId, existingRegistrations);

  return {
    eligible: true,
    queuePosition,
    trace: {
      step: 6,
      name: 'Waitlist eligibility',
      result: 'PASS',
      detail: `Eligible for waitlist at position #${String(queuePosition).padStart(2, '0')}`,
    },
  };
}

export function calculateNextQueuePosition(
  sessionId: string,
  existingRegistrations: EngineExistingRegistration[]
): number {
  const waitlisted = existingRegistrations.filter(
    (r) => r.sessionId === sessionId && r.status === 'WAITLISTED'
  );

  if (waitlisted.length === 0) return 1;

  const maxPosition = Math.max(
    ...waitlisted.map((r) => r.queuePosition || 0)
  );

  return maxPosition + 1;
}

export function getNextPromotionCandidate(
  sessionId: string,
  waitlistedRegistrations: EngineExistingRegistration[],
  rules: RuleSet
): EngineExistingRegistration | null {
  const sessionWaitlisted = waitlistedRegistrations.filter(
    (r) => r.sessionId === sessionId && r.status === 'WAITLISTED'
  );

  if (sessionWaitlisted.length === 0) return null;

  switch (rules.orderingPolicy) {
    case 'FIFO':
    case 'ORIGINAL_SEQUENCE':
      return sessionWaitlisted.sort(
        (a, b) => (a.queuePosition || 0) - (b.queuePosition || 0)
      )[0];

    case 'LIFO':
      return sessionWaitlisted.sort(
        (a, b) => (b.queuePosition || 0) - (a.queuePosition || 0)
      )[0];

    default:
      return sessionWaitlisted.sort(
        (a, b) => (a.queuePosition || 0) - (b.queuePosition || 0)
      )[0];
  }
}

export function recalculateQueuePositions(
  sessionId: string,
  registrations: EngineExistingRegistration[],
  rules: RuleSet
): Array<{ id: string; newPosition: number }> {
  const waitlisted = registrations
    .filter((r) => r.sessionId === sessionId && r.status === 'WAITLISTED')
    .sort((a, b) => {
      if (rules.orderingPolicy === 'ORIGINAL_SEQUENCE') {
        return a.originalSequence - b.originalSequence;
      }
      return (a.queuePosition || 0) - (b.queuePosition || 0);
    });

  return waitlisted.map((reg, index) => ({
    id: reg.id,
    newPosition: index + 1,
  }));
}