import type { DemandForecast } from '@/types/intelligence';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DemandAnalysis({ forecasts }: { forecasts: DemandForecast[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {forecasts.length === 0 ? (
          <p className="p-5 text-xs text-muted">No sessions available.</p>
        ) : (
          <ul className="divide-y divide-border">
            {forecasts.map((f) => (
              <li key={f.sessionId} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-ink">{f.sessionCode}</div>
                    <div className="font-mono text-2xs text-muted">
                      accepted {f.currentAccepted} · waitlisted {f.currentWaitlisted}
                    </div>
                  </div>
                  <Badge variant={f.trend === 'INCREASING' ? 'waitlisted' : f.trend === 'DECREASING' ? 'cancelled' : 'info'}>
                    {f.trend}
                  </Badge>
                </div>
                {f.insufficientData ? (
                  <p className="mt-2 text-2xs text-muted">{f.message}</p>
                ) : (
                  <p className="mt-2 font-mono text-2xs text-muted">
                    Projected demand: {f.projectedDemand} · data points: {f.dataPoints}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}