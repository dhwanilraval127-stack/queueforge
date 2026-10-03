'use client';
import { useCallback, useEffect, useState } from 'react';
import type { ApiResponse } from '@/types/api';
import type { DashboardMetrics } from '@/lib/services/dashboard-service';

export function useDashboard() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      const json: ApiResponse<DashboardMetrics> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      setData(json.data || null);
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