import { registrationRepository } from '@/lib/repositories/registration-repository';
import { sessionService } from './session-service';
import type {
  IntelligenceReport,
  DemandForecast,
  QueueProjection,
  CancellationAnalysis,
  SessionPressure,
} from '@/types/intelligence';
import { nowIso } from '@/lib/utils/date';

const MIN_DATA_POINTS_FOR_FORECAST = 10;

export const intelligenceService = {
  async generateReport(): Promise<IntelligenceReport> {
    const sessions = await sessionService.listWithStats();
    const totalRegistrations = await registrationRepository.countAll();
    const cancellations = await registrationRepository.countByStatus('CANCELLED');

    const dataQuality: IntelligenceReport['dataQuality'] =
      totalRegistrations < 5
        ? 'INSUFFICIENT'
        : totalRegistrations < 50
          ? 'LIMITED'
          : totalRegistrations < 500
            ? 'ADEQUATE'
            : 'GOOD';

    const demandForecasts: DemandForecast[] = sessions.map((s) => {
      const total = s.acceptedCount + s.waitlistCount;
      const insufficient = total < MIN_DATA_POINTS_FOR_FORECAST;
      const projected = Math.round(total * 1.1); // simple linear projection
      const trend: DemandForecast['trend'] =
        s.waitlistCount > s.capacity * 0.2
          ? 'INCREASING'
          : s.acceptedCount < s.capacity * 0.5
            ? 'DECREASING'
            : 'STABLE';

      return {
        sessionId: s.id,
        sessionCode: s.code,
        currentAccepted: s.acceptedCount,
        currentWaitlisted: s.waitlistCount,
        projectedDemand: insufficient ? total : projected,
        confidence: insufficient ? 0 : Math.min(0.95, 0.4 + total / 100),
        trend,
        dataPoints: total,
        insufficientData: insufficient,
        message: insufficient
          ? `Insufficient data (${total} registrations). Minimum ${MIN_DATA_POINTS_FOR_FORECAST} required.`
          : undefined,
      };
    });

    const queueProjections: QueueProjection[] = sessions.map((s) => {
      const insufficient = cancellations < 3 || s.waitlistCount === 0;
      const cancellationRate = totalRegistrations > 0 ? cancellations / totalRegistrations : 0;
      const projectedPromotions = Math.min(
        s.waitlistCount,
        Math.round(s.acceptedCount * cancellationRate)
      );

      return {
        sessionId: s.id,
        sessionCode: s.code,
        currentWaitlistSize: s.waitlistCount,
        historicalCancellationRate: cancellationRate,
        projectedPromotions,
        insufficientData: insufficient,
        message: insufficient
          ? 'Insufficient cancellation history to project queue clearance.'
          : undefined,
      };
    });

    const cancellationAnalysis: CancellationAnalysis = {
      totalCancellations: cancellations,
      cancellationRate: totalRegistrations > 0 ? cancellations / totalRegistrations : 0,
      sessionBreakdown: await Promise.all(
        sessions.map(async (s) => {
          const sessionCancellations = await registrationRepository.countBySessionIdAndStatus(
            s.id,
            'CANCELLED'
          );
          const sessionTotal = s.acceptedCount + s.waitlistCount + sessionCancellations;
          return {
            sessionId: s.id,
            sessionCode: s.code,
            cancellations: sessionCancellations,
            rate: sessionTotal > 0 ? sessionCancellations / sessionTotal : 0,
          };
        })
      ),
      insufficientData: cancellations < 3,
      message:
        cancellations < 3
          ? 'Insufficient cancellation data for meaningful analysis.'
          : undefined,
    };

    const sessionPressure: SessionPressure[] = sessions.map((s) => {
      const utilization = s.utilization;
      const waitlistRatio = s.capacity > 0 ? (s.waitlistCount / s.capacity) * 100 : 0;
      const pressureScore = Math.min(100, utilization + waitlistRatio);
      const level: SessionPressure['level'] =
        pressureScore >= 100 ? 'CRITICAL' : pressureScore >= 80 ? 'HIGH' : pressureScore >= 50 ? 'MODERATE' : 'LOW';
      return {
        sessionId: s.id,
        sessionCode: s.code,
        utilization,
        waitlistRatio,
        pressureScore,
        level,
        insufficientData: s.acceptedCount + s.waitlistCount === 0,
      };
    });

    return {
      demandForecasts,
      queueProjections,
      cancellationAnalysis,
      sessionPressure,
      generatedAt: nowIso(),
      dataQuality,
      message:
        dataQuality === 'INSUFFICIENT'
          ? 'Not enough data to generate meaningful predictions. Import more registrations.'
          : undefined,
    };
  },
};