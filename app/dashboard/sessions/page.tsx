'use client';
import { useState } from 'react';
import { useSessions } from '@/hooks/use-sessions';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CapacityIndicator } from '@/components/sessions/capacity-indicator';
import { SessionForm } from '@/components/sessions/session-form';
import { EmptyState } from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import type { SessionWithStats } from '@/types/session';
import { Plus, Edit3, LayoutGrid } from 'lucide-react';

export default function SessionsPage() {
  const { data, loading, error, refresh } = useSessions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SessionWithStats | undefined>();

  return (
    <>
      <PageHeader
        number="03"
        title="Sessions"
        description="Capacity, utilization, and waitlist pressure per session."
        actions={
          <Button
            size="sm"
            onClick={() => { setEditing(undefined); setFormOpen(true); }}
          >
            <Plus className="h-4 w-4" />
            New session
          </Button>
        }
      />

      {error && (
        <div className="mb-4 border border-coral/30 bg-coral/5 p-3 text-sm text-coral-dark">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="h-8 w-8" />}
          title="No sessions yet"
          description="Create a session to begin accepting registrations."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Create session
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden md:block border border-border bg-ivory-light">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-56">Capacity</TableHead>
                  <TableHead>Waitlist</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-ink">{s.code}</TableCell>
                    <TableCell className="text-sm">{s.name}</TableCell>
                    <TableCell>
                      <CapacityIndicator
                        accepted={s.acceptedCount}
                        capacity={s.capacity}
                        waitlist={0}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.waitlistCount}</TableCell>
                    <TableCell>
                      <Badge variant={s.active ? 'accepted' : 'cancelled'}>
                        {s.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                        onClick={() => { setEditing(s); setFormOpen(true); }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-2">
            {data.map((s) => (
              <div key={s.id} className="border border-border bg-ivory-light p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-xs text-ink">{s.code}</div>
                    <div className="text-xs text-muted">{s.name}</div>
                  </div>
                  <Badge variant={s.active ? 'accepted' : 'cancelled'}>
                    {s.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="mt-3">
                  <CapacityIndicator
                    accepted={s.acceptedCount}
                    capacity={s.capacity}
                    waitlist={s.waitlistCount}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(s); setFormOpen(true); }}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {formOpen && (
        <SessionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          session={editing}
          onSaved={refresh}
        />
      )}
    </>
  );
}