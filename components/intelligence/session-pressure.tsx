import type { SessionPressure } from '@/types/intelligence';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const levelVariant = {
  LOW: 'accepted',
  MODERATE: 'info',
  HIGH: 'waitlisted',
  CRITICAL: 'rejected',
} as const;

export function SessionPressureCard({ pressure }: { pressure: SessionPressure[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Pressure</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {pressure.map((p) => (
            <li key={p.sessionId} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs text-ink">{p.sessionCode}</div>
                <div className="font-mono text-2xs text-muted">
                  util {p.utilization.toFixed(0)}% · waitlist {p.waitlistRatio.toFixed(0)}%
                </div>
              </div>
              <Badge variant={levelVariant[p.level]}>{p.level}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}