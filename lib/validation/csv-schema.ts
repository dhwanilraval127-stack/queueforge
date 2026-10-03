import { z } from 'zod';

export const csvRowSchema = z.object({
  student_id: z.string().min(1, 'student_id is required'),
  session_id: z.string().min(1, 'session_id is required'),
  timestamp: z.string().min(1, 'timestamp is required'),
});

export type CsvRowShape = z.infer<typeof csvRowSchema>;

export const REQUIRED_CSV_COLUMNS = ['student_id', 'session_id', 'timestamp'] as const;