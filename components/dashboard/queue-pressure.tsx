import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import type { SessionWithStats } from '@/types/session';
import { Clock } from 'lucide-react';

export function QueuePressure({ sessions }: { sessions: SessionWithStats[] }) {
  const withQueue = sessions.filter((s) => s.waitlistCount > 0);
  if (withQueue.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue Pressure</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title="No active waitlists"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue Pressure</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {withQueue.map((s) => (
            <li key={s.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs text-ink">{s.code}</div>
                <div className="text-2xs text-muted">{s.name}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-ochre-dark font-semibold">
                  {s.waitlistCount}
                </div>
                <div className="text-2xs text-muted">waiting</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}