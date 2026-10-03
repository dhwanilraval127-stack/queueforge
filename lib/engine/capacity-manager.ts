import type { SessionOccupancy } from './types';
import type { DecisionTraceStep } from '@/types/registration';
import type { CapacityPolicy } from '@/types/rules';

export interface CapacityCheckResult {
  hasCapacity: boolean;
  occupancy: SessionOccupancy;
  trace: DecisionTraceStep;
}

export function checkCapacity(
  sessionId: string,
  occupancy: SessionOccupancy,
  _policy: CapacityPolicy
): CapacityCheckResult {
  const hasCapacity = occupancy.acceptedCount < occupancy.capacity;

  return {
    hasCapacity,
    occupancy,
    trace: {
      step: 5,
      name: 'Capacity check',
      result: hasCapacity ? 'PASS' : 'FAIL',
      detail: hasCapacity
        ? `Session has ${occupancy.availableSeats} available seat(s) (${occupancy.acceptedCount}/${occupancy.capacity})`
        : `Session is at full capacity (${occupancy.acceptedCount}/${occupancy.capacity})`,
    },
  };
}

export function buildOccupancy(
  sessionId: string,
  capacity: number,
  acceptedCount: number,
  waitlistCount: number
): SessionOccupancy {
  return {
    sessionId,
    capacity,
    acceptedCount,
    waitlistCount,
    availableSeats: Math.max(0, capacity - acceptedCount),
  };
}

export function incrementAccepted(occupancy: SessionOccupancy): SessionOccupancy {
  return {
    ...occupancy,
    acceptedCount: occupancy.acceptedCount + 1,
    availableSeats: Math.max(0, occupancy.capacity - occupancy.acceptedCount - 1),
  };
}

export function decrementAccepted(occupancy: SessionOccupancy): SessionOccupancy {
  return {
    ...occupancy,
    acceptedCount: Math.max(0, occupancy.acceptedCount - 1),
    availableSeats: Math.min(occupancy.capacity, occupancy.availableSeats + 1),
  };
}

export function incrementWaitlist(occupancy: SessionOccupancy): SessionOccupancy {
  return {
    ...occupancy,
    waitlistCount: occupancy.waitlistCount + 1,
  };
}

export function decrementWaitlist(occupancy: SessionOccupancy): SessionOccupancy {
  return {
    ...occupancy,
    waitlistCount: Math.max(0, occupancy.waitlistCount - 1),
  };
}