import type { SessionWithStats } from '@/types/session';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils/cn';
import { LayoutGrid } from 'lucide-react';

export function SessionUtilization({ sessions }: { sessions: SessionWithStats[] }) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<LayoutGrid className="h-6 w-6" />}
            title="No sessions yet"
            description="Create a session or import CSV data to see utilization."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {sessions.map((s) => {
            const pct = Math.min(100, Math.round(s.utilization));
            const barColor =
              pct >= 100
                ? 'bg-coral'
                : pct >= 80
                  ? 'bg-ochre'
                  : 'bg-teal';
            return (
              <li key={s.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-ink">{s.code}</div>
                    <div className="text-2xs text-muted truncate">{s.name}</div>
                  </div>
                  <div className="font-mono text-xs text-ink shrink-0">
                    {s.acceptedCount} / {s.capacity}
                    <span className="ml-2 text-muted">{pct}%</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-border overflow-hidden">
                  <div
                    className={cn('h-full transition-all', barColor)}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                {s.waitlistCount > 0 && (
                  <div className="mt-1 text-2xs text-ochre-dark font-mono">
                    + {s.waitlistCount} waitlisted
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}