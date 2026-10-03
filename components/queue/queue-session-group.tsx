import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { QueueItem } from './queue-item';
import type { Session } from '@/types/session';
import type { Registration } from '@/types/registration';

interface Props {
  session: Session;
  waitlist: Registration[];
}

export function QueueSessionGroup({ session, waitlist }: Props) {
  if (waitlist.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-mono text-xs text-ink">{session.code}</div>
            <div className="text-xs text-muted">{session.name}</div>
          </div>
          <div className="font-mono text-xs text-ochre-dark">
            {waitlist.length} waiting
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {waitlist.map((reg) => (
            <QueueItem key={reg.id} reg={reg} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}