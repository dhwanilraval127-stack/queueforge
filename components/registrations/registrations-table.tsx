'use client';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatTimestamp } from '@/lib/utils/date';
import type { Registration } from '@/types/registration';
import { Eye, XCircle } from 'lucide-react';

interface Props {
  registrations: Registration[];
  onCancel: (reg: Registration) => void;
}

export function RegistrationsTable({ registrations, onCancel }: Props) {
  return (
    <>
      <div className="hidden md:block border border-border bg-ivory-light">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seq</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs text-muted">
                  #{String(r.originalSequence).padStart(4, '0')}
                </TableCell>
                <TableCell className="font-mono text-xs">{r.studentId}</TableCell>
                <TableCell className="font-mono text-xs">{r.sessionId}</TableCell>
                <TableCell className="font-mono text-xs text-muted">
                  {formatTimestamp(r.registeredAt)}
                </TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="font-mono text-xs">
                  {r.queuePosition ? `#${String(r.queuePosition).padStart(2, '0')}` : '—'}
                </TableCell>
                <TableCell className="font-mono text-2xs text-muted truncate max-w-[150px]">
                  {r.reasonCode || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="View trace">
                      <Link href={`/dashboard/registrations/${r.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {(r.status === 'ACCEPTED' || r.status === 'WAITLISTED') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Cancel registration"
                        onClick={() => onCancel(r)}
                      >
                        <XCircle className="h-4 w-4 text-coral" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile stacked view */}
      <div className="md:hidden space-y-2">
        {registrations.map((r) => (
          <div key={r.id} className="border border-border bg-ivory-light p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-xs text-ink">{r.studentId}</div>
                <div className="font-mono text-2xs text-muted">{r.sessionId}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-2xs">
              <div>
                <div className="text-muted uppercase">Sequence</div>
                <div className="font-mono text-ink">#{String(r.originalSequence).padStart(4, '0')}</div>
              </div>
              <div>
                <div className="text-muted uppercase">Queue</div>
                <div className="font-mono text-ink">
                  {r.queuePosition ? `#${String(r.queuePosition).padStart(2, '0')}` : '—'}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-muted uppercase">Timestamp</div>
                <div className="font-mono text-ink">{formatTimestamp(r.registeredAt)}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/registrations/${r.id}`}>View trace</Link>
              </Button>
              {(r.status === 'ACCEPTED' || r.status === 'WAITLISTED') && (
                <Button variant="outline" size="sm" onClick={() => onCancel(r)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}