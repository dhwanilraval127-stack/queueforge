import { z } from 'zod';

export const ruleSetUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  waitlistEnabled: z.boolean().optional(),
  automaticPromotion: z.boolean().optional(),
  preserveOriginalOrder: z.boolean().optional(),
  duplicatePolicy: z.enum(['REJECT', 'REPLACE', 'ALLOW_MULTIPLE']).optional(),
  capacityPolicy: z.enum(['STRICT', 'WAITLIST', 'OVERFLOW_REJECT']).optional(),
  cancellationPolicy: z.enum(['ALLOW_WITH_PROMOTION', 'ALLOW_NO_PROMOTION', 'DENY']).optional(),
  orderingPolicy: z.enum(['FIFO', 'LIFO', 'TIMESTAMP', 'ORIGINAL_SEQUENCE']).optional(),
  maxWaitlistSize: z.number().int().min(0).max(100000).optional().nullable(),
});

export type RuleSetUpdateInput = z.infer<typeof ruleSetUpdateSchema>;