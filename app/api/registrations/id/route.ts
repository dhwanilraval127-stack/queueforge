import { NextRequest } from 'next/server';
import { registrationService } from '@/lib/services/registration-service';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await registrationService.getTrace(params.id);
    if (!result.registration) {
      return errorResponse({
        code: 'REGISTRATION_NOT_FOUND',
        message: `Registration '${params.id}' not found`,
      }, 404);
    }
    return successResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}