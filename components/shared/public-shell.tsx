import type { ReactNode } from 'react';
import { PublicNav } from './public-nav';
import { PublicFooter } from './public-footer';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}