'use client';
import { useCallback, useEffect, useState } from 'react';
import type { ApiResponse, ApiMeta } from '@/types/api';
import type { AuditEvent } from '@/types/audit';

interface Filters {
  eventType?: string;
  sessionId?: string;
  registrationId?: string;
  page?: number;
  pageSize?: number;
}

export function useAudit(filters: Filters) {
  const [data, setData] = useState<AuditEvent[]>([]);
  const [meta, setMeta] = useState<ApiMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
      });
      const res = await fetch(`/api/audit?${params.toString()}`);
      const json: ApiResponse<AuditEvent[]> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      setData(json.data || []);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, meta, loading, error, refresh };
}