import { getAdminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/utils/constants';
import { sessionRepository } from '@/lib/repositories/session-repository';
import { registrationRepository } from '@/lib/repositories/registration-repository';
import { rulesRepository } from '@/lib/repositories/rules-repository';
import { auditService } from './audit-service';
import { processCancellation } from '@/lib/engine/cancellation-manager';
import {
  RegistrationNotFoundError,
  SessionNotFoundError,
  InvalidStateTransitionError,
} from '@/lib/engine/errors';
import { buildOccupancy } from '@/lib/engine/capacity-manager';
import {
  auditEventForCancellation,
  auditEventForPromotion,
} from '@/lib/audit/audit-log';
import type { Registration } from '@/types/registration';
import type { EngineExistingRegistration } from '@/lib/engine/types';
import { nowIso } from '@/lib/utils/date';

interface CancellationOutput {
  cancelled: Registration;
  promoted?: Registration;
  updatedPositions: Array<{ id: string; newPosition: number }>;
}

export const cancellationService = {
  async cancel(registrationId: string, _reason?: string): Promise<CancellationOutput> {
    const db = getAdminDb();

    const registration = await registrationRepository.getById(registrationId);
    if (!registration) throw new RegistrationNotFoundError(registrationId);

    const session = await sessionRepository.getById(registration.sessionId);
    if (!session) throw new SessionNotFoundError(registration.sessionId);

    const rules = await rulesRepository.getActive();

    if (
      registration.status !== 'ACCEPTED' &&
      registration.status !== 'WAITLISTED'
    ) {
      throw new InvalidStateTransitionError(registration.status, 'CANCELLED');
    }

    // Transaction: cancel + promote + rebalance
    const result = await db.runTransaction(async (tx) => {
      const regRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(registrationId);
      const regSnap = await tx.get(regRef);
      if (!regSnap.exists) throw new RegistrationNotFoundError(registrationId);
      const current = regSnap.data() as Registration;

      if (current.status !== 'ACCEPTED' && current.status !== 'WAITLISTED') {
        throw new InvalidStateTransitionError(current.status, 'CANCELLED');
      }

      // Get all session registrations for engine
      const sessionRegsSnap = await tx.get(
        db
          .collection(COLLECTIONS.REGISTRATIONS)
          .where('sessionId', '==', current.sessionId)
          .where('status', 'in', ['ACCEPTED', 'WAITLISTED'])
      );

      const engineRegs: EngineExistingRegistration[] = sessionRegsSnap.docs.map((d) => {
        const data = d.data() as Registration;
        return {
          id: d.id,
          studentId: data.studentId,
          sessionId: data.sessionId,
          status: data.status,
          queuePosition: data.queuePosition,
          originalSequence: data.originalSequence,
        };
      });

      const engineReg = engineRegs.find((r) => r.id === registrationId);
      if (!engineReg) {
        throw new RegistrationNotFoundError(registrationId);
      }

      const acceptedCount = engineRegs.filter((r) => r.status === 'ACCEPTED').length;
      const waitlistCount = engineRegs.filter((r) => r.status === 'WAITLISTED').length;
      const occupancy = buildOccupancy(
        session.id,
        session.capacity,
        acceptedCount,
        waitlistCount
      );

      const cancelResult = processCancellation(engineReg, engineRegs, occupancy, rules);

      const now = nowIso();

      // Update cancelled registration
      tx.update(regRef, {
        status: 'CANCELLED',
        updatedAt: now,
      });

      let promoted: Registration | undefined;

      // Update promoted registration
      if (cancelResult.promotedRegistration) {
        const promotedRef = db
          .collection(COLLECTIONS.REGISTRATIONS)
          .doc(cancelResult.promotedRegistration.id);
        const promotedSnap = sessionRegsSnap.docs.find(
          (d) => d.id === cancelResult.promotedRegistration!.id
        );
        if (promotedSnap) {
          const promotedData = promotedSnap.data() as Registration;
          tx.update(promotedRef, {
            status: 'ACCEPTED',
            queuePosition: null,
            updatedAt: now,
          });
          promoted = {
            ...promotedData,
            id: promotedSnap.id,
            status: 'ACCEPTED',
            queuePosition: undefined,
            updatedAt: now,
          };
        }
      }

      // Update queue positions
      for (const pos of cancelResult.updatedQueuePositions) {
        const posRef = db.collection(COLLECTIONS.REGISTRATIONS).doc(pos.id);
        tx.update(posRef, {
          queuePosition: pos.newPosition,
          updatedAt: now,
        });
      }

      return {
        cancelled: { ...current, status: 'CANCELLED' as const, updatedAt: now },
        promoted,
        updatedPositions: cancelResult.updatedQueuePositions,
        previousStatus: current.status,
        promotedPreviousPosition: cancelResult.promotedRegistration?.queuePosition,
      };
    });

    // Audit events outside transaction (best-effort)
    await auditService.log(
      auditEventForCancellation(
        registration.id,
        registration.studentId,
        registration.sessionId,
        result.previousStatus
      )
    );

    if (result.promoted) {
      await auditService.log(
        auditEventForPromotion(
          result.promoted.id,
          result.promoted.studentId,
          result.promoted.sessionId,
          result.promotedPreviousPosition
        )
      );
    }

    return {
      cancelled: result.cancelled,
      promoted: result.promoted,
      updatedPositions: result.updatedPositions,
    };
  },
};