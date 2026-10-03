import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <Sidebar />
      <div className="lg:pl-60">
        <Header />
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}