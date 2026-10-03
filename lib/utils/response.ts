import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError, ApiMeta } from '@/types/api';

export function successResponse<T>(
  data: T,
  meta?: ApiMeta,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function errorResponse(
  error: ApiError,
  status = 400
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function handleApiError(err: unknown): NextResponse<ApiResponse<never>> {
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const engineErr = err as { code: string; message: string; details?: Record<string, unknown> };
    const status = statusForCode(engineErr.code);
    return errorResponse(
      {
        code: engineErr.code,
        message: engineErr.message,
        details: engineErr.details,
      },
      status
    );
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  return errorResponse(
    {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
    },
    500
  );
}

function statusForCode(code: string): number {
  switch (code) {
    case 'VALIDATION_ERROR':
    case 'INVALID_INPUT':
      return 400;
    case 'SESSION_NOT_FOUND':
    case 'REGISTRATION_NOT_FOUND':
      return 404;
    case 'DUPLICATE_REGISTRATION':
      return 409;
    case 'SESSION_CAPACITY_REACHED':
    case 'INVALID_STATE_TRANSITION':
      return 409;
    case 'FIREBASE_NOT_CONFIGURED':
      return 503;
    default:
      return 500;
  }
}