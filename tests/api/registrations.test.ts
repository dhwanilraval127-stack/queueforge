import { describe, it, expect } from 'vitest';
import { createRegistrationSchema, cancellationSchema, registrationFiltersSchema } from '@/lib/validation/registration-schema';

describe('registration validation schemas', () => {
  it('accepts valid registration input', () => {
    const parsed = createRegistrationSchema.safeParse({
      studentId: 'S-1',
      sessionId: 'AI-01',
      timestamp: '2024-01-01T10:00:00Z',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects missing student id', () => {
    const parsed = createRegistrationSchema.safeParse({
      studentId: '',
      sessionId: 'AI-01',
      timestamp: '2024-01-01T10:00:00Z',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts empty cancellation body', () => {
    expect(cancellationSchema.safeParse({}).success).toBe(true);
  });

  it('parses filter defaults', () => {
    const parsed = registrationFiltersSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(25);
  });
}); 