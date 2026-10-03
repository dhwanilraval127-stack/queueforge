'use client';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { SessionWithStats } from '@/types/session';
import { REGISTRATION_STATUSES } from '@/types/registration';

interface Props {
  search: string;
  status: string;
  sessionId: string;
  sessions: SessionWithStats[];
  onChange: (patch: { search?: string; status?: string; sessionId?: string }) => void;
}

export function RegistrationFilters({ search, status, sessionId, sessions, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div>
        <Label htmlFor="search">Search student / session</Label>
        <Input
          id="search"
          placeholder="S-1044, AI-01…"
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={status}
          onChange={(e) => onChange({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          {REGISTRATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="session">Session</Label>
        <Select
          id="session"
          value={sessionId}
          onChange={(e) => onChange({ sessionId: e.target.value })}
        >
          <option value="">All sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}