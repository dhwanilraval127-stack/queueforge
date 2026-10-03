import type { RegistrationStatus, DecisionTraceStep } from '@/types/registration';
import type { RuleSet } from '@/types/rules';

export interface EngineRegistrationInput {
  studentId: string;
  sessionId: string;
  timestamp: string;
  originalSequence: number;
}

export interface EngineSession {
  id: string;
  code: string;
  capacity: number;
  active: boolean;
}

export interface EngineExistingRegistration {
  id: string;
  studentId: string;
  sessionId: string;
  status: RegistrationStatus;
  queuePosition?: number;
  originalSequence: number;
}

export interface EngineDecision {
  status: RegistrationStatus;
  reasonCode: string;
  queuePosition?: number;
  trace: DecisionTraceStep[];
  metadata: Record<string, unknown>;
}

export interface EngineContext {
  sessions: Map<string, EngineSession>;
  existingRegistrations: EngineExistingRegistration[];
  rules: RuleSet;
  sessionOccupancy: Map<string, SessionOccupancy>;
}

export interface SessionOccupancy {
  sessionId: string;
  capacity: number;
  acceptedCount: number;
  waitlistCount: number;
  availableSeats: number;
}

export interface CancellationResult {
  cancelledRegistration: EngineExistingRegistration;
  promotedRegistration?: EngineExistingRegistration;
  updatedQueuePositions: Array<{ id: string; newPosition: number }>;
  trace: DecisionTraceStep[];
}

export interface BatchProcessResult {
  decisions: Array<{
    input: EngineRegistrationInput;
    decision: EngineDecision;
  }>;
  finalOccupancy: Map<string, SessionOccupancy>;
}