import { NextRequest } from 'next/server';
import { auditService } from '@/lib/services/audit-service';
import { successResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Math.min(100, Number(searchParams.get('pageSize') || '50'));

    const result = await auditService.list({
      eventType: searchParams.get('eventType') || undefined,
      sessionId: searchParams.get('sessionId') || undefined,
      registrationId: searchParams.get('registrationId') || undefined,
      page,
      pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    return successResponse(result.items, {
      total: result.total,
      page,
      pageSize,
      hasMore: result.hasMore,
    });
  } catch (err) {
    return handleApiError(err);
  }
}