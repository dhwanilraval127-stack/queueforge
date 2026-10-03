import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/public-shell';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Auditability',
  description:
    'Every state transition becomes a persistent audit event. Decision traces, reasons, and metadata are preserved and exportable.',
  alternates: { canonical: '/auditability' },
};

export default function AuditabilityPage() {
  return (
    <PublicShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-16">
          <div className="font-mono text-xs text-teal uppercase tracking-wider">Auditability</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-ink">
            Explain any decision at any time.
          </h1>
          <p className="mt-4 text-base text-muted max-w-3xl leading-relaxed">
            Every registration, cancellation, promotion, and rule change writes an immutable audit event with its timestamp, reason, and relevant metadata. Cancelled registrations are preserved — not deleted.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14">
          <h2 className="text-xl font-semibold text-ink">Tracked events</h2>
          <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
            {[
              'REGISTRATION_ACCEPTED',
              'REGISTRATION_WAITLISTED',
              'REGISTRATION_CANCELLED',
              'REGISTRATION_REJECTED_DUPLICATE',
              'REGISTRATION_REJECTED_INVALID',
              'REGISTRATION_REJECTED_SESSION_NOT_FOUND',
              'REGISTRATION_REJECTED_CAPACITY_FULL',
              'WAITLIST_PROMOTED',
              'IMPORT_STARTED',
              'IMPORT_COMPLETED',
              'IMPORT_FAILED',
              'SESSION_CREATED',
              'SESSION_UPDATED',
              'RULE_CHANGED',
              'SIMULATION_CREATED',
            ].map((e) => (
              <li key={e} className="border border-border bg-ivory-light px-3 py-2 text-ink">{e}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14 text-center">
          <Button asChild variant="primary">
            <Link href="/dashboard/audit">Open audit timeline</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}