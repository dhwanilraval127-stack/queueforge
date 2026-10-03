import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface Props {
  label: string;
  value: number | string;
  sublabel?: string;
  accent?: 'default' | 'teal' | 'ochre' | 'coral' | 'muted';
  icon?: ReactNode;
}

const accentClass = {
  default: 'text-ink',
  teal: 'text-teal-dark',
  ochre: 'text-ochre-dark',
  coral: 'text-coral-dark',
  muted: 'text-muted',
};

export function MetricCard({ label, value, sublabel, accent = 'default', icon }: Props) {
  return (
    <div className="border border-border bg-ivory-light p-4">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className={cn('mt-2 font-mono text-2xl font-semibold', accentClass[accent])}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-2xs text-muted">{sublabel}</div>
      )}
    </div>
  );
}