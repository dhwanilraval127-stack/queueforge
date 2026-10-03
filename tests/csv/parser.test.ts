import { describe, it, expect } from 'vitest';
import { parseCsvText } from '@/lib/csv/parser';

describe('csv parser', () => {
  it('reports empty CSV', () => {
    const result = parseCsvText('');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('reports missing columns', () => {
    const result = parseCsvText('foo,bar\n1,2');
    expect(result.errors[0]).toMatch(/Missing required columns/);
  });

  it('parses valid rows', () => {
    const csv = `student_id,session_id,timestamp
S-1,AI-01,2024-01-01T10:00:00Z
S-2,AI-01,2024-01-01T10:01:00Z`;
    const result = parseCsvText(csv);
    expect(result.validRows.length).toBe(2);
    expect(result.invalidRows.length).toBe(0);
  });

  it('detects duplicates in batch', () => {
    const csv = `student_id,session_id,timestamp
S-1,AI-01,2024-01-01T10:00:00Z
S-1,AI-01,2024-01-01T10:01:00Z`;
    const result = parseCsvText(csv);
    expect(result.validRows.length).toBe(1);
    expect(result.duplicateRows.length).toBe(1);
  });

  it('flags invalid timestamps', () => {
    const csv = `student_id,session_id,timestamp
S-1,AI-01,bogus`;
    const result = parseCsvText(csv);
    expect(result.invalidRows.length).toBe(1);
  });

  it('flags unknown sessions when known set provided', () => {
    const csv = `student_id,session_id,timestamp
S-1,AI-01,2024-01-01T10:00:00Z
S-2,ZZZ,2024-01-01T10:01:00Z`;
    const result = parseCsvText(csv, { knownSessionIds: new Set(['AI-01']) });
    expect(result.unknownSessionRows.length).toBe(1);
  });
});