export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RegistrationFilters extends PaginationParams {
  status?: string;
  sessionId?: string;
  studentId?: string;
  search?: string;
  importId?: string;
}

export interface AuditFilters extends PaginationParams {
  eventType?: string;
  sessionId?: string;
  registrationId?: string;
  startDate?: string;
  endDate?: string;
}