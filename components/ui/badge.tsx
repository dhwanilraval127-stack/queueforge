import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-medium uppercase tracking-wide font-mono',
  {
    variants: {
      variant: {
        default: 'bg-ivory-dark text-ink border border-border',
        accepted: 'bg-teal/10 text-teal-dark border border-teal/30',
        waitlisted: 'bg-ochre/10 text-ochre-dark border border-ochre/30',
        cancelled: 'bg-muted/10 text-muted border border-muted/30',
        rejected: 'bg-coral/10 text-coral-dark border border-coral/30',
        info: 'bg-slate/10 text-slate border border-slate/30',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}