export const IMPORT_STATUSES = [
  'PENDING',
  'VALIDATING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;

export type ImportStatus = typeof IMPORT_STATUSES[number];

export interface Import {
  id: string;
  filename: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  processedRows: number;
  acceptedRows: number;
  waitlistedRows: number;
  rejectedRows: number;
  status: ImportStatus;
  errorSummary?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface CsvRow {
  student_id: string;
  session_id: string;
  timestamp: string;
  [key: string]: string;
}

export interface ParsedCsvRow {
  rowIndex: number;
  studentId: string;
  sessionId: string;
  timestamp: string;
  isValid: boolean;
  errors: string[];
  raw: Record<string, string>;
}

export interface CsvValidationResult {
  totalRows: number;
  validRows: ParsedCsvRow[];
  invalidRows: ParsedCsvRow[];
  duplicateRows: ParsedCsvRow[];
  missingValueRows: ParsedCsvRow[];
  unknownSessionRows: ParsedCsvRow[];
  errors: string[];
}