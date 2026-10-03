import { z } from 'zod';

export const sessionInputSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Za-z0-9_-]+$/, 'Code must be alphanumeric with - or _'),
  name: z.string().min(1).max(200),
  capacity: z.number().int().min(0).max(100000),
  active: z.boolean().optional().default(true),
});

export const sessionUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  capacity: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
});

export type SessionInput = z.infer<typeof sessionInputSchema>;
export type SessionUpdateInput = z.infer<typeof sessionUpdateSchema>;