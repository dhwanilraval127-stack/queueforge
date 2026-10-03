export type DuplicatePolicy = 'REJECT' | 'REPLACE' | 'ALLOW_MULTIPLE';
export type CapacityPolicy = 'STRICT' | 'WAITLIST' | 'OVERFLOW_REJECT';
export type CancellationPolicy = 'ALLOW_WITH_PROMOTION' | 'ALLOW_NO_PROMOTION' | 'DENY';
export type OrderingPolicy = 'FIFO' | 'LIFO' | 'TIMESTAMP' | 'ORIGINAL_SEQUENCE';

export interface RuleSet {
  id: string;
  name: string;
  waitlistEnabled: boolean;
  automaticPromotion: boolean;
  preserveOriginalOrder: boolean;
  duplicatePolicy: DuplicatePolicy;
  capacityPolicy: CapacityPolicy;
  cancellationPolicy: CancellationPolicy;
  orderingPolicy: OrderingPolicy;
  maxWaitlistSize?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RuleSetInput {
  name?: string;
  waitlistEnabled?: boolean;
  automaticPromotion?: boolean;
  preserveOriginalOrder?: boolean;
  duplicatePolicy?: DuplicatePolicy;
  capacityPolicy?: CapacityPolicy;
  cancellationPolicy?: CancellationPolicy;
  orderingPolicy?: OrderingPolicy;
  maxWaitlistSize?: number;
}

export const DEFAULT_RULE_SET: Omit<RuleSet, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Default Rules',
  waitlistEnabled: true,
  automaticPromotion: true,
  preserveOriginalOrder: true,
  duplicatePolicy: 'REJECT',
  capacityPolicy: 'WAITLIST',
  cancellationPolicy: 'ALLOW_WITH_PROMOTION',
  orderingPolicy: 'ORIGINAL_SEQUENCE',
  active: true,
};