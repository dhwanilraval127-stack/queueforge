'use client';
import Link from 'next/link';
import { MobileNav } from './mobile-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-ivory-light px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <Link href="/" className="lg:hidden font-mono text-sm font-semibold">
          QUEUEFORGE
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-xs text-muted hover:text-ink transition-colors"
        >
          Public site
        </Link>
      </div>
    </header>
  );
}