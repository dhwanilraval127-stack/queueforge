import type {
  EngineExistingRegistration,
  SessionOccupancy,
  CancellationResult,
} from './types';
import type { DecisionTraceStep } from '@/types/registration';
import type { RuleSet } from '@/types/rules';
import { InvalidStateTransitionError } from './errors';
import { getNextPromotionCandidate, recalculateQueuePositions } from './waitlist-manager';
import { decrementAccepted, decrementWaitlist } from './capacity-manager';

export function processCancellation(
  registration: EngineExistingRegistration,
  allRegistrations: EngineExistingRegistration[],
  occupancy: SessionOccupancy,
  rules: RuleSet
): CancellationResult {
  const trace: DecisionTraceStep[] = [];

  // Validate state transition
  if (registration.status === 'CANCELLED') {
    throw new InvalidStateTransitionError('CANCELLED', 'CANCELLED');
  }

  if (
    registration.status !== 'ACCEPTED' &&
    registration.status !== 'WAITLISTED'
  ) {
    throw new InvalidStateTransitionError(registration.status, 'CANCELLED');
  }

  // Check cancellation policy
  if (rules.cancellationPolicy === 'DENY') {
    throw new InvalidStateTransitionError(registration.status, 'CANCELLED');
  }

  trace.push({
    step: 1,
    name: 'Cancellation validation',
    result: 'PASS',
    detail: `Registration ${registration.id} can be cancelled (current status: ${registration.status})`,
  });

  const wasAccepted = registration.status === 'ACCEPTED';
  const wasWaitlisted = registration.status === 'WAITLISTED';

  // Mark as cancelled
  const cancelledRegistration: EngineExistingRegistration = {
    ...registration,
    status: 'CANCELLED',
  };

  trace.push({
    step: 2,
    name: 'Status transition',
    result: 'PASS',
    detail: `${registration.status} -> CANCELLED`,
  });

  let updatedOccupancy = occupancy;
  let promotedRegistration: EngineExistingRegistration | undefined;
  let updatedQueuePositions: Array<{ id: string; newPosition: number }> = [];

  if (wasAccepted) {
    updatedOccupancy = decrementAccepted(occupancy);

    // Check for promotion
    if (
      rules.cancellationPolicy === 'ALLOW_WITH_PROMOTION' &&
      rules.automaticPromotion
    ) {
      const candidate = getNextPromotionCandidate(
        registration.sessionId,
        allRegistrations.filter((r) => r.id !== registration.id),
        rules
      );

      if (candidate) {
        promotedRegistration = {
          ...candidate,
          status: 'ACCEPTED',
          queuePosition: undefined,
        };

        trace.push({
          step: 3,
          name: 'Waitlist promotion',
          result: 'PASS',
          detail: `Promoted student '${candidate.studentId}' from waitlist position #${candidate.queuePosition}`,
        });

        // Recalculate positions excluding promoted
        const remainingRegistrations = allRegistrations
          .filter((r) => r.id !== registration.id && r.id !== candidate.id)
          .map((r) => ({ ...r }));

        updatedQueuePositions = recalculateQueuePositions(
          registration.sessionId,
          remainingRegistrations,
          rules
        );
      } else {
        trace.push({
          step: 3,
          name: 'Waitlist promotion',
          result: 'SKIP',
          detail: 'No waitlisted registrations to promote',
        });
      }
    }
  }

  if (wasWaitlisted) {
    updatedOccupancy = decrementWaitlist(occupancy);

    // Recalculate positions excluding cancelled
    const remainingRegistrations = allRegistrations
      .filter((r) => r.id !== registration.id)
      .map((r) => ({ ...r }));

    updatedQueuePositions = recalculateQueuePositions(
      registration.sessionId,
      remainingRegistrations,
      rules
    );

    trace.push({
      step: 3,
      name: 'Queue rebalance',
      result: 'PASS',
      detail: `Recalculated ${updatedQueuePositions.length} queue positions`,
    });
  }

  return {
    cancelledRegistration,
    promotedRegistration,
    updatedQueuePositions,
    trace,
  };
}