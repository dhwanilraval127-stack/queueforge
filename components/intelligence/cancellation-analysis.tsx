import type { CancellationAnalysis } from '@/types/intelligence';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function CancellationAnalysisCard({ analysis }: { analysis: CancellationAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancellation Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {analysis.insufficientData ? (
          <p className="text-xs text-muted">{analysis.message}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-2xs uppercase text-muted">Total</div>
                <div className="font-mono text-sm text-ink">{analysis.totalCancellations}</div>
              </div>
              <div>
                <div className="text-2xs uppercase text-muted">Rate</div>
                <div className="font-mono text-sm text-ink">{(analysis.cancellationRate * 100).toFixed(1)}%</div>
              </div>
            </div>
            <ul className="space-y-1.5">
              {analysis.sessionBreakdown.filter((s) => s.cancellations > 0).map((s) => (
                <li key={s.sessionId} className="flex justify-between font-mono text-2xs">
                  <span className="text-ink">{s.sessionCode}</span>
                  <span className="text-muted">{s.cancellations} ({(s.rate * 100).toFixed(1)}%)</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}