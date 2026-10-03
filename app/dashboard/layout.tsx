import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { ToastViewport } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'QueueForge Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppLayout>{children}</AppLayout>
      <ToastViewport />
    </>
  );
}