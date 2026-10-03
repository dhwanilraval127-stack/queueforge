import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-ivory-light/50 p-10 text-center">
      <div className="text-muted mb-3">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}