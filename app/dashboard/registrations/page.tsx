'use client';
import { useState } from 'react';
import { useRegistrations } from '@/hooks/use-registrations';
import { useSessions } from '@/hooks/use-sessions';
import { useDebounce } from '@/hooks/use-debounce';
import { PageHeader } from '@/components/layout/page-header';
import { RegistrationFilters } from '@/components/registrations/registration-filters';
import { RegistrationsTable } from '@/components/registrations/registrations-table';
import { Pagination } from '@/components/shared/pagination';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ExportButton } from '@/components/shared/export-button';
import { useAppStore } from '@/stores/app-store';
import type { Registration } from '@/types/registration';
import { ListChecks } from 'lucide-react';

export default function RegistrationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Registration | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: sessions } = useSessions();
  const { data, meta, loading, error, refresh } = useRegistrations({
    status: status || undefined,
    sessionId: sessionId || undefined,
    search: debouncedSearch || undefined,
    page,
    pageSize: 25,
  });
  const pushToast = useAppStore((s) => s.pushToast);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      const res = await fetch(`/api/registrations/${cancelTarget.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Cancellation failed');
      const promoted = json.data?.promoted;
      pushToast({
        variant: 'success',
        message: promoted
          ? `Cancelled. Student ${promoted.studentId} promoted from waitlist.`
          : 'Registration cancelled.',
      });
      await refresh();
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed' });
      throw err;
    }
  };

  return (
    <>
      <PageHeader
        number="02"
        title="Registrations"
        description="Every registration decision made by the deterministic engine."
        actions={<ExportButton filename="registrations.csv" data={data as unknown as Record<string, unknown>[]} />}
      />

      <div className="mb-5">
        <RegistrationFilters
          search={search}
          status={status}
          sessionId={sessionId}
          sessions={sessions}
          onChange={(patch) => {
            if ('search' in patch) setSearch(patch.search || '');
            if ('status' in patch) setStatus(patch.status || '');
            if ('sessionId' in patch) setSessionId(patch.sessionId || '');
            setPage(1);
          }}
        />
      </div>

      {error && (
        <div className="mb-4 border border-coral/30 bg-coral/5 p-3 text-sm text-coral-dark">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-8 w-8" />}
          title="No registrations match"
          description="Adjust filters or import a CSV to add registrations."
        />
      ) : (
        <>
          <RegistrationsTable
            registrations={data}
            onCancel={(reg) => setCancelTarget(reg)}
          />
          {meta && (
            <Pagination
              page={meta.page || 1}
              pageSize={meta.pageSize || 25}
              total={meta.total || 0}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel registration?"
        description={
          cancelTarget
            ? `This will mark ${cancelTarget.studentId} → ${cancelTarget.sessionId} as CANCELLED. If applicable, the next waitlisted registration will be promoted.`
            : undefined
        }
        confirmLabel="Cancel registration"
        cancelLabel="Keep registration"
        destructive
        onConfirm={handleCancel}
      />
    </>
  );
}