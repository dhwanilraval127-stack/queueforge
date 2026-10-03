import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { formatRelative } from '@/lib/utils/date';
import type { AuditEvent } from '@/types/audit';
import { FileText } from 'lucide-react';

export function RecentActivity({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No activity yet"
            description="Import a CSV or create a registration to see events."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {events.map((e) => (
            <li key={e.id} className="px-5 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-2xs text-muted uppercase">
                    {e.eventType.replace(/_/g, ' ')}
                  </div>
                  <div className="mt-0.5 text-xs text-ink truncate">{e.message}</div>
                </div>
                <div className="font-mono text-2xs text-muted shrink-0">
                  {formatRelative(e.createdAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}