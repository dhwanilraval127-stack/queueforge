'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, UTILITY_ITEMS } from '@/components/navigation/nav-items';
import { cn } from '@/lib/utils/cn';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-navy text-ivory">
      <div className="px-5 py-5 border-b border-slate">
        <Link href="/" className="block">
          <span className="font-mono text-sm font-semibold tracking-wider">QUEUEFORGE</span>
          <div className="mt-1 text-2xs uppercase tracking-widest text-muted-light">
            Registration Operations
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-slate text-ivory border-l-2 border-teal'
                      : 'text-muted-light hover:bg-slate/60 hover:text-ivory border-l-2 border-transparent'
                  )}
                >
                  <span className="font-mono text-2xs text-muted-light">{item.number}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-4 border-t border-slate" />

        <ul className="space-y-0.5">
          {UTILITY_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-slate text-ivory'
                      : 'text-muted-light hover:bg-slate/60 hover:text-ivory'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate px-4 py-3 font-mono text-2xs text-muted-light">
        v1.0 • Operations
      </div>
    </aside>
  );
}