import { formatRelative, formatTimestamp } from '@/lib/utils/date';
import type { Registration } from '@/types/registration';

export function QueueItem({ reg }: { reg: Registration }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-ivory-dark/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-xs text-ochre-dark w-8 shrink-0">
          #{String(reg.queuePosition || 0).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <div className="font-mono text-xs text-ink">{reg.studentId}</div>
          <div className="font-mono text-2xs text-muted">
            registered {formatTimestamp(reg.registeredAt)}
          </div>
        </div>
      </div>
      <div className="font-mono text-2xs text-muted shrink-0">
        waiting {formatRelative(reg.createdAt)}
      </div>
    </li>
  );
}