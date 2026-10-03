'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Registration } from '@/types/registration';
import type { ApiResponse, ApiMeta } from '@/types/api';

interface Filters {
  status?: string;
  sessionId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useRegistrations(filters: Filters) {
  const [data, setData] = useState<Registration[]>([]);
  const [meta, setMeta] = useState<ApiMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          params.set(k, String(v));
        }
      });
      const res = await fetch(`/api/registrations?${params.toString()}`);
      const json: ApiResponse<Registration[]> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Request failed');
      setData(json.data || []);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, meta, loading, error, refresh };
}