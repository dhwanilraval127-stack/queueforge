import { Badge } from '@/components/ui/badge';
import type { RegistrationStatus } from '@/types/registration';

const variantFor: Record<RegistrationStatus, 'accepted' | 'waitlisted' | 'cancelled' | 'rejected'> = {
  ACCEPTED: 'accepted',
  WAITLISTED: 'waitlisted',
  CANCELLED: 'cancelled',
  REJECTED_DUPLICATE: 'rejected',
  REJECTED_INVALID: 'rejected',
  REJECTED_SESSION_NOT_FOUND: 'rejected',
  REJECTED_CAPACITY_FULL: 'rejected',
};

const labelFor: Record<RegistrationStatus, string> = {
  ACCEPTED: 'Accepted',
  WAITLISTED: 'Waitlisted',
  CANCELLED: 'Cancelled',
  REJECTED_DUPLICATE: 'Duplicate',
  REJECTED_INVALID: 'Invalid',
  REJECTED_SESSION_NOT_FOUND: 'No Session',
  REJECTED_CAPACITY_FULL: 'Full',
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  return <Badge variant={variantFor[status]}>{labelFor[status]}</Badge>;
}