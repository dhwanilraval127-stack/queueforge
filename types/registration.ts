export const REGISTRATION_STATUSES = [
  'ACCEPTED',
  'WAITLISTED',
  'CANCELLED',
  'REJECTED_DUPLICATE',
  'REJECTED_INVALID',
  'REJECTED_SESSION_NOT_FOUND',
  'REJECTED_CAPACITY_FULL',
] as const;

export type RegistrationStatus = typeof REGISTRATION_STATUSES[number];

export interface Registration {
  id: string;
  studentId: string;
  sessionId: string;
  registeredAt: string;
  originalSequence: number;
  status: RegistrationStatus;
  queuePosition?: number;
  reasonCode?: string;
  sourceImportId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationInput {
  studentId: string;
  sessionId: string;
  timestamp: string;
  originalSequence: number;
  sourceImportId?: string;
}

export interface RegistrationDecision {
  status: RegistrationStatus;
  reasonCode: string;
  queuePosition?: number;
  trace: DecisionTraceStep[];
  metadata?: Record<string, unknown>;
}

export interface DecisionTraceStep {
  step: number;
  name: string;
  result: 'PASS' | 'FAIL' | 'SKIP' | 'INFO';
  detail?: string;
}

export interface RegistrationWithDetails extends Registration {
  studentCode?: string;
  studentName?: string;
  sessionCode?: string;
  sessionName?: string;
}