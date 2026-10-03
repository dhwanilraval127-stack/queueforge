import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/public-shell';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Waitlist management',
  description:
    'Ordered FIFO queues with configurable ordering policy, automatic promotion on cancellation, and atomic queue rebalancing.',
  alternates: { canonical: '/waitlist-management' },
};

export default function WaitlistManagementPage() {
  return (
    <PublicShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-16">
          <div className="font-mono text-xs text-teal uppercase tracking-wider">Waitlist management</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-ink">
            Ordered waitlists with reliable promotion.
          </h1>
          <p className="mt-4 text-base text-muted max-w-3xl leading-relaxed">
            When a session reaches capacity, overflow registrations are routed to a persistent waitlist. Positions are tracked explicitly and recomputed deterministically when the queue changes.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14 space-y-6">
          <Step n="01" title="Overflow routing">
            When capacity is reached and the waitlist is enabled, the engine places the registration at the next available position.
          </Step>
          <Step n="02" title="Position allocation">
            Positions are allocated based on the configured ordering policy — typically original sequence (FIFO).
          </Step>
          <Step n="03" title="Cancellation triggers promotion">
            When an accepted registration is cancelled, the engine selects the next eligible waitlisted registration and promotes it in a single Firestore transaction.
          </Step>
          <Step n="04" title="Queue rebalance">
            Remaining positions are recomputed so the queue is always contiguous and consistent.
          </Step>
          <Step n="05" title="Full audit">
            Both the cancellation and the promotion are recorded as audit events with their reasons and prior/new statuses.
          </Step>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14 text-center">
          <Button asChild variant="primary">
            <Link href="/dashboard/queue">View live queues</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-ivory-light p-5 flex gap-5">
      <div className="font-mono text-xs text-muted w-8 shrink-0 pt-1">{n}</div>
      <div>
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">{title}</h2>
        <p className="mt-1 text-sm text-muted leading-relaxed">{children}</p>
      </div>
    </div>
  );
}