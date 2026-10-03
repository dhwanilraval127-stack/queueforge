import { describe, it, expect } from 'vitest';
import { getEffectiveRules, validateRules } from '@/lib/engine/rule-engine';

describe('rule-engine', () => {
  it('returns default rules when none provided', () => {
    const rules = getEffectiveRules();
    expect(rules.waitlistEnabled).toBe(true);
    expect(rules.duplicatePolicy).toBe('REJECT');
  });

  it('merges partial rules with defaults', () => {
    const rules = getEffectiveRules({ waitlistEnabled: false });
    expect(rules.waitlistEnabled).toBe(false);
    expect(rules.duplicatePolicy).toBe('REJECT');
  });

  it('warns about inconsistent rules', () => {
    const errors = validateRules(getEffectiveRules({ waitlistEnabled: false }));
    expect(errors.length).toBeGreaterThan(0);
  });
});