import type { CsvValidationResult } from '@/types/import';
import { MetricCard } from '@/components/dashboard/metric-card';

export function CsvPreview({ result }: { result: CsvValidationResult }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Total" value={result.totalRows} />
        <MetricCard label="Valid" value={result.validRows.length} accent="teal" />
        <MetricCard label="Invalid" value={result.invalidRows.length} accent="coral" />
        <MetricCard label="Duplicates" value={result.duplicateRows.length} accent="ochre" />
        <MetricCard label="Unknown Session" value={result.unknownSessionRows.length} accent="coral" />
      </div>

      {result.errors.length > 0 && (
        <div className="border border-coral/40 bg-coral/5 p-3 text-xs text-coral-dark">
          <div className="font-semibold uppercase tracking-wide text-2xs mb-1">Parse Errors</div>
          <ul className="list-disc list-inside font-mono text-2xs">
            {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {result.invalidRows.length > 0 && (
        <div className="border border-border bg-ivory-light">
          <div className="border-b border-border px-4 py-2 text-2xs font-semibold uppercase tracking-wider text-muted">
            Invalid rows (first 10)
          </div>
          <ul className="divide-y divide-border max-h-60 overflow-y-auto scrollbar-thin">
            {result.invalidRows.slice(0, 10).map((row) => (
              <li key={row.rowIndex} className="px-4 py-2 font-mono text-2xs">
                <span className="text-muted">row {row.rowIndex}:</span>{' '}
                <span className="text-ink">{row.studentId || '—'} / {row.sessionId || '—'}</span>
                <span className="text-coral-dark ml-2">{row.errors.join('; ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}