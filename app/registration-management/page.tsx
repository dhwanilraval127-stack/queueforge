import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/public-shell';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Registration management',
  description:
    'Validated ingestion with deterministic acceptance, duplicate detection, and traceable rejections. Original registration order preserved.',
  alternates: { canonical: '/registration-management' },
};

export default function RegistrationManagementPage() {
  return (
    <PublicShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-16">
          <div className="font-mono text-xs text-teal uppercase tracking-wider">Registration management</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-ink">
            Every registration validated, every decision explained.
          </h1>
          <p className="mt-4 text-base text-muted max-w-3xl leading-relaxed">
            Registrations flow through a strict validation layer before reaching the deterministic engine. Each outcome — accepted, waitlisted, duplicate, or rejected — is written to the audit trail with its reason code.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Block title="Order preservation">
            An explicit <span className="font-mono text-xs">originalSequence</span> is captured at ingestion time and used throughout the pipeline. Firestore ordering, async scheduling, and ID generation never silently reorder records.
          </Block>
          <Block title="Duplicate detection">
            The engine recognizes a student/session pair as the logical identity of a registration. Repeat attempts are rejected with code <span className="font-mono text-xs">DUPLICATE_REGISTRATION</span> and recorded in the audit trail.
          </Block>
          <Block title="Validation">
            Missing values, invalid timestamps, and unknown sessions are detected during CSV preview and again on the server, with structured machine-readable error codes.
          </Block>
          <Block title="Status model">
            Every registration carries one of a fixed set of statuses: <span className="font-mono text-xs">ACCEPTED</span>, <span className="font-mono text-xs">WAITLISTED</span>, <span className="font-mono text-xs">CANCELLED</span>, or one of the explicit rejection states. No implicit transitions.
          </Block>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14 text-center">
          <Button asChild variant="primary">
            <Link href="/dashboard/registrations">Open registrations</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-ivory-light p-5">
      <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">{title}</h2>
      <p className="mt-2 text-sm text-muted leading-relaxed">{children}</p>
    </div>
  );
}