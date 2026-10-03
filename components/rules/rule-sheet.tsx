import type { RuleSet } from '@/types/rules';
import { formatTimestamp } from '@/lib/utils/date';

export function RuleSheet({ rules }: { rules: RuleSet }) {
  return (
    <div className="bg-white p-10 max-w-3xl mx-auto border border-border print:border-0 print:shadow-none">
      <header className="border-b border-border pb-4 mb-6">
        <div className="font-mono text-xs text-muted">QUEUEFORGE</div>
        <h1 className="text-2xl font-semibold mt-1">Registration Rule Sheet</h1>
        <div className="mt-2 font-mono text-2xs text-muted">
          Rule set: {rules.name} · Updated {formatTimestamp(rules.updatedAt)}
        </div>
      </header>

      <section className="space-y-5 text-sm">
        <RuleLine label="Duplicate policy" value={rules.duplicatePolicy} />
        <RuleLine label="Capacity policy" value={rules.capacityPolicy} />
        <RuleLine label="Waitlist" value={rules.waitlistEnabled ? 'Enabled' : 'Disabled'} />
        <RuleLine label="Ordering" value={rules.orderingPolicy} />
        <RuleLine label="Cancellation policy" value={rules.cancellationPolicy} />
        <RuleLine
          label="Automatic promotion"
          value={rules.automaticPromotion ? 'Enabled' : 'Disabled'}
        />
        <RuleLine
          label="Preserve original order"
          value={rules.preserveOriginalOrder ? 'Yes' : 'No'}
        />
        {rules.maxWaitlistSize !== undefined && rules.maxWaitlistSize !== null && (
          <RuleLine label="Max waitlist size" value={String(rules.maxWaitlistSize)} />
        )}
      </section>

      <footer className="mt-8 pt-4 border-t border-border font-mono text-2xs text-muted">
        This sheet reflects the actual rules executed by the deterministic engine at render time.
      </footer>
    </div>
  );
}

function RuleLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className="text-muted uppercase text-2xs tracking-wider">{label}</span>
      <span className="font-mono text-sm text-ink">{value}</span>
    </div>
  );
}

