import { MetricCard } from './metric-card';
import type { DashboardMetrics } from '@/lib/services/dashboard-service';

export function MetricsGrid({ data }: { data: DashboardMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <MetricCard label="Total Requests" value={data.totalRequests} />
      <MetricCard label="Accepted" value={data.accepted} accent="teal" />
      <MetricCard label="Waitlisted" value={data.waitlisted} accent="ochre" />
      <MetricCard label="Conflicts" value={data.conflicts} accent="coral" />
      <MetricCard label="Cancellations" value={data.cancellations} accent="muted" />
    </div>
  );
}