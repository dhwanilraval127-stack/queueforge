import { intelligenceService } from '@/lib/services/intelligence-service';
import { successResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await intelligenceService.generateReport();
    return successResponse(report);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST() {
  try {
    const report = await intelligenceService.generateReport();
    return successResponse(report);
  } catch (err) {
    return handleApiError(err);
  }
}