import { NextRequest } from 'next/server';
import { sessionService } from '@/lib/services/session-service';
import { sessionInputSchema } from '@/lib/validation/session-schema';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessions = await sessionService.listWithStats();
    return successResponse(sessions);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sessionInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Invalid session input',
        details: parsed.error.flatten(),
      }, 400);
    }
    const session = await sessionService.create(parsed.data);
    return successResponse(session, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}