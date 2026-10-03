import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-ivory-dark/50 mt-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="font-mono text-xs font-semibold text-ink">QUEUEFORGE</div>
          <p className="mt-2 text-xs text-muted max-w-xs">
            Registration operations with deterministic decisions and full auditability.
          </p>
        </div>
        <div>
          <div className="text-2xs uppercase tracking-wider text-muted font-semibold">Product</div>
          <ul className="mt-2 space-y-1.5 text-xs">
            <li><Link href="/features" className="text-ink hover:text-teal">Features</Link></li>
            <li><Link href="/how-it-works" className="text-ink hover:text-teal">How it works</Link></li>
            <li><Link href="/dashboard" className="text-ink hover:text-teal">Open application</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-2xs uppercase tracking-wider text-muted font-semibold">Capabilities</div>
          <ul className="mt-2 space-y-1.5 text-xs">
            <li><Link href="/registration-management" className="text-ink hover:text-teal">Registrations</Link></li>
            <li><Link href="/waitlist-management" className="text-ink hover:text-teal">Waitlists</Link></li>
            <li><Link href="/capacity-management" className="text-ink hover:text-teal">Capacity</Link></li>
            <li><Link href="/auditability" className="text-ink hover:text-teal">Auditability</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-2xs uppercase tracking-wider text-muted font-semibold">Resources</div>
          <ul className="mt-2 space-y-1.5 text-xs">
            <li><Link href="/dashboard/rules" className="text-ink hover:text-teal">Rule sheet</Link></li>
            <li><Link href="/dashboard/import" className="text-ink hover:text-teal">CSV import</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 lg:px-8 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="font-mono text-2xs text-muted">v1.0 · Operations</div>
          <div className="font-mono text-2xs text-muted">© {new Date().getFullYear()} QueueForge</div>
        </div>
      </div>
    </footer>
  );
}