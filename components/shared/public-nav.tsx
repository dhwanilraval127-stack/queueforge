'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/registration-management', label: 'Registrations' },
  { href: '/waitlist-management', label: 'Waitlists' },
  { href: '/capacity-management', label: 'Capacity' },
  { href: '/auditability', label: 'Audit' },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-ivory/95 backdrop-blur">
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="font-mono text-sm font-semibold tracking-wider text-ink">
          QUEUEFORGE
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm" variant="primary">
            <Link href="/dashboard">Open application</Link>
          </Button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-ink"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn('md:hidden border-t border-border bg-ivory-light', !open && 'hidden')}>
        <nav className="px-4 py-3 flex flex-col gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-ink py-2"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild variant="primary" className="mt-2">
            <Link href="/dashboard">Open application</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}