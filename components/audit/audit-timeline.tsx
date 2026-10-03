import type { AuditEvent } from '@/types/audit';
import { formatTimestamp } from '@/lib/utils/date';
import { Badge } from '@/components/ui/badge';

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  return (
    <div className="border border-border bg-ivory-light">
      <ol className="divide-y divide-border">
        {events.map((e) => (
          <li key={e.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="info">{e.eventType.replace(/_/g, ' ')}</Badge>
                  {e.previousStatus && e.newStatus && (
                    <span className="font-mono text-2xs text-muted">
                      {e.previousStatus} → {e.newStatus}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-ink">{e.message}</div>
                <div className="mt-1 flex flex-wrap gap-3 font-mono text-2xs text-muted">
                  {e.registrationId && <span>reg: {e.registrationId.slice(0, 18)}…</span>}
                  {e.studentId && <span>student: {e.studentId}</span>}
                  {e.sessionId && <span>session: {e.sessionId}</span>}
                  <span>code: {e.reasonCode}</span>
                </div>
              </div>
              <div className="font-mono text-2xs text-muted shrink-0">
                {formatTimestamp(e.createdAt)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}