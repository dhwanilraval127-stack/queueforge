export class EngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EngineError';
  }
}

export class ValidationError extends EngineError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class SessionNotFoundError extends EngineError {
  constructor(sessionId: string) {
    super(
      `Session '${sessionId}' not found`,
      'SESSION_NOT_FOUND',
      { sessionId }
    );
    this.name = 'SessionNotFoundError';
  }
}

export class DuplicateRegistrationError extends EngineError {
  constructor(studentId: string, sessionId: string) {
    super(
      `Student '${studentId}' is already registered for session '${sessionId}'`,
      'DUPLICATE_REGISTRATION',
      { studentId, sessionId }
    );
    this.name = 'DuplicateRegistrationError';
  }
}

export class CapacityReachedError extends EngineError {
  constructor(sessionId: string, capacity: number) {
    super(
      `Session '${sessionId}' has reached its capacity of ${capacity}`,
      'SESSION_CAPACITY_REACHED',
      { sessionId, capacity }
    );
    this.name = 'CapacityReachedError';
  }
}

export class RegistrationNotFoundError extends EngineError {
  constructor(registrationId: string) {
    super(
      `Registration '${registrationId}' not found`,
      'REGISTRATION_NOT_FOUND',
      { registrationId }
    );
    this.name = 'RegistrationNotFoundError';
  }
}

export class InvalidStateTransitionError extends EngineError {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      `Cannot transition from '${currentStatus}' to '${targetStatus}'`,
      'INVALID_STATE_TRANSITION',
      { currentStatus, targetStatus }
    );
    this.name = 'InvalidStateTransitionError';
  }
}