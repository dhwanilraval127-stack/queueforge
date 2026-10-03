import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/public-shell';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'How QueueForge processes registrations: deterministic engine, decision trace, audit trail, and transactional Firestore persistence.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="font-mono text-xs text-teal uppercase tracking-wider">How it works</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-ink">
            A deterministic engine with transparent decisions.
          </h1>
          <p className="mt-4 text-base text-muted max-w-3xl leading-relaxed">
            The core registration engine runs independently of the browser, the database, and the API layer. The same inputs always produce the same decisions, and every decision is recorded with a complete trace.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14">
          <h2 className="text-xl font-semibold text-ink">The pipeline</h2>
          <ol className="mt-6 space-y-1 font-mono text-xs">
            {[
              'CSV / API request',
              'Input validation',
              'Registration service',
              'Deterministic registration engine',
              'Decision',
              'Audit event',
              'Firestore persistence',
              'API response',
              'UI',
            ].map((label, i, arr) => (
              <li key={label} className="flex items-center gap-3 text-ink">
                <span className="text-muted w-6">{String(i + 1).padStart(2, '0')}</span>
                <span>{label}</span>
                {i < arr.length - 1 && <span className="text-muted ml-2">↓</span>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border bg-ivory-dark/40">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14">
          <h2 className="text-xl font-semibold text-ink">Example decision trace</h2>
          <p className="mt-2 text-sm text-muted">
            For every decision, the engine produces a step-by-step record. For example, a registration placed on the waitlist because capacity was reached:
          </p>

          <div className="mt-6 border border-border bg-ivory-light p-5 font-mono text-xs">
            <div className="text-muted uppercase text-2xs tracking-wider">REGISTRATION DECISION</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-muted text-2xs">Student</div>
                <div className="text-ink">S-1044</div>
              </div>
              <div>
                <div className="text-muted text-2xs">Session</div>
                <div className="text-ink">AI-01</div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <div className="text-muted uppercase text-2xs tracking-wider mb-2">Decision Trace</div>
              <div className="space-y-1 text-ink">
                <div>01 Request validation       <span className="text-teal">PASS</span></div>
                <div>02 Student verification     <span className="text-teal">PASS</span></div>
                <div>03 Session verification     <span className="text-teal">PASS</span></div>
                <div>04 Duplicate check          <span className="text-teal">PASS</span></div>
                <div>05 Capacity check           <span className="text-coral">FAIL</span></div>
                <div>06 Waitlist eligibility     <span className="text-teal">PASS</span></div>
                <div>07 Queue position           <span className="text-ochre-dark">#01</span></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-muted uppercase text-2xs tracking-wider">Final Decision</div>
              <div className="mt-1 text-ink">WAITLISTED</div>
              <div className="text-muted text-2xs mt-1">Reason: SESSION_CAPACITY_REACHED</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-4 lg:px-8 py-14">
          <h2 className="text-xl font-semibold text-ink">Rule-driven behavior</h2>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Capacity policy, duplicate policy, cancellation policy, and ordering policy are all configurable from the Rules page. Changes are audited and take effect immediately on the next engine run.
          </p>
          <div className="mt-6">
            <Button asChild variant="primary">
              <Link href="/dashboard/rules">View live rules</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}