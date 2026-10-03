import { z } from 'zod';

export const simulationInputSchema = z.object({
  sessionId: z.string().optional(),
  capacityOverride: z.number().int().min(0).max(100000).optional(),
  waitlistEnabled: z.boolean().optional(),
  additionalRegistrations: z
    .array(
      z.object({
        studentId: z.string().min(1),
        sessionId: z.string().min(1),
        timestamp: z.string().min(1),
      })
    )
    .optional(),
  cancellations: z.array(z.string()).optional(),
  sessionActive: z.boolean().optional(),
});

export type SimulationInputData = z.infer<typeof simulationInputSchema>;