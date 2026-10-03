import { nanoid } from 'nanoid';

export function generateId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
}

export function registrationKey(studentId: string, sessionId: string): string {
  return `${studentId}::${sessionId}`;
}

export function deterministicRegistrationId(
  studentId: string,
  sessionId: string,
  importId: string
): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `reg_${safe(importId)}_${safe(studentId)}_${safe(sessionId)}`;
}