'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NAV_ITEMS, UTILITY_ITEMS } from '@/components/navigation/nav-items';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-navy text-ivory p-0">
          <div className="px-5 py-5 border-b border-slate">
            <span className="font-mono text-sm font-semibold tracking-wider">QUEUEFORGE</span>
          </div>
          <nav className="px-2 py-3">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm',
                    active ? 'bg-slate text-ivory' : 'text-muted-light'
                  )}
                >
                  <span className="font-mono text-2xs">{item.number}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="my-3 border-t border-slate" />
            {UTILITY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-muted-light"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}