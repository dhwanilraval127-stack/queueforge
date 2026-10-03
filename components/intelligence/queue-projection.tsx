import type { QueueProjection } from '@/types/intelligence';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function QueueProjectionCard({ projections }: { projections: QueueProjection[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue Projection</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {projections.map((p) => (
            <li key={p.sessionId} className="px-5 py-3">
              <div className="flex justify-between">
                <div className="font-mono text-xs text-ink">{p.sessionCode}</div>
                <div className="font-mono text-xs text-ochre-dark">{p.currentWaitlistSize} waiting</div>
              </div>
              {p.insufficientData ? (
                <p className="mt-1 text-2xs text-muted">{p.message}</p>
              ) : (
                <p className="mt-1 font-mono text-2xs text-muted">
                  Projected promotions: {p.projectedPromotions} · cancellation rate: {(p.historicalCancellationRate * 100).toFixed(1)}%
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}