'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { DecisionTrace } from '@/components/registrations/decision-trace';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAppStore } from '@/stores/app-store';
import type { Registration } from '@/types/registration';
import type { AuditEvent } from '@/types/audit';
import { ArrowLeft } from 'lucide-react';

export default function RegistrationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pushToast = useAppStore((s) => s.pushToast);

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/registrations/${params.id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Not found');
      setRegistration(json.data.registration);
      setEvents(json.data.auditEvents || []);
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const cancellable =
    registration?.status === 'ACCEPTED' || registration?.status === 'WAITLISTED';

  const handleCancel = async () => {
    const res = await fetch(`/api/registrations/${params.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed');
    pushToast({ variant: 'success', message: 'Registration cancelled' });
    await load();
  };

  return (
    <>
      <PageHeader
        title={`Registration ${params.id.slice(0, 16)}…`}
        description="Full deterministic decision trace and audit timeline."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {cancellable && (
              <Button variant="danger" size="sm" onClick={() => setConfirmCancel(true)}>
                Cancel registration
              </Button>
            )}
          </div>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : registration ? (
        <DecisionTrace registration={registration} events={events} />
      ) : (
        <p className="text-sm text-muted">Registration not found. <Link href="/dashboard/registrations" className="underline">Back to list</Link>.</p>
      )}

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this registration?"
        description="The next eligible waitlisted registration will be promoted if applicable."
        destructive
        confirmLabel="Cancel registration"
        onConfirm={handleCancel}
      />
    </>
  );
}