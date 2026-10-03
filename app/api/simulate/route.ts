import { NextRequest } from 'next/server';
import { simulationService } from '@/lib/services/simulation-service';
import { simulationInputSchema } from '@/lib/validation/simulation-schema';
import { auditService } from '@/lib/services/audit-service';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = simulationInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Invalid simulation input',
        details: parsed.error.flatten(),
      }, 400);
    }
    const result = await simulationService.simulate(parsed.data);
    await auditService.log({
      eventType: 'SIMULATION_CREATED',
      reasonCode: 'SIMULATION_RUN',
      message: 'Simulation executed (no production data modified)',
      metadata: { simulationId: result.id, input: parsed.data },
    });
    return successResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}