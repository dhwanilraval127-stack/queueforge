'use client';
import { useDashboard } from '@/hooks/use-dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { MetricsGrid } from '@/components/dashboard/metrics-grid';
import { SessionUtilization } from '@/components/dashboard/session-utilization';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RegistrationChart } from '@/components/dashboard/registration-chart';
import { QueuePressure } from '@/components/dashboard/queue-pressure';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { useAppStore } from '@/stores/app-store';
import { RefreshCw, Database } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/shared/empty-state';

export default function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard();
  const pushToast = useAppStore((s) => s.pushToast);
  const [sampling, setSampling] = useState(false);

  const loadSample = async () => {
    setSampling(true);
    try {
      const res = await fetch('/api/sample-data', { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      pushToast({ variant: 'success', message: 'Sample data loaded' });
      await refresh();
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed to load sample' });
    } finally {
      setSampling(false);
    }
  };

  const clearSample = async () => {
    setSampling(true);
    try {
      const res = await fetch('/api/sample-data', { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      pushToast({ variant: 'success', message: 'Sample data cleared' });
      await refresh();
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed to clear sample' });
    } finally {
      setSampling(false);
    }
  };

  return (
    <>
      <PageHeader
        number="01"
        title="Registration Operations"
        description="Live overview of registration flow, session utilization, and audit activity."
        actions={
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-4 border border-coral/30 bg-coral/5 p-3 text-sm text-coral-dark">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="space-y-4">
          <TableSkeleton rows={2} />
          <TableSkeleton rows={6} />
        </div>
      ) : data ? (
        data.totalRequests === 0 ? (
          <EmptyState
            icon={<Database className="h-8 w-8" />}
            title="No registrations yet"
            description="Import a CSV file or load sample data to see the system in action."
            action={
              <div className="flex gap-2">
                <Button onClick={loadSample} disabled={sampling}>
                  {sampling ? 'Loading…' : 'Load Sample Data'}
                </Button>
              </div>
            }
          />
        ) : (
          <div className="space-y-6">
            <MetricsGrid data={data} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <SessionUtilization sessions={data.sessions} />
                <RegistrationChart data={data} />
              </div>
              <div className="space-y-4">
                <QueuePressure sessions={data.sessions} />
                <RecentActivity events={data.recentActivity} />
              </div>
            </div>

            <div className="border border-border bg-ivory-light p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink">Data Quality</div>
                  <div className="mt-1 font-mono text-xs text-muted">
                    {data.dataQuality.validRegistrations} valid · {data.dataQuality.rejectedRegistrations} rejected ·
                    {' '}
                    {data.dataQuality.rejectionRate.toFixed(1)}% rejection rate
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearSample} disabled={sampling}>
                    Clear Sample Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadSample} disabled={sampling}>
                    Reload Sample
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      ) : null}
    </>
  );
}