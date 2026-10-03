import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-9 w-full border border-border bg-ivory-light px-3 py-1 text-sm text-ink placeholder:text-muted focus:border-teal disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';