import type { EngineExistingRegistration, EngineRegistrationInput } from './types';
import type { DecisionTraceStep } from '@/types/registration';
import type { DuplicatePolicy } from '@/types/rules';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingRegistration?: EngineExistingRegistration;
  trace: DecisionTraceStep;
}

export function checkDuplicate(
  input: EngineRegistrationInput,
  existingRegistrations: EngineExistingRegistration[],
  policy: DuplicatePolicy
): DuplicateCheckResult {
  if (policy === 'ALLOW_MULTIPLE') {
    return {
      isDuplicate: false,
      trace: {
        step: 4,
        name: 'Duplicate check',
        result: 'PASS',
        detail: 'Multiple registrations allowed by policy',
      },
    };
  }

  const existing = existingRegistrations.find(
    (reg) =>
      reg.studentId === input.studentId &&
      reg.sessionId === input.sessionId &&
      reg.status !== 'CANCELLED' &&
      reg.status !== 'REJECTED_DUPLICATE' &&
      reg.status !== 'REJECTED_INVALID' &&
      reg.status !== 'REJECTED_SESSION_NOT_FOUND' &&
      reg.status !== 'REJECTED_CAPACITY_FULL'
  );

  if (existing) {
    return {
      isDuplicate: true,
      existingRegistration: existing,
      trace: {
        step: 4,
        name: 'Duplicate check',
        result: 'FAIL',
        detail: `Student '${input.studentId}' already has an active registration (${existing.status}) for session '${input.sessionId}'`,
      },
    };
  }

  return {
    isDuplicate: false,
    trace: {
      step: 4,
      name: 'Duplicate check',
      result: 'PASS',
      detail: 'No existing active registration found',
    },
  };
}

export function findDuplicatesInBatch(
  inputs: EngineRegistrationInput[]
): Map<string, number[]> {
  const seen = new Map<string, number[]>();

  inputs.forEach((input, index) => {
    const key = `${input.studentId}::${input.sessionId}`;
    const existing = seen.get(key) || [];
    existing.push(index);
    seen.set(key, existing);
  });

  const duplicates = new Map<string, number[]>();
  for (const [key, indices] of seen.entries()) {
    if (indices.length > 1) {
      duplicates.set(key, indices.slice(1));
    }
  }

  return duplicates;
}