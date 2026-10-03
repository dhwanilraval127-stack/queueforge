import { z } from 'zod';

export const createRegistrationSchema = z.object({
  studentId: z.string().min(1).max(100),
  sessionId: z.string().min(1).max(100),
  timestamp: z.string().min(1),
});

export const cancellationSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const registrationFiltersSchema = z.object({
  status: z.string().optional(),
  sessionId: z.string().optional(),
  studentId: z.string().optional(),
  search: z.string().optional(),
  importId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type CancellationInput = z.infer<typeof cancellationSchema>;
export type RegistrationFiltersInput = z.infer<typeof registrationFiltersSchema>;