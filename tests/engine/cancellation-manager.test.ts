import { describe, it, expect } from 'vitest';
import { processCancellation } from '@/lib/engine/cancellation-manager';
import { getEffectiveRules } from '@/lib/engine/rule-engine';
import { buildOccupancy } from '@/lib/engine/capacity-manager';
import type { EngineExistingRegistration } from '@/lib/engine/types';

describe('Cancellation manager', () => {
  it('cancels and promotes next in queue (FIFO)', () => {
    const regs: EngineExistingRegistration[] = [
      { id: 'r1', studentId: 'S-1', sessionId: 'AI-01', status: 'ACCEPTED', originalSequence: 1 },
      { id: 'r2', studentId: 'S-2', sessionId: 'AI-01', status: 'WAITLISTED', queuePosition: 1, originalSequence: 2 },
      { id: 'r3', studentId: 'S-3', sessionId: 'AI-01', status: 'WAITLISTED', queuePosition: 2, originalSequence: 3 },
    ];
    const occ = buildOccupancy('AI-01', 1, 1, 2);
    const rules = getEffectiveRules();
    const result = processCancellation(regs[0]!, regs, occ, rules);

    expect(result.cancelledRegistration.status).toBe('CANCELLED');
    expect(result.promotedRegistration?.id).toBe('r2');
    expect(result.promotedRegistration?.status).toBe('ACCEPTED');
    expect(result.updatedQueuePositions).toContainEqual({ id: 'r3', newPosition: 1 });
  });

  it('cancels waitlisted registration and rebalances queue', () => {
    const regs: EngineExistingRegistration[] = [
      { id: 'r1', studentId: 'S-1', sessionId: 'AI-01', status: 'ACCEPTED', originalSequence: 1 },
      { id: 'r2', studentId: 'S-2', sessionId: 'AI-01', status: 'WAITLISTED', queuePosition: 1, originalSequence: 2 },
      { id: 'r3', studentId: 'S-3', sessionId: 'AI-01', status: 'WAITLISTED', queuePosition: 2, originalSequence: 3 },
    ];
    const occ = buildOccupancy('AI-01', 1, 1, 2);
    const rules = getEffectiveRules();
    const result = processCancellation(regs[1]!, regs, occ, rules);

    expect(result.cancelledRegistration.status).toBe('CANCELLED');
    expect(result.promotedRegistration).toBeUndefined();
    expect(result.updatedQueuePositions).toContainEqual({ id: 'r3', newPosition: 1 });
  });

  it('throws when cancelling already cancelled', () => {
    const reg: EngineExistingRegistration = {
      id: 'r1', studentId: 'S-1', sessionId: 'AI-01', status: 'CANCELLED', originalSequence: 1,
    };
    expect(() => processCancellation(reg, [reg], buildOccupancy('AI-01', 1, 0, 0), getEffectiveRules())).toThrow();
  });
});