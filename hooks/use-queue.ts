'use client';
import { useCallback, useEffect, useState } from 'react';
import type { ApiResponse } from '@/types/api';
import type { Registration } from '@/types/registration';
import type { Session } from '@/types/session';

interface QueueGroup {
  session: Session;
  waitlist: Registration[];
  count: number;
}

export function useQueue(sessionId?: string) {
  const [data, setData] = useState<QueueGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = sessionId ? `/api/queue?sessionId=${encodeURIComponent(sessionId)}` : '/api/queue';
      const res = await fetch(url);
      const json: ApiResponse<QueueGroup[]> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      setData(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}   