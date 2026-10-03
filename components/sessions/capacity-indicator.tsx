import { cn } from '@/lib/utils/cn';

export function CapacityIndicator({
  accepted,
  capacity,
  waitlist,
}: {
  accepted: number;
  capacity: number;
  waitlist: number;
}) {
  const pct = capacity > 0 ? Math.min(100, Math.round((accepted / capacity) * 100)) : 0;
  const barColor =
    pct >= 100 ? 'bg-coral' : pct >= 80 ? 'bg-ochre' : 'bg-teal';

  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-ink">{accepted} / {capacity}</span>
        <span className="text-muted">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 bg-border overflow-hidden">
        <div className={cn('h-full', barColor)} style={{ width: `${pct}%` }} />
      </div>
      {waitlist > 0 && (
        <div className="mt-1 text-2xs font-mono text-ochre-dark">
          +{waitlist} waiting
        </div>
      )}
    </div>
  );
}