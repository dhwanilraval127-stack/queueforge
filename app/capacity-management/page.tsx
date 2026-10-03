import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/public-shell';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Capacity management',
  description:
    'Per-session capacity, utilization tracking, and configurable overflow routing. Server-authoritative counts.',
  alternates: { canonical: '/capacity-management' },
};

export default function CapacityManagementPage() {
  return (
    <PublicShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-16">
          <div className="font-mono text-xs text-teal uppercase tracking-wider">Capacity management</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-ink">
            Server-authoritative capacity, every time.
          </h1>
          <p className="mt-4 text-base text-muted max-w-3xl leading-relaxed">
            Capacity is enforced inside the engine, backed by the database. The browser never computes acceptance or rejection on its own — it only renders the server&rsquo;s decision.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Block title="Per-session configuration">
            Each session carries a <span className="font-mono text-xs">capacity</span> value and an active flag. Both are editable at any time.
          </Block>
          <Block title="Live utilization">
            The Sessions and Overview pages show live accepted counts, waitlist counts, and utilization percentages for every session.
          </Block>
          <Block title="Overflow policies">
            Three capacity policies are available: <span className="font-mono text-xs">WAITLIST</span> (default), <span className="font-mono text-xs">STRICT</span>, and <span className="font-mono text-xs">OVERFLOW_REJECT</span>.
          </Block>
          <Block title="Simulation">
            Try capacity changes in the simulator to see which registrations would move between accepted, waitlisted, or rejected — without modifying production.
          </Block>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14 text-center">
          <Button asChild variant="primary">
            <Link href="/dashboard/sessions">Manage sessions</Link>
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