import type { ReactNode } from 'react';

interface Props {
  number?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ number, title, description, actions }: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-baseline gap-3">
          {number && (
            <span className="font-mono text-xs text-muted">{number}</span>
          )}
          <h1 className="text-xl font-semibold text-ink">{title}</h1>
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}