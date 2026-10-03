'use client';
import { useCallback, useEffect, useState } from 'react';
import type { SessionWithStats } from '@/types/session';
import type { ApiResponse } from '@/types/api';

export function useSessions() {
  const [data, setData] = useState<SessionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sessions');
      const json: ApiResponse<SessionWithStats[]> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      setData(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}