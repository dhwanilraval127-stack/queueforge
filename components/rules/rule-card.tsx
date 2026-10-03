import type { ReactNode } from 'react';

interface Props {
  name: string;
  behavior: string;
  example?: string;
  children?: ReactNode;
}

export function RuleCard({ name, behavior, example, children }: Props) {
  return (
    <div className="border border-border bg-ivory-light p-4">
      <div className="text-2xs font-semibold uppercase tracking-wider text-muted">{name}</div>
      <div className="mt-2 text-sm text-ink">{behavior}</div>
      {example && (
        <div className="mt-2 border-l-2 border-teal/40 pl-3 font-mono text-2xs text-muted">
          Example: {example}
        </div>
      )}
      {children}
    </div>
  );
}