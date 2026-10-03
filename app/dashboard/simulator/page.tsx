'use client';
import { useState } from 'react';
import { useSessions } from '@/hooks/use-sessions';
import { PageHeader } from '@/components/layout/page-header';
import { SimulationForm } from '@/components/simulator/simulation-form';
import { SimulationComparison } from '@/components/simulator/simulation-comparison';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { useAppStore } from '@/stores/app-store';
import type { SimulationInput, SimulationResult } from '@/types/simulation';
import { AlertTriangle } from 'lucide-react';

export default function SimulatorPage() {
  const { data: sessions, loading } = useSessions();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const pushToast = useAppStore((s) => s.pushToast);

  const run = async (input: SimulationInput) => {
    setRunning(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Simulation failed');
      setResult(json.data);
      pushToast({ variant: 'success', message: 'Simulation complete' });
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <PageHeader
        number="07"
        title="Simulator"
        description="Test rule changes, capacity adjustments, and hypothetical registrations safely."
      />

      <div className="mb-4 border border-ochre/40 bg-ochre/5 p-3 flex items-start gap-2 text-xs text-ochre-dark">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          Simulations execute against a snapshot. Production registrations and audit records are not modified.
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <SimulationForm sessions={sessions} running={running} onRun={run} />
          </div>
          <div className="lg:col-span-2">
            {result ? (
              <SimulationComparison result={result} />
            ) : (
              <div className="border border-dashed border-border p-10 text-center text-xs text-muted">
                Run a simulation to see current vs simulated state.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}