import { NextRequest } from 'next/server';
import { rulesRepository } from '@/lib/repositories/rules-repository';
import { ruleSetUpdateSchema } from '@/lib/validation/rules-schema';
import { auditService } from '@/lib/services/audit-service';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rules = await rulesRepository.getActive();
    return successResponse(rules);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ruleSetUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Invalid rule set update',
        details: parsed.error.flatten(),
      }, 400);
    }
    const previous = await rulesRepository.getActive();
    const updated = await rulesRepository.update(parsed.data);
    await auditService.log({
      eventType: 'RULE_CHANGED',
      reasonCode: 'RULE_UPDATED',
      message: 'Rule set updated',
      metadata: { previous, updated },
    });
    return successResponse(updated);
  } catch (err) {
    return handleApiError(err);
  }
}