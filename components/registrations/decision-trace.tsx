import type { AuditEvent } from '@/types/audit';
import type { Registration } from '@/types/registration';
import { formatTimestamp } from '@/lib/utils/date';
import { StatusBadge } from '@/components/shared/status-badge';
import { Check, X, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  registration: Registration;
  events: AuditEvent[];
}

const resultIcon = {
  PASS: <Check className="h-3.5 w-3.5 text-teal" />,
  FAIL: <X className="h-3.5 w-3.5 text-coral" />,
  SKIP: <Minus className="h-3.5 w-3.5 text-muted" />,
  INFO: <Info className="h-3.5 w-3.5 text-slate" />,
};

export function DecisionTrace({ registration, events }: Props) {
  // Reconstruct trace from metadata if present, otherwise show audit timeline
  const decisionEvent = events[0];
  const traceSteps =
    (decisionEvent?.metadata as { trace?: Array<{ step: number; name: string; result: 'PASS' | 'FAIL' | 'SKIP' | 'INFO'; detail?: string }> } | undefined)?.trace;

  return (
    <div className="space-y-4">
      <div className="border border-border bg-ivory-light p-4">
        <div className="text-2xs uppercase tracking-wider text-muted">Registration Decision</div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-2xs uppercase text-muted">Student</div>
            <div className="font-mono text-ink">{registration.studentId}</div>
          </div>
          <div>
            <div className="text-2xs uppercase text-muted">Session</div>
            <div className="font-mono text-ink">{registration.sessionId}</div>
          </div>
          <div>
            <div className="text-2xs uppercase text-muted">Registered</div>
            <div className="font-mono text-xs text-ink">{formatTimestamp(registration.registeredAt)}</div>
          </div>
          <div>
            <div className="text-2xs uppercase text-muted">Sequence</div>
            <div className="font-mono text-xs text-ink">#{String(registration.originalSequence).padStart(4, '0')}</div>
          </div>
        </div>
      </div>

      <div className="border border-border bg-ivory-light">
        <div className="border-b border-border px-4 py-2 text-2xs font-semibold uppercase tracking-wider text-muted">
          Decision Trace
        </div>
        <div className="p-4">
          {traceSteps && traceSteps.length > 0 ? (
            <ol className="space-y-1.5">
              {traceSteps.map((step) => (
                <li key={step.step} className="flex items-start gap-3 text-xs">
                  <span className="font-mono text-muted shrink-0 w-6">{String(step.step).padStart(2, '0')}</span>
                  <span className="shrink-0 mt-0.5">{resultIcon[step.result]}</span>
                  <span className="flex-1 min-w-0">
                    <span className="text-ink">{step.name}</span>
                    {step.detail && (
                      <span className="block text-muted mt-0.5">{step.detail}</span>
                    )}
                  </span>
                  <span className={cn(
                    'font-mono text-2xs uppercase shrink-0',
                    step.result === 'PASS' && 'text-teal',
                    step.result === 'FAIL' && 'text-coral',
                    step.result === 'SKIP' && 'text-muted',
                    step.result === 'INFO' && 'text-slate',
                  )}>
                    {step.result}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-muted">
              Full trace not available for this registration. Showing audit timeline below.
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-2xs uppercase text-muted mb-2">Final Decision</div>
            <div className="flex items-center gap-3">
              <StatusBadge status={registration.status} />
              <span className="font-mono text-xs text-muted">
                {registration.reasonCode}
              </span>
              {registration.queuePosition !== undefined && (
                <span className="font-mono text-xs text-ochre-dark">
                  queue #{String(registration.queuePosition).padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border bg-ivory-light">
        <div className="border-b border-border px-4 py-2 text-2xs font-semibold uppercase tracking-wider text-muted">
          Audit Timeline
        </div>
        <ol className="divide-y divide-border">
          {events.map((e) => (
            <li key={e.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-2xs uppercase text-muted">{e.eventType.replace(/_/g, ' ')}</div>
                  <div className="mt-0.5 text-xs text-ink">{e.message}</div>
                  {e.previousStatus && e.newStatus && (
                    <div className="mt-1 font-mono text-2xs text-muted">
                      {e.previousStatus} → {e.newStatus}
                    </div>
                  )}
                </div>
                <div className="font-mono text-2xs text-muted shrink-0">
                  {formatTimestamp(e.createdAt)}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}   