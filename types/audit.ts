export const AUDIT_EVENT_TYPES = [
  'REGISTRATION_ACCEPTED',
  'REGISTRATION_WAITLISTED',
  'REGISTRATION_CANCELLED',
  'REGISTRATION_REJECTED_DUPLICATE',
  'REGISTRATION_REJECTED_INVALID',
  'REGISTRATION_REJECTED_SESSION_NOT_FOUND',
  'REGISTRATION_REJECTED_CAPACITY_FULL',
  'WAITLIST_PROMOTED',
  'IMPORT_STARTED',
  'IMPORT_COMPLETED',
  'IMPORT_FAILED',
  'SESSION_CREATED',
  'SESSION_UPDATED',
  'RULE_CHANGED',
  'SIMULATION_CREATED',
  'SAMPLE_DATA_LOADED',
  'SAMPLE_DATA_CLEARED',
] as const;

export type AuditEventType = typeof AUDIT_EVENT_TYPES[number];

export interface AuditEvent {
  id: string;
  registrationId?: string;
  studentId?: string;
  sessionId?: string;
  eventType: AuditEventType;
  previousStatus?: string;
  newStatus?: string;
  reasonCode: string;
  message: string;
  metadata?: Record<string, unknown>;
  sequence?: number;
  createdAt: string;
}

export interface AuditEventInput {
  registrationId?: string;
  studentId?: string;
  sessionId?: string;
  eventType: AuditEventType;
  previousStatus?: string;
  newStatus?: string;
  reasonCode: string;
  message: string;
  metadata?: Record<string, unknown>;
  sequence?: number;
}