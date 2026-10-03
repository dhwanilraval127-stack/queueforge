'use client';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AUDIT_EVENT_TYPES } from '@/types/audit';

interface Props {
  eventType: string;
  onChange: (patch: { eventType?: string }) => void;
}

export function AuditFilters({ eventType, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <Label htmlFor="type">Event type</Label>
        <Select
          id="type"
          value={eventType}
          onChange={(e) => onChange({ eventType: e.target.value })}
        >
          <option value="">All event types</option>
          {AUDIT_EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}