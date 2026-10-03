'use client';
import { useAppStore } from '@/stores/app-store';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ToastViewport() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const Icon = t.variant === 'success' ? CheckCircle2 : t.variant === 'error' ? AlertCircle : Info;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'flex items-start gap-3 border p-3 bg-ivory-light shadow-md',
              t.variant === 'success' && 'border-teal/50',
              t.variant === 'error' && 'border-coral/50',
              t.variant === 'info' && 'border-border'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 mt-0.5 shrink-0',
                t.variant === 'success' && 'text-teal',
                t.variant === 'error' && 'text-coral',
                t.variant === 'info' && 'text-muted'
              )}
            />
            <div className="flex-1 text-sm text-ink">{t.message}</div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted hover:text-ink"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}