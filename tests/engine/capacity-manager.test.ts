import { describe, it, expect } from 'vitest';
import { checkCapacity, buildOccupancy, incrementAccepted, decrementAccepted } from '@/lib/engine/capacity-manager';

describe('capacity-manager', () => {
  it('reports capacity available', () => {
    const occ = buildOccupancy('s1', 10, 5, 0);
    const result = checkCapacity('s1', occ, 'WAITLIST');
    expect(result.hasCapacity).toBe(true);
  });

  it('reports capacity full', () => {
    const occ = buildOccupancy('s1', 5, 5, 0);
    const result = checkCapacity('s1', occ, 'WAITLIST');
    expect(result.hasCapacity).toBe(false);
  });

  it('increments and decrements correctly', () => {
    let occ = buildOccupancy('s1', 10, 5, 0);
    occ = incrementAccepted(occ);
    expect(occ.acceptedCount).toBe(6);
    expect(occ.availableSeats).toBe(4);
    occ = decrementAccepted(occ);
    expect(occ.acceptedCount).toBe(5);
    expect(occ.availableSeats).toBe(5);
  });
});