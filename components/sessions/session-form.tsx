'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/stores/app-store';
import type { SessionWithStats } from '@/types/session';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: SessionWithStats;
  onSaved: () => void;
}

export function SessionForm({ open, onOpenChange, session, onSaved }: Props) {
  const [code, setCode] = useState(session?.code || '');
  const [name, setName] = useState(session?.name || '');
  const [capacity, setCapacity] = useState(session?.capacity ?? 50);
  const [active, setActive] = useState(session?.active ?? true);
  const [saving, setSaving] = useState(false);
  const pushToast = useAppStore((s) => s.pushToast);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = session ? `/api/sessions/${session.id}` : '/api/sessions';
      const method = session ? 'PATCH' : 'POST';
      const body = session
        ? { name, capacity, active }
        : { code, name, capacity, active };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      pushToast({ variant: 'success', message: session ? 'Session updated' : 'Session created' });
      onSaved();
      onOpenChange(false);
    } catch (err) {
      pushToast({ variant: 'error', message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{session ? 'Edit session' : 'Create session'}</DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!session}
              placeholder="AI-01"
            />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active</Label>
            <Switch id="active" checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !code || !name}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}