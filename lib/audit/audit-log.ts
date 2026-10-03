import type { AuditEventInput, AuditEventType } from '@/types/audit';
import type { RegistrationStatus } from '@/types/registration';
import type { EngineDecision } from '@/lib/engine/types';

export function auditEventForDecision(
  registrationId: string,
  decision: EngineDecision,
  studentId: string,
  sessionId: string,
  previousStatus?: string
): AuditEventInput {
  const eventType = eventTypeForStatus(decision.status);
  return {
    registrationId,
    studentId,
    sessionId,
    eventType,
    previousStatus,
    newStatus: decision.status,
    reasonCode: decision.reasonCode,
    message: buildMessage(decision),
    metadata: {
      queuePosition: decision.queuePosition,
      ...decision.metadata,
    },
  };
}

export function auditEventForCancellation(
  registrationId: string,
  studentId: string,
  sessionId: string,
  previousStatus: RegistrationStatus,
  reason?: string
): AuditEventInput {
  return {
    registrationId,
    studentId,
    sessionId,
    eventType: 'REGISTRATION_CANCELLED',
    previousStatus,
    newStatus: 'CANCELLED',
    reasonCode: 'USER_CANCELLATION',
    message: reason || `Registration cancelled (was ${previousStatus})`,
  };
}

export function auditEventForPromotion(
  registrationId: string,
  studentId: string,
  sessionId: string,
  previousQueuePosition?: number
): AuditEventInput {
  return {
    registrationId,
    studentId,
    sessionId,
    eventType: 'WAITLIST_PROMOTED',
    previousStatus: 'WAITLISTED',
    newStatus: 'ACCEPTED',
    reasonCode: 'PROMOTED_FROM_WAITLIST',
    message: `Promoted from waitlist position #${previousQueuePosition ?? '?'}`,
    metadata: { previousQueuePosition },
  };
}

function eventTypeForStatus(status: RegistrationStatus): AuditEventType {
  switch (status) {
    case 'ACCEPTED':
      return 'REGISTRATION_ACCEPTED';
    case 'WAITLISTED':
      return 'REGISTRATION_WAITLISTED';
    case 'CANCELLED':
      return 'REGISTRATION_CANCELLED';
    case 'REJECTED_DUPLICATE':
      return 'REGISTRATION_REJECTED_DUPLICATE';
    case 'REJECTED_INVALID':
      return 'REGISTRATION_REJECTED_INVALID';
    case 'REJECTED_SESSION_NOT_FOUND':
      return 'REGISTRATION_REJECTED_SESSION_NOT_FOUND';
    case 'REJECTED_CAPACITY_FULL':
      return 'REGISTRATION_REJECTED_CAPACITY_FULL';
  }
}

function buildMessage(decision: EngineDecision): string {
  const parts = [`Decision: ${decision.status}`, `Reason: ${decision.reasonCode}`];
  if (decision.queuePosition) {
    parts.push(`Queue position: #${decision.queuePosition}`);
  }
  return parts.join(' | ');
}