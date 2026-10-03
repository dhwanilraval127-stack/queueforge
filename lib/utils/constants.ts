export const COLLECTIONS = {
  STUDENTS: 'students',
  SESSIONS: 'sessions',
  REGISTRATIONS: 'registrations',
  AUDIT_EVENTS: 'auditEvents',
  RULE_SETS: 'ruleSets',
  IMPORTS: 'imports',
  SIMULATIONS: 'simulations',
} as const;

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 200;
export const MAX_CSV_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_CSV_ROWS = 50000;
export const DEFAULT_RULE_SET_ID = 'default';

export const SAMPLE_IMPORT_ID = 'sample_data';