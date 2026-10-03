import { NextRequest } from 'next/server';
import { sessionService } from '@/lib/services/session-service';
import { sessionUpdateSchema } from '@/lib/validation/session-schema';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await sessionService.get(params.id);
    if (!session) {
      return errorResponse({
        code: 'SESSION_NOT_FOUND',
        message: `Session '${params.id}' not found`,
      }, 404);
    }
    return successResponse(session);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = sessionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Invalid session update',
        details: parsed.error.flatten(),
      }, 400);
    }
    const session = await sessionService.update(params.id, parsed.data);
    return successResponse(session);
  } catch (err) {
    return handleApiError(err);
  }
}