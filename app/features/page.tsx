import type { Metadata } from 'next';
import { PublicShell } from '@/components/shared/public-shell';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'QueueForge features: deterministic registration engine, decision traces, waitlist management, cancellation workflows, capacity controls, audit trail, simulator, and intelligence.',
  alternates: { canonical: '/features' },
};

const FEATURES = [
  {
    group: 'Engine',
    items: [
      'Deterministic registration decisions',
      'Duplicate detection with configurable policy',
      'Capacity enforcement per session',
      'Original registration order preservation',
      'Step-by-step decision trace',
    ],
  },
  {
    group: 'Waitlist & cancellation',
    items: [
      'FIFO queue with configurable ordering policy',
      'Automatic promotion on cancellation',
      'Atomic cancellation + promotion transactions',
      'Queue position rebalancing',
      'Non-destructive cancellation history',
    ],
  },
  {
    group: 'Data & integration',
    items: [
      'CSV import with validation and preview',
      'Drag-and-drop upload',
      'Export registrations and audit logs',
      'Firestore-backed persistence',
      'Server-side input validation with Zod',
    ],
  },
  {
    group: 'Operations',
    items: [
      'Dashboard with live metrics',
      'Session utilization indicators',
      'Audit timeline with filtering',
      'Printable rule sheet',
      'Isolated what-if simulator',
      'Statistical intelligence report',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <PublicShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="font-mono text-xs text-teal uppercase tracking-wider">Features</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-ink">
            Everything required for registration operations.
          </h1>
          <p className="mt-4 text-sm text-muted max-w-2xl">
            Each capability is implemented behind a working API, exercised by the deterministic engine, and persisted through Firestore transactions.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((group) => (
              <div key={group.group} className="border border-border bg-ivory-light p-5">
                <div className="font-mono text-2xs text-teal uppercase tracking-wider">{group.group}</div>
                <ul className="mt-4 space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink">
                      <Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}