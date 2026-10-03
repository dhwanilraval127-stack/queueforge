import { dashboardService } from '@/lib/services/dashboard-service';
import { successResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await dashboardService.getMetrics();
    return successResponse(metrics);
  } catch (err) {
    return handleApiError(err);
  }
}