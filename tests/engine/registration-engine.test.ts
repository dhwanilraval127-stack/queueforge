import { describe, it, expect } from 'vitest';
import { RegistrationEngine } from '@/lib/engine/registration-engine';
import type { EngineSession } from '@/lib/engine/types';

const sessions: EngineSession[] = [
  { id: 'AI-01', code: 'AI-01', capacity: 2, active: true },
  { id: 'DS-02', code: 'DS-02', capacity: 1, active: true },
  { id: 'INACTIVE', code: 'INACTIVE', capacity: 10, active: false },
];

describe('RegistrationEngine - ACCEPTED', () => {
  it('accepts a registration when capacity is available', () => {
    const engine = new RegistrationEngine(sessions, []);
    const result = engine.processRegistration({
      studentId: 'S-1',
      sessionId: 'AI-01',
      timestamp: '2024-01-01T10:00:00Z',
      originalSequence: 1,
    });
    expect(result.status).toBe('ACCEPTED');
    expect(result.reasonCode).toBe('SEAT_AVAILABLE');
    expect(result.trace.length).toBeGreaterThan(0);
  });
});

describe('RegistrationEngine - DUPLICATE', () => {
  it('rejects duplicate registration', () => {
    const engine = new RegistrationEngine(sessions, [
      { id: 'r1', studentId: 'S-1', sessionId: 'AI-01', status: 'ACCEPTED', originalSequence: 1 },
    ]);
    const result = engine.processRegistration({
      studentId: 'S-1',
      sessionId: 'AI-01',
      timestamp: '2024-01-01T10:05:00Z',
      originalSequence: 2,
    });
    expect(result.status).toBe('REJECTED_DUPLICATE');
    expect(result.reasonCode).toBe('DUPLICATE_REGISTRATION');
  });
});

describe('RegistrationEngine - WAITLIST', () => {
  it('places registration on waitlist when session is full', () => {
    const engine = new RegistrationEngine(sessions, []);
    engine.processRegistration({ studentId: 'S-1', sessionId: 'DS-02', timestamp: '2024-01-01T10:00:00Z', originalSequence: 1 });
    const result = engine.processRegistration({ studentId: 'S-2', sessionId: 'DS-02', timestamp: '2024-01-01T10:01:00Z', originalSequence: 2 });
    expect(result.status).toBe('WAITLISTED');
    expect(result.queuePosition).toBe(1);
  });

  it('increments queue positions correctly', () => {
    const engine = new RegistrationEngine(sessions, []);
    engine.processRegistration({ studentId: 'S-1', sessionId: 'DS-02', timestamp: '2024-01-01T10:00:00Z', originalSequence: 1 });
    const r2 = engine.processRegistration({ studentId: 'S-2', sessionId: 'DS-02', timestamp: '2024-01-01T10:01:00Z', originalSequence: 2 });
    const r3 = engine.processRegistration({ studentId: 'S-3', sessionId: 'DS-02', timestamp: '2024-01-01T10:02:00Z', originalSequence: 3 });
    expect(r2.queuePosition).toBe(1);
    expect(r3.queuePosition).toBe(2);
  });
});

describe('RegistrationEngine - SESSION NOT FOUND', () => {
  it('rejects when session is unknown', () => {
    const engine = new RegistrationEngine(sessions, []);
    const result = engine.processRegistration({
      studentId: 'S-1',
      sessionId: 'MISSING',
      timestamp: '2024-01-01T10:00:00Z',
      originalSequence: 1,
    });
    expect(result.status).toBe('REJECTED_SESSION_NOT_FOUND');
  });

  it('rejects when session is inactive', () => {
    const engine = new RegistrationEngine(sessions, []);
    const result = engine.processRegistration({
      studentId: 'S-1',
      sessionId: 'INACTIVE',
      timestamp: '2024-01-01T10:00:00Z',
      originalSequence: 1,
    });
    expect(result.status).toBe('REJECTED_INVALID');
    expect(result.reasonCode).toBe('SESSION_INACTIVE');
  });
});

describe('RegistrationEngine - VALIDATION', () => {
  it('rejects invalid timestamp', () => {
    const engine = new RegistrationEngine(sessions, []);
    const result = engine.processRegistration({
      studentId: 'S-1',
      sessionId: 'AI-01',
      timestamp: 'not-a-date',
      originalSequence: 1,
    });
    expect(result.status).toBe('REJECTED_INVALID');
  });

  it('rejects empty student id', () => {
    const engine = new RegistrationEngine(sessions, []);
    const result = engine.processRegistration({
      studentId: '',
      sessionId: 'AI-01',
      timestamp: '2024-01-01T10:00:00Z',
      originalSequence: 1,
    });
    expect(result.status).toBe('REJECTED_INVALID');
  });
});

describe('RegistrationEngine - BATCH ORDER PRESERVATION', () => {
  it('processes batch in originalSequence order', () => {
    const engine = new RegistrationEngine(sessions, []);
    const result = engine.processBatch([
      { studentId: 'S-3', sessionId: 'DS-02', timestamp: '2024-01-01T10:02:00Z', originalSequence: 3 },
      { studentId: 'S-1', sessionId: 'DS-02', timestamp: '2024-01-01T10:00:00Z', originalSequence: 1 },
      { studentId: 'S-2', sessionId: 'DS-02', timestamp: '2024-01-01T10:01:00Z', originalSequence: 2 },
    ]);
    // S-1 (seq 1) must be ACCEPTED, S-2 (seq 2) waitlist #1, S-3 (seq 3) waitlist #2
    const s1 = result.decisions.find((d) => d.input.studentId === 'S-1')!;
    const s2 = result.decisions.find((d) => d.input.studentId === 'S-2')!;
    const s3 = result.decisions.find((d) => d.input.studentId === 'S-3')!;
    expect(s1.decision.status).toBe('ACCEPTED');
    expect(s2.decision.status).toBe('WAITLISTED');
    expect(s2.decision.queuePosition).toBe(1);
    expect(s3.decision.status).toBe('WAITLISTED');
    expect(s3.decision.queuePosition).toBe(2);
  });
});

describe('RegistrationEngine - RULES', () => {
  it('rejects when waitlist is disabled and capacity reached', () => {
    const engine = new RegistrationEngine(
      sessions,
      [{ id: 'r1', studentId: 'S-A', sessionId: 'DS-02', status: 'ACCEPTED', originalSequence: 1 }],
      { waitlistEnabled: false }
    );
    const result = engine.processRegistration({
      studentId: 'S-B',
      sessionId: 'DS-02',
      timestamp: '2024-01-01T10:00:00Z',
      originalSequence: 2,
    });
    expect(result.status).toBe('REJECTED_CAPACITY_FULL');
  });

  it('respects max waitlist size', () => {
    const engine = new RegistrationEngine(
      sessions,
      [
        { id: 'a', studentId: 'S-A', sessionId: 'DS-02', status: 'ACCEPTED', originalSequence: 1 },
        { id: 'b', studentId: 'S-B', sessionId: 'DS-02', status: 'WAITLISTED', queuePosition: 1, originalSequence: 2 },
      ],
      { maxWaitlistSize: 1 }
    );
    const result = engine.processRegistration({
      studentId: 'S-C',
      sessionId: 'DS-02',
      timestamp: '2024-01-01T10:00:00Z',
      originalSequence: 3,
    });
    expect(result.status).toBe('REJECTED_CAPACITY_FULL');
  });
});