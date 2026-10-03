import { describe, it, expect } from 'vitest';
import { checkDuplicate, findDuplicatesInBatch } from '@/lib/engine/duplicate-detector';

describe('duplicate-detector', () => {
  it('flags duplicates when policy is REJECT', () => {
    const result = checkDuplicate(
      { studentId: 'S-1', sessionId: 'AI-01', timestamp: '2024-01-01T10:00:00Z', originalSequence: 2 },
      [{ id: 'r1', studentId: 'S-1', sessionId: 'AI-01', status: 'ACCEPTED', originalSequence: 1 }],
      'REJECT'
    );
    expect(result.isDuplicate).toBe(true);
  });

  it('allows duplicates when policy is ALLOW_MULTIPLE', () => {
    const result = checkDuplicate(
      { studentId: 'S-1', sessionId: 'AI-01', timestamp: '2024-01-01T10:00:00Z', originalSequence: 2 },
      [{ id: 'r1', studentId: 'S-1', sessionId: 'AI-01', status: 'ACCEPTED', originalSequence: 1 }],
      'ALLOW_MULTIPLE'
    );
    expect(result.isDuplicate).toBe(false);
  });

  it('ignores cancelled registrations', () => {
    const result = checkDuplicate(
      { studentId: 'S-1', sessionId: 'AI-01', timestamp: '2024-01-01T10:00:00Z', originalSequence: 2 },
      [{ id: 'r1', studentId: 'S-1', sessionId: 'AI-01', status: 'CANCELLED', originalSequence: 1 }],
      'REJECT'
    );
    expect(result.isDuplicate).toBe(false);
  });

  it('finds duplicates in batch', () => {
    const dupes = findDuplicatesInBatch([
      { studentId: 'S-1', sessionId: 'AI-01', timestamp: 'a', originalSequence: 1 },
      { studentId: 'S-2', sessionId: 'AI-01', timestamp: 'b', originalSequence: 2 },
      { studentId: 'S-1', sessionId: 'AI-01', timestamp: 'c', originalSequence: 3 },
    ]);
    expect(dupes.size).toBe(1);
    expect(dupes.get('S-1::AI-01')).toEqual([2]);
  });
});