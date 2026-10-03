import type { RegistrationDecision } from './registration';

export interface SimulationInput {
  sessionId?: string;
  capacityOverride?: number;
  waitlistEnabled?: boolean;
  additionalRegistrations?: Array<{
    studentId: string;
    sessionId: string;
    timestamp: string;
  }>;
  cancellations?: string[];
  sessionActive?: boolean;
}

export interface SimulationResult {
  id: string;
  input: SimulationInput;
  currentState: SimulationSnapshot;
  simulatedState: SimulationSnapshot;
  differences: SimulationDifference[];
  createdAt: string;
}

export interface SimulationSnapshot {
  sessionCapacity: number;
  acceptedCount: number;
  waitlistCount: number;
  availableSeats: number;
  utilization: number;
  registrations: SimulatedRegistration[];
}

export interface SimulatedRegistration {
  id: string;
  studentId: string;
  sessionId: string;
  status: string;
  queuePosition?: number;
  decision?: RegistrationDecision;
}

export interface SimulationDifference {
  registrationId: string;
  studentId: string;
  currentStatus: string;
  simulatedStatus: string;
  currentQueuePosition?: number;
  simulatedQueuePosition?: number;
  reason: string;
}