import { NextRequest } from 'next/server';
import { registrationService } from '@/lib/services/registration-service';
import { createRegistrationSchema, registrationFiltersSchema } from '@/lib/validation/registration-schema';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = registrationFiltersSchema.safeParse({
      status: searchParams.get('status') || undefined,
      sessionId: searchParams.get('sessionId') || undefined,
      studentId: searchParams.get('studentId') || undefined,
      search: searchParams.get('search') || undefined,
      importId: searchParams.get('importId') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: parsed.error.flatten(),
      }, 400);
    }

    const result = await registrationService.list(parsed.data);
    return successResponse(result.items, {
      total: result.total,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      hasMore: result.hasMore,
    });
  } catch (err) {
    logger.error('GET /api/registrations failed', { error: err instanceof Error ? err.message : String(err) });
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Invalid registration input',
        details: parsed.error.flatten(),
      }, 400);
    }

    const result = await registrationService.createOne(parsed.data);
    return successResponse(result, undefined, 201);
  } catch (err) {
    logger.error('POST /api/registrations failed', { error: err instanceof Error ? err.message : String(err) });
    return handleApiError(err);
  }
}