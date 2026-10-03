import type { RuleSet } from '@/types/rules';
import { DEFAULT_RULE_SET } from '@/types/rules';

export function getEffectiveRules(ruleSet?: Partial<RuleSet>): RuleSet {
  const now = new Date().toISOString();
  return {
    id: ruleSet?.id || 'default',
    name: ruleSet?.name || DEFAULT_RULE_SET.name,
    waitlistEnabled:
      ruleSet?.waitlistEnabled ?? DEFAULT_RULE_SET.waitlistEnabled,
    automaticPromotion:
      ruleSet?.automaticPromotion ?? DEFAULT_RULE_SET.automaticPromotion,
    preserveOriginalOrder:
      ruleSet?.preserveOriginalOrder ?? DEFAULT_RULE_SET.preserveOriginalOrder,
    duplicatePolicy:
      ruleSet?.duplicatePolicy || DEFAULT_RULE_SET.duplicatePolicy,
    capacityPolicy:
      ruleSet?.capacityPolicy || DEFAULT_RULE_SET.capacityPolicy,
    cancellationPolicy:
      ruleSet?.cancellationPolicy || DEFAULT_RULE_SET.cancellationPolicy,
    orderingPolicy:
      ruleSet?.orderingPolicy || DEFAULT_RULE_SET.orderingPolicy,
    maxWaitlistSize: ruleSet?.maxWaitlistSize,
    active: ruleSet?.active ?? true,
    createdAt: ruleSet?.createdAt || now,
    updatedAt: ruleSet?.updatedAt || now,
  };
}

export function validateRules(rules: RuleSet): string[] {
  const errors: string[] = [];

  if (!rules.waitlistEnabled && rules.capacityPolicy === 'WAITLIST') {
    errors.push(
      'Waitlist is disabled but capacity policy is set to WAITLIST. Overflow registrations will be rejected.'
    );
  }

  if (!rules.automaticPromotion && rules.cancellationPolicy === 'ALLOW_WITH_PROMOTION') {
    errors.push(
      'Automatic promotion is disabled but cancellation policy includes promotion. Promotions will not occur automatically.'
    );
  }

  if (
    typeof rules.maxWaitlistSize === 'number' &&
    rules.maxWaitlistSize < 0
  ) {
    errors.push('Max waitlist size cannot be negative.');
  }

  return errors;
}