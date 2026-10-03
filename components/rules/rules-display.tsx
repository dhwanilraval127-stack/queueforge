'use client';
import { useState } from 'react';
import type { RuleSet } from '@/types/rules';
import { RuleCard } from './rule-card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/stores/app-store';

interface Props {
  rules: RuleSet;
  onUpdated: () => void;
}

export function RulesDisplay({ rules, onUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RuleSet>(rules);
  const [saving, setSaving] = useState(false);
  const pushToast = useAppStore((s) => s.pushToast);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duplicatePolicy: draft.duplicatePolicy,
          capacityPolicy: draft.capacityPolicy,
          cancellationPolicy: draft.cancellationPolicy,
          orderingPolicy: draft.orderingPolicy,
          waitlistEnabled: draft.waitlistEnabled,
          automaticPromotion: draft.automaticPromotion,
          preserveOriginalOrder: draft.preserveOriginalOrder,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      pushToast({ variant: 'success', message: 'Rules updated' });
      setEditing(false);
      onUpdated();
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => { setDraft(rules); setEditing(true); }}>
            Edit rules
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <RuleCard
            name="Duplicate Policy"
            behavior={describeDuplicate(rules.duplicatePolicy)}
            example="A student submitting twice for the same session returns REJECTED_DUPLICATE."
          />
          <RuleCard
            name="Capacity Policy"
            behavior={describeCapacity(rules.capacityPolicy)}
            example="Overflow registrations route to waitlist when enabled."
          />
          <RuleCard
            name="Waitlist"
            behavior={rules.waitlistEnabled ? 'Waitlist is active for overflow registrations.' : 'Waitlist is disabled; overflow is rejected.'}
          />
          <RuleCard
            name="Ordering Policy"
            behavior={describeOrdering(rules.orderingPolicy)}
          />
          <RuleCard
            name="Cancellation"
            behavior={describeCancellation(rules.cancellationPolicy)}
            example="Cancelling an accepted registration promotes the next waitlisted student."
          />
          <RuleCard
            name="Automatic Promotion"
            behavior={rules.automaticPromotion ? 'Next waitlisted registration is promoted automatically on cancellation.' : 'Promotion requires manual intervention.'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-ivory-light p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dup">Duplicate policy</Label>
          <Select id="dup" value={draft.duplicatePolicy} onChange={(e) => setDraft({ ...draft, duplicatePolicy: e.target.value as RuleSet['duplicatePolicy'] })}>
            <option value="REJECT">REJECT</option>
            <option value="ALLOW_MULTIPLE">ALLOW_MULTIPLE</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="cap">Capacity policy</Label>
          <Select id="cap" value={draft.capacityPolicy} onChange={(e) => setDraft({ ...draft, capacityPolicy: e.target.value as RuleSet['capacityPolicy'] })}>
            <option value="WAITLIST">WAITLIST</option>
            <option value="STRICT">STRICT</option>
            <option value="OVERFLOW_REJECT">OVERFLOW_REJECT</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="can">Cancellation policy</Label>
          <Select id="can" value={draft.cancellationPolicy} onChange={(e) => setDraft({ ...draft, cancellationPolicy: e.target.value as RuleSet['cancellationPolicy'] })}>
            <option value="ALLOW_WITH_PROMOTION">ALLOW_WITH_PROMOTION</option>
            <option value="ALLOW_NO_PROMOTION">ALLOW_NO_PROMOTION</option>
            <option value="DENY">DENY</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="ord">Ordering policy</Label>
          <Select id="ord" value={draft.orderingPolicy} onChange={(e) => setDraft({ ...draft, orderingPolicy: e.target.value as RuleSet['orderingPolicy'] })}>
            <option value="ORIGINAL_SEQUENCE">ORIGINAL_SEQUENCE</option>
            <option value="FIFO">FIFO</option>
            <option value="LIFO">LIFO</option>
            <option value="TIMESTAMP">TIMESTAMP</option>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="wl">Waitlist enabled</Label>
        <Switch id="wl" checked={draft.waitlistEnabled} onCheckedChange={(v) => setDraft({ ...draft, waitlistEnabled: v })} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="ap">Automatic promotion</Label>
        <Switch id="ap" checked={draft.automaticPromotion} onCheckedChange={(v) => setDraft({ ...draft, automaticPromotion: v })} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="pr">Preserve original order</Label>
        <Switch id="pr" checked={draft.preserveOriginalOrder} onCheckedChange={(v) => setDraft({ ...draft, preserveOriginalOrder: v })} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save rules'}</Button>
      </div>
    </div>
  );
}

function describeDuplicate(policy: string) {
  if (policy === 'ALLOW_MULTIPLE') return 'Multiple active registrations per student per session are allowed.';
  return 'A student can hold only one active registration per session. Repeat attempts are rejected.';
}
function describeCapacity(policy: string) {
  if (policy === 'STRICT') return 'When capacity is reached, overflow is rejected unconditionally.';
  if (policy === 'OVERFLOW_REJECT') return 'Overflow registrations are rejected regardless of waitlist setting.';
  return 'When capacity is reached, overflow is routed to the waitlist (if enabled).';
}
function describeCancellation(policy: string) {
  if (policy === 'DENY') return 'Cancellations are not allowed.';
  if (policy === 'ALLOW_NO_PROMOTION') return 'Cancellations are allowed but waitlisted registrations are not auto-promoted.';
  return 'Cancellations are allowed; the next eligible waitlisted registration is promoted.';
}
function describeOrdering(policy: string) {
  if (policy === 'FIFO') return 'First-in, first-out based on arrival at the engine.';
  if (policy === 'LIFO') return 'Most recent waitlisted registration is promoted first.';
  if (policy === 'TIMESTAMP') return 'Ordered by submitted timestamp.';
  return 'Ordered by the original sequence recorded during ingestion.';
}