export interface DemandForecast {
  sessionId: string;
  sessionCode: string;
  currentAccepted: number;
  currentWaitlisted: number;
  projectedDemand: number;
  confidence: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  dataPoints: number;
  insufficientData: boolean;
  message?: string;
}

export interface QueueProjection {
  sessionId: string;
  sessionCode: string;
  currentWaitlistSize: number;
  projectedClearTime?: string;
  averageWaitDuration?: number;
  historicalCancellationRate: number;
  projectedPromotions: number;
  insufficientData: boolean;
  message?: string;
}

export interface CancellationAnalysis {
  totalCancellations: number;
  cancellationRate: number;
  averageTimeToCancellation?: number;
  sessionBreakdown: Array<{
    sessionId: string;
    sessionCode: string;
    cancellations: number;
    rate: number;
  }>;
  insufficientData: boolean;
  message?: string;
}

export interface SessionPressure {
  sessionId: string;
  sessionCode: string;
  utilization: number;
  waitlistRatio: number;
  pressureScore: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  insufficientData: boolean;
}

export interface IntelligenceReport {
  demandForecasts: DemandForecast[];
  queueProjections: QueueProjection[];
  cancellationAnalysis: CancellationAnalysis;
  sessionPressure: SessionPressure[];
  generatedAt: string;
  dataQuality: 'INSUFFICIENT' | 'LIMITED' | 'ADEQUATE' | 'GOOD';
  message?: string;
}