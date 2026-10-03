'use client';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { DemandAnalysis } from '@/components/intelligence/demand-analysis';
import { QueueProjectionCard } from '@/components/intelligence/queue-projection';
import { CancellationAnalysisCard } from '@/components/intelligence/cancellation-analysis';
import { SessionPressureCard } from '@/components/intelligence/session-pressure';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import type { IntelligenceReport } from '@/types/intelligence';
import { RefreshCw, Info } from 'lucide-react';

export default function IntelligencePage() {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const pushToast = useAppStore((s) => s.pushToast);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/intelligence/forecast');
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      setReport(json.data);
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader
        number="08"
        title="Intelligence"
        description="Statistical analysis derived from current registration data. Not predictive of individual decisions."
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {report?.dataQuality === 'INSUFFICIENT' && (
        <div className="mb-4 border border-ochre/40 bg-ochre/5 p-3 flex items-start gap-2 text-xs text-ochre-dark">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>{report.message}</div>
        </div>
      )}

      {loading || !report ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DemandAnalysis forecasts={report.demandForecasts} />
          <QueueProjectionCard projections={report.queueProjections} />
          <SessionPressureCard pressure={report.sessionPressure} />
          <CancellationAnalysisCard analysis={report.cancellationAnalysis} />
        </div>
      )}

      {report && (
        <p className="mt-6 text-2xs text-muted font-mono">
          Report generated {new Date(report.generatedAt).toLocaleString()} · Data quality: {report.dataQuality}
        </p>
      )}
    </>
  );
}