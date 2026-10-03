'use client';
import { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { SessionWithStats } from '@/types/session';
import type { SimulationInput } from '@/types/simulation';

interface Props {
  sessions: SessionWithStats[];
  running: boolean;
  onRun: (input: SimulationInput) => void;
}

export function SimulationForm({ sessions, running, onRun }: Props) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id || '');
  const [overrideCap, setOverrideCap] = useState(false);
  const [capacityOverride, setCapacityOverride] = useState<number>(sessions[0]?.capacity || 0);
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);
  const [addRegsText, setAddRegsText] = useState('');

  const run = () => {
    const additional = addRegsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [studentId, sId, ts] = line.split(',').map((s) => s.trim());
        return {
          studentId,
          sessionId: sId || sessionId,
          timestamp: ts || new Date().toISOString(),
        };
      })
      .filter((r) => r.studentId);

    onRun({
      sessionId: sessionId || undefined,
      capacityOverride: overrideCap ? capacityOverride : undefined,
      waitlistEnabled,
      additionalRegistrations: additional.length > 0 ? additional : undefined,
    });
  };

  return (
    <div className="border border-border bg-ivory-light p-5 space-y-4">
      <div>
        <Label htmlFor="sim-session">Target session</Label>
        <Select
          id="sim-session"
          value={sessionId}
          onChange={(e) => {
            setSessionId(e.target.value);
            const s = sessions.find((x) => x.id === e.target.value);
            if (s) setCapacityOverride(s.capacity);
          }}
        >
          <option value="">All sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="override">Override capacity</Label>
        <Switch id="override" checked={overrideCap} onCheckedChange={setOverrideCap} />
      </div>

      {overrideCap && (
        <div>
          <Label htmlFor="cap">Simulated capacity</Label>
          <Input
            id="cap"
            type="number"
            min={0}
            value={capacityOverride}
            onChange={(e) => setCapacityOverride(Number(e.target.value))}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="wl">Waitlist enabled (simulated)</Label>
        <Switch id="wl" checked={waitlistEnabled} onCheckedChange={setWaitlistEnabled} />
      </div>

      <div>
        <Label htmlFor="add">Additional registrations (one per line: student_id,session_id,timestamp)</Label>
        <textarea
          id="add"
          className="w-full border border-border bg-ivory-light p-3 text-xs font-mono"
          rows={4}
          value={addRegsText}
          onChange={(e) => setAddRegsText(e.target.value)}
          placeholder="S-9001,AI-01,2024-01-01T10:00:00Z"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={run} disabled={running}>
          {running ? 'Running…' : 'Run simulation'}
        </Button>
      </div>
      <p className="text-2xs text-muted">
        Simulation never mutates production data.
      </p>
    </div>
  );
}