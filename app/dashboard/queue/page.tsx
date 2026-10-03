'use client';
import { useQueue } from '@/hooks/use-queue';
import { PageHeader } from '@/components/layout/page-header';
import { QueueSessionGroup } from '@/components/queue/queue-session-group';
import { EmptyState } from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';

export default function QueuePage() {
  const { data, loading, error, refresh } = useQueue();

  const withQueues = data.filter((g) => g.waitlist.length > 0);

  return (
    <>
      <PageHeader
        number="04"
        title="Queue"
        description="Waitlisted registrations grouped by session, in FIFO order."
        actions={
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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
      ) : withQueues.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-8 w-8" />}
          title="No active waitlists"
          description="Waitlists appear here when sessions reach capacity."
        />
      ) : (
        <div className="space-y-4">
          {withQueues.map((g) => (
            <QueueSessionGroup key={g.session.id} session={g.session} waitlist={g.waitlist} />
          ))}
        </div>
      )}
    </>
  );
}