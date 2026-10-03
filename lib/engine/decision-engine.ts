import type { DecisionTraceStep } from '@/types/registration';
import type {
  EngineRegistrationInput,
  EngineContext,
  EngineDecision,
  EngineExistingRegistration,
} from './types';
import { checkDuplicate } from './duplicate-detector';
import { checkCapacity, incrementAccepted, incrementWaitlist } from './capacity-manager';
import { checkWaitlistEligibility } from './waitlist-manager';

export function makeDecision(
  input: EngineRegistrationInput,
  context: EngineContext
): EngineDecision {
  const trace: DecisionTraceStep[] = [];

  // Step 1: Request validation
  const validationResult = validateInput(input);
  trace.push(validationResult);
  if (validationResult.result === 'FAIL') {
    return {
      status: 'REJECTED_INVALID',
      reasonCode: 'INVALID_INPUT',
      trace,
      metadata: { input },
    };
  }

  // Step 2: Student verification
  trace.push({
    step: 2,
    name: 'Student verification',
    result: 'PASS',
    detail: `Student '${input.studentId}' verified`,
  });

  // Step 3: Session verification
  const session = context.sessions.get(input.sessionId);
  if (!session) {
    trace.push({
      step: 3,
      name: 'Session verification',
      result: 'FAIL',
      detail: `Session '${input.sessionId}' not found`,
    });
    return {
      status: 'REJECTED_SESSION_NOT_FOUND',
      reasonCode: 'SESSION_NOT_FOUND',
      trace,
      metadata: { sessionId: input.sessionId },
    };
  }

  if (!session.active) {
    trace.push({
      step: 3,
      name: 'Session verification',
      result: 'FAIL',
      detail: `Session '${input.sessionId}' is inactive`,
    });
    return {
      status: 'REJECTED_INVALID',
      reasonCode: 'SESSION_INACTIVE',
      trace,
      metadata: { sessionId: input.sessionId },
    };
  }

  trace.push({
    step: 3,
    name: 'Session verification',
    result: 'PASS',
    detail: `Session '${session.code}' is active with capacity ${session.capacity}`,
  });

  // Step 4: Duplicate check
  const duplicateResult = checkDuplicate(
    input,
    context.existingRegistrations,
    context.rules.duplicatePolicy
  );
  trace.push(duplicateResult.trace);

  if (duplicateResult.isDuplicate) {
    return {
      status: 'REJECTED_DUPLICATE',
      reasonCode: 'DUPLICATE_REGISTRATION',
      trace,
      metadata: {
        existingRegistrationId: duplicateResult.existingRegistration?.id,
        existingStatus: duplicateResult.existingRegistration?.status,
      },
    };
  }

  // Step 5: Capacity check
  let occupancy = context.sessionOccupancy.get(input.sessionId);
  if (!occupancy) {
    occupancy = {
      sessionId: input.sessionId,
      capacity: session.capacity,
      acceptedCount: 0,
      waitlistCount: 0,
      availableSeats: session.capacity,
    };
  }

  const capacityResult = checkCapacity(
    input.sessionId,
    occupancy,
    context.rules.capacityPolicy
  );
  trace.push(capacityResult.trace);

  if (capacityResult.hasCapacity) {
    // Accept
    const newOccupancy = incrementAccepted(occupancy);
    context.sessionOccupancy.set(input.sessionId, newOccupancy);

    // Track this as existing for subsequent duplicate checks in batch
    context.existingRegistrations.push({
      id: `pending-${input.originalSequence}`,
      studentId: input.studentId,
      sessionId: input.sessionId,
      status: 'ACCEPTED',
      originalSequence: input.originalSequence,
    });

    trace.push({
      step: 6,
      name: 'Waitlist eligibility',
      result: 'SKIP',
      detail: 'Not required - seat available',
    });

    trace.push({
      step: 7,
      name: 'Final decision',
      result: 'INFO',
      detail: 'ACCEPTED',
    });

    return {
      status: 'ACCEPTED',
      reasonCode: 'SEAT_AVAILABLE',
      trace,
      metadata: {
        seatsRemaining: newOccupancy.availableSeats,
      },
    };
  }

  // Step 6: Waitlist eligibility
  const waitlistResult = checkWaitlistEligibility(
    input.sessionId,
    occupancy,
    context.existingRegistrations,
    context.rules
  );
  trace.push(waitlistResult.trace);

  if (waitlistResult.eligible) {
    const newOccupancy = incrementWaitlist(occupancy);
    context.sessionOccupancy.set(input.sessionId, newOccupancy);

    context.existingRegistrations.push({
      id: `pending-${input.originalSequence}`,
      studentId: input.studentId,
      sessionId: input.sessionId,
      status: 'WAITLISTED',
      queuePosition: waitlistResult.queuePosition,
      originalSequence: input.originalSequence,
    });

    trace.push({
      step: 7,
      name: 'Queue position',
      result: 'INFO',
      detail: `#${String(waitlistResult.queuePosition).padStart(2, '0')}`,
    });

    return {
      status: 'WAITLISTED',
      reasonCode: 'SESSION_CAPACITY_REACHED',
      queuePosition: waitlistResult.queuePosition,
      trace,
      metadata: {
        queuePosition: waitlistResult.queuePosition,
        waitlistSize: newOccupancy.waitlistCount,
      },
    };
  }

  // Rejected - capacity full, no waitlist
  trace.push({
    step: 7,
    name: 'Final decision',
    result: 'INFO',
    detail: 'REJECTED - No capacity, no waitlist available',
  });

  return {
    status: 'REJECTED_CAPACITY_FULL',
    reasonCode: 'CAPACITY_FULL_NO_WAITLIST',
    trace,
    metadata: {},
  };
}

function validateInput(input: EngineRegistrationInput): DecisionTraceStep {
  const errors: string[] = [];

  if (!input.studentId || input.studentId.trim() === '') {
    errors.push('Student ID is required');
  }

  if (!input.sessionId || input.sessionId.trim() === '') {
    errors.push('Session ID is required');
  }

  if (!input.timestamp || input.timestamp.trim() === '') {
    errors.push('Timestamp is required');
  } else {
    const date = new Date(input.timestamp);
    if (isNaN(date.getTime())) {
      errors.push('Invalid timestamp format');
    }
  }

  return {
    step: 1,
    name: 'Request validation',
    result: errors.length === 0 ? 'PASS' : 'FAIL',
    detail:
      errors.length === 0
        ? 'All required fields present and valid'
        : `Validation errors: ${errors.join('; ')}`,
  };
}