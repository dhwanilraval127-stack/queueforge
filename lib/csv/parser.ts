import Papa from 'papaparse';
import type { ParsedCsvRow, CsvValidationResult } from '@/types/import';
import { REQUIRED_CSV_COLUMNS } from '@/lib/validation/csv-schema';
import { parseTimestamp } from '@/lib/utils/date';

export interface ParseOptions {
  knownSessionIds?: Set<string>;
}

export function parseCsvText(csvText: string, options: ParseOptions = {}): CsvValidationResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const errors: string[] = [];

  if (result.errors.length > 0) {
    result.errors.forEach((err) => {
      errors.push(`Row ${err.row ?? '?'}: ${err.message}`);
    });
  }

  const rows = result.data || [];

  // Validate required columns are present
  if (rows.length === 0) {
    return {
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      missingValueRows: [],
      unknownSessionRows: [],
      errors: ['CSV file is empty or contains no data rows'],
    };
  }

  const firstRowKeys = Object.keys(rows[0] || {});
  const missingColumns = REQUIRED_CSV_COLUMNS.filter((c) => !firstRowKeys.includes(c));
  if (missingColumns.length > 0) {
    return {
      totalRows: rows.length,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      missingValueRows: [],
      unknownSessionRows: [],
      errors: [`Missing required columns: ${missingColumns.join(', ')}`],
    };
  }

  const parsed: ParsedCsvRow[] = [];
  const seenKeys = new Set<string>();
  const duplicates: ParsedCsvRow[] = [];

  rows.forEach((raw, idx) => {
    const rowIndex = idx + 1;
    const studentId = (raw.student_id || '').trim();
    const sessionId = (raw.session_id || '').trim();
    const timestamp = (raw.timestamp || '').trim();
    const rowErrors: string[] = [];

    if (!studentId) rowErrors.push('Missing student_id');
    if (!sessionId) rowErrors.push('Missing session_id');
    if (!timestamp) rowErrors.push('Missing timestamp');

    if (timestamp && !parseTimestamp(timestamp)) {
      rowErrors.push('Invalid timestamp format');
    }

    if (
      options.knownSessionIds &&
      sessionId &&
      !options.knownSessionIds.has(sessionId)
    ) {
      rowErrors.push(`Unknown session '${sessionId}'`);
    }

    const row: ParsedCsvRow = {
      rowIndex,
      studentId,
      sessionId,
      timestamp,
      isValid: rowErrors.length === 0,
      errors: rowErrors,
      raw,
    };

    parsed.push(row);

    if (row.isValid) {
      const key = `${studentId}::${sessionId}`;
      if (seenKeys.has(key)) {
        duplicates.push(row);
      } else {
        seenKeys.add(key);
      }
    }
  });

  const validRows = parsed.filter((r) => r.isValid && !duplicates.includes(r));
  const invalidRows = parsed.filter((r) => !r.isValid);
  const missingValueRows = parsed.filter(
    (r) => !r.studentId || !r.sessionId || !r.timestamp
  );
  const unknownSessionRows = parsed.filter((r) =>
    r.errors.some((e) => e.startsWith("Unknown session"))
  );

  return {
    totalRows: parsed.length,
    validRows,
    invalidRows,
    duplicateRows: duplicates,
    missingValueRows,
    unknownSessionRows,
    errors,
  };
}

export function parseCsvFile(file: File, options: ParseOptions = {}): Promise<CsvValidationResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      try {
        resolve(parseCsvText(text, options));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
}