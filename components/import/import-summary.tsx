import type { ImportResult } from '@/lib/services/import-service';
import { MetricCard } from '@/components/dashboard/metric-card';

export function ImportSummary({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-3">
      <div className="border border-teal/40 bg-teal/5 p-3 text-xs text-teal-dark">
        Import <span className="font-mono">{result.importId}</span> completed.
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Processed" value={result.processedRows} />
        <MetricCard label="Accepted" value={result.acceptedRows} accent="teal" />
        <MetricCard label="Waitlisted" value={result.waitlistedRows} accent="ochre" />
        <MetricCard label="Rejected" value={result.rejectedRows} accent="coral" />
      </div>
    </div>
  );
}