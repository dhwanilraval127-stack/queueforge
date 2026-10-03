import { describe, it, expect } from 'vitest';
import { calculateNextQueuePosition, getNextPromotionCandidate, recalculateQueuePositions } from '@/lib/engine/waitlist-manager';
import { getEffectiveRules } from '@/lib/engine/rule-engine';
import type { EngineExistingRegistration } from '@/lib/engine/types';

describe('waitlist-manager', () => {
  it('calculates next queue position as 1 when empty', () => {
    expect(calculateNextQueuePosition('s1', [])).toBe(1);
  });

  it('calculates next position based on max existing', () => {
    const regs: EngineExistingRegistration[] = [
      { id: 'r1', studentId: 'S-1', sessionId: 's1', status: 'WAITLISTED', queuePosition: 1, originalSequence: 1 },
      { id: 'r2', studentId: 'S-2', sessionId: 's1', status: 'WAITLISTED', queuePosition: 2, originalSequence: 2 },
    ];
    expect(calculateNextQueuePosition('s1', regs)).toBe(3);
  });

  it('selects next FIFO candidate for promotion', () => {
    const regs: EngineExistingRegistration[] = [
      { id: 'r2', studentId: 'S-2', sessionId: 's1', status: 'WAITLISTED', queuePosition: 2, originalSequence: 2 },
      { id: 'r1', studentId: 'S-1', sessionId: 's1', status: 'WAITLISTED', queuePosition: 1, originalSequence: 1 },
    ];
    const candidate = getNextPromotionCandidate('s1', regs, getEffectiveRules());
    expect(candidate?.id).toBe('r1');
  });

  it('recalculates positions after removal', () => {
    const regs: EngineExistingRegistration[] = [
      { id: 'r1', studentId: 'S-1', sessionId: 's1', status: 'WAITLISTED', queuePosition: 2, originalSequence: 2 },
      { id: 'r2', studentId: 'S-2', sessionId: 's1', status: 'WAITLISTED', queuePosition: 3, originalSequence: 3 },
    ];
    const positions = recalculateQueuePositions('s1', regs, getEffectiveRules());
    expect(positions).toEqual([
      { id: 'r1', newPosition: 1 },
      { id: 'r2', newPosition: 2 },
    ]);
  });
});