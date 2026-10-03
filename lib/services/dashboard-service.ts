import { registrationRepository } from '@/lib/repositories/registration-repository';
import { sessionService } from './session-service';
import { auditService } from './audit-service';
import { importRepository } from '@/lib/repositories/import-repository';

export interface DashboardMetrics {
  totalRequests: number;
  accepted: number;
  waitlisted: number;
  conflicts: number;
  cancellations: number;
  sessions: Awaited<ReturnType<typeof sessionService.listWithStats>>;
  recentActivity: Awaited<ReturnType<typeof auditService.recent>>;
  recentImports: Awaited<ReturnType<typeof importRepository.list>>;
  dataQuality: {
    totalRegistrations: number;
    validRegistrations: number;
    rejectedRegistrations: number;
    rejectionRate: number;
  };
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const [
      total,
      accepted,
      waitlisted,
      cancelled,
      rejectedDup,
      rejectedInv,
      rejectedSnf,
      rejectedCap,
      sessions,
      recentActivity,
      recentImports,
    ] = await Promise.all([
      registrationRepository.countAll(),
      registrationRepository.countByStatus('ACCEPTED'),
      registrationRepository.countByStatus('WAITLISTED'),
      registrationRepository.countByStatus('CANCELLED'),
      registrationRepository.countByStatus('REJECTED_DUPLICATE'),
      registrationRepository.countByStatus('REJECTED_INVALID'),
      registrationRepository.countByStatus('REJECTED_SESSION_NOT_FOUND'),
      registrationRepository.countByStatus('REJECTED_CAPACITY_FULL'),
      sessionService.listWithStats(),
      auditService.recent(10),
      importRepository.list(5),
    ]);

    const conflicts = rejectedDup + rejectedInv + rejectedSnf + rejectedCap;
    const validRegistrations = accepted + waitlisted;
    const rejectionRate = total > 0 ? (conflicts / total) * 100 : 0;

    return {
      totalRequests: total,
      accepted,
      waitlisted,
      conflicts,
      cancellations: cancelled,
      sessions,
      recentActivity,
      recentImports,
      dataQuality: {
        totalRegistrations: total,
        validRegistrations,
        rejectedRegistrations: conflicts,
        rejectionRate,
      },
    };
  },
};