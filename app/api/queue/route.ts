import { NextRequest } from 'next/server';
import { registrationRepository } from '@/lib/repositories/registration-repository';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { successResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    const sessions = sessionId
      ? [await sessionRepository.getById(sessionId)].filter(Boolean)
      : await sessionRepository.getAll();

    const groups = await Promise.all(
      sessions.map(async (s) => {
        if (!s) return null;
        const waitlisted = await registrationRepository.getBySessionIdAndStatus(s.id, 'WAITLISTED');
        const sorted = waitlisted.sort(
          (a, b) => (a.queuePosition || 0) - (b.queuePosition || 0)
        );
        return {
          session: s,
          waitlist: sorted,
          count: sorted.length,
        };
      })
    );

    return successResponse(groups.filter(Boolean));
  } catch (err) {
    return handleApiError(err);
  }
}