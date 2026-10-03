'use client';
import { useState } from 'react';
import { useAudit } from '@/hooks/use-audit';
import { PageHeader } from '@/components/layout/page-header';
import { AuditFilters } from '@/components/audit/audit-filters';
import { AuditTimeline } from '@/components/audit/audit-timeline';
import { Pagination } from '@/components/shared/pagination';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ExportButton } from '@/components/shared/export-button';
import { FileText } from 'lucide-react';

export default function AuditPage() {
  const [eventType, setEventType] = useState('');
  const [page, setPage] = useState(1);
  const { data, meta, loading, error } = useAudit({
    eventType: eventType || undefined,
    page,
    pageSize: 50,
  });

  return (
    <>
      <PageHeader
        number="05"
        title="Audit"
        description="Every decision, transition, and system event with full context."
        actions={<ExportButton filename="audit.csv" data={data as unknown as Record<string, unknown>[]} />}
      />

      <div className="mb-5">
        <AuditFilters eventType={eventType} onChange={(p) => { setEventType(p.eventType || ''); setPage(1); }} />
      </div>

      {error && (
        <div className="mb-4 border border-coral/30 bg-coral/5 p-3 text-sm text-coral-dark">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={10} />
      ) : data.length === 0 ? (
        <EmptyState icon={<FileText className="h-8 w-8" />} title="No audit events yet" />
      ) : (
        <>
          <AuditTimeline events={data} />
          {meta && (
            <Pagination
              page={meta.page || 1}
              pageSize={meta.pageSize || 50}
              total={meta.total || 0}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </>
  );
}