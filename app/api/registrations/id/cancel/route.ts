import { NextRequest } from 'next/server';
import { cancellationService } from '@/lib/services/cancellation-service';
import { cancellationSchema } from '@/lib/validation/registration-schema';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      // body optional
    }
    const parsed = cancellationSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Invalid cancellation input',
        details: parsed.error.flatten(),
      }, 400);
    }

    const result = await cancellationService.cancel(params.id, parsed.data.reason);
    return successResponse(result);
  } catch (err) {
    logger.error('POST /api/registrations/[id]/cancel failed', {
      id: params.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return handleApiError(err);
  }
}