import type { SimulationResult } from '@/types/simulation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function SimulationComparison({ result }: { result: SimulationResult }) {
  const { currentState, simulatedState, differences } = result;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent>
            <SnapshotTable
              capacity={currentState.sessionCapacity}
              accepted={currentState.acceptedCount}
              waitlist={currentState.waitlistCount}
              util={currentState.utilization}
            />
          </CardContent>
        </Card>
        <Card className="border-ochre/40">
          <CardHeader>
            <CardTitle>
              <span className="text-ochre-dark">Simulated State</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SnapshotTable
              capacity={simulatedState.sessionCapacity}
              accepted={simulatedState.acceptedCount}
              waitlist={simulatedState.waitlistCount}
              util={simulatedState.utilization}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Decision Differences ({differences.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {differences.length === 0 ? (
            <p className="p-5 text-xs text-muted">No differences — simulated outcome matches current state.</p>
          ) : (
            <ul className="divide-y divide-border">
              {differences.map((d, i) => (
                <li key={`${d.registrationId}-${i}`} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-ink">{d.studentId}</div>
                    <div className="text-xs text-muted mt-0.5">{d.reason}</div>
                  </div>
                  <div className="text-right font-mono text-2xs">
                    <div className="text-muted">{d.currentStatus}</div>
                    <div className="text-ochre-dark">→ {d.simulatedStatus}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SnapshotTable({ capacity, accepted, waitlist, util }: { capacity: number; accepted: number; waitlist: number; util: number }) {
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt className="text-2xs uppercase text-muted">Capacity</dt>
        <dd className="font-mono text-ink">{capacity}</dd>
      </div>
      <div>
        <dt className="text-2xs uppercase text-muted">Accepted</dt>
        <dd className="font-mono text-ink">{accepted}</dd>
      </div>
      <div>
        <dt className="text-2xs uppercase text-muted">Waitlist</dt>
        <dd className="font-mono text-ink">{waitlist}</dd>
      </div>
      <div>
        <dt className="text-2xs uppercase text-muted">Utilization</dt>
        <dd className="font-mono text-ink">{util.toFixed(1)}%</dd>
      </div>
    </dl>
  );
}