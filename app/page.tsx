import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicShell } from '@/components/shared/public-shell';
import { Button } from '@/components/ui/button';
import {
  ListChecks,
  Clock,
  LayoutGrid,
  FileText,
  TestTube2,
  BookOpenCheck,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'QueueForge — Registration Operations Platform',
  description:
    'A deterministic registration operations platform. Handle duplicates, capacity, waitlists, cancellations, and decision traces with full auditability.',
  alternates: { canonical: '/' },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'QueueForge',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description:
    'A registration operations platform for managing capacity, duplicates, waitlists, cancellations, and auditable decisions.',
};

export default function HomePage() {
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 py-20 lg:py-28">
          <div className="font-mono text-xs text-teal uppercase tracking-wider">
            Registration Operations Platform
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-semibold text-ink leading-tight tracking-tight">
            QueueForge
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-muted max-w-2xl">
            Registration, under control.
          </p>
          <p className="mt-6 text-sm md:text-base text-ink max-w-2xl leading-relaxed">
            Build a resilient registration service from a starter CSV. Handle duplicates, capacity, waitlists, and cancellations — while preserving the original registration order and recording every decision.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/dashboard">
                Open application
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core capabilities */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="font-mono text-xs text-muted uppercase tracking-wider">01 Capabilities</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-ink">
            Six primitives for registration operations.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            <Capability icon={<ListChecks />} title="Registration management" href="/registration-management">
              Validated ingestion with deterministic acceptance, duplicate detection, and traceable rejections.
            </Capability>
            <Capability icon={<LayoutGrid />} title="Capacity management" href="/capacity-management">
              Per-session capacity, utilization tracking, and strict overflow routing.
            </Capability>
            <Capability icon={<Clock />} title="Waitlist management" href="/waitlist-management">
              Ordered queues with configurable policy and automatic promotion on cancellation.
            </Capability>
            <Capability icon={<BookOpenCheck />} title="Decision trace" href="/how-it-works">
              Every registration carries a step-by-step explanation of exactly how the engine decided.
            </Capability>
            <Capability icon={<FileText />} title="Auditability" href="/auditability">
              Full event history for every status transition — never lose a cancelled or promoted record.
            </Capability>
            <Capability icon={<TestTube2 />} title="Simulation" href="/features">
              Test rule changes or capacity scenarios without touching production data.
            </Capability>
          </div>
        </div>
      </section>

      {/* How it processes */}
      <section className="border-b border-border bg-ivory-dark/40">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="font-mono text-xs text-muted uppercase tracking-wider">02 Pipeline</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-ink max-w-2xl">
            A deterministic pipeline from CSV to confirmed registration.
          </h2>

          <ol className="mt-10 border border-border bg-ivory-light divide-y divide-border">
            {[
              ['01', 'Ingest CSV', 'Required columns validated client- and server-side.'],
              ['02', 'Validate rows', 'Missing values, invalid timestamps, and unknown sessions flagged early.'],
              ['03', 'Process in order', 'Original sequence is preserved through the entire pipeline.'],
              ['04', 'Engine decision', 'Deterministic acceptance, duplicate, capacity, and waitlist evaluation.'],
              ['05', 'Audit event', 'Every outcome recorded with reason code, trace, and metadata.'],
              ['06', 'Persist', 'Firestore transaction ensures state consistency.'],
            ].map(([n, title, body]) => (
              <li key={n} className="flex items-start gap-5 px-6 py-4">
                <span className="font-mono text-xs text-muted shrink-0 pt-0.5">{n}</span>
                <div>
                  <div className="text-sm font-semibold text-ink">{title}</div>
                  <div className="text-xs text-muted mt-0.5">{body}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Design principles */}
      <section>
        <div className="mx-auto max-w-6xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="font-mono text-xs text-muted uppercase tracking-wider">03 Principles</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-ink">Explicit over implicit.</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Principle title="Deterministic">
              The engine is pure, isolated, and framework-independent. The same inputs always produce the same decision.
            </Principle>
            <Principle title="Explainable">
              Every decision carries a trace. Every state change creates an audit event.
            </Principle>
            <Principle title="Configurable">
              Capacity, duplicate, waitlist, cancellation, and ordering policies are rule-driven and editable.
            </Principle>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-ink">Ready to process registrations?</h2>
          <p className="mt-3 text-sm text-muted max-w-xl mx-auto">
            Open the dashboard and import a CSV, or load sample data to see the engine run.
          </p>
          <div className="mt-6">
            <Button asChild variant="primary" size="lg">
              <Link href="/dashboard">
                Open application
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function Capability({ icon, title, href, children }: { icon: React.ReactNode; title: string; href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group bg-ivory-light p-6 hover:bg-ivory-dark/40 transition-colors">
      <div className="text-teal mb-3">{icon}</div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-muted leading-relaxed">{children}</p>
      <div className="mt-3 flex items-center gap-1 text-2xs text-teal uppercase tracking-wider font-mono">
        Learn more
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function Principle({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-teal pl-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{children}</p>
    </div>
  );
}