import { getAdminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/utils/constants';
import type { AuditEvent, AuditEventInput } from '@/types/audit';
import type { AuditFilters } from '@/types/api';
import { generateId } from '@/lib/utils/id';
import { nowIso } from '@/lib/utils/date';

interface ListResult {
  items: AuditEvent[];
  total: number;
  hasMore: boolean;
}

export const auditRepository = {
  async create(input: AuditEventInput): Promise<AuditEvent> {
    const db = getAdminDb();
    const id = generateId('aud');
    const event: AuditEvent = {
      id,
      ...input,
      createdAt: nowIso(),
    };
    await db.collection(COLLECTIONS.AUDIT_EVENTS).doc(id).set(event);
    return event;
  },

  async createBatch(inputs: AuditEventInput[]): Promise<void> {
    if (inputs.length === 0) return;
    const db = getAdminDb();
    const now = nowIso();
    const BATCH_LIMIT = 500;
    for (let i = 0; i < inputs.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      const chunk = inputs.slice(i, i + BATCH_LIMIT);
      chunk.forEach((input) => {
        const id = generateId('aud');
        const ref = db.collection(COLLECTIONS.AUDIT_EVENTS).doc(id);
        batch.set(ref, { id, ...input, createdAt: now });
      });
      await batch.commit();
    }
  },

  async getByRegistrationId(registrationId: string): Promise<AuditEvent[]> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.AUDIT_EVENTS)
      .where('registrationId', '==', registrationId)
      .orderBy('createdAt', 'asc')
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditEvent));
  },

  async list(filters: AuditFilters): Promise<ListResult> {
    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.AUDIT_EVENTS);

    if (filters.eventType) {
      query = query.where('eventType', '==', filters.eventType);
    }
    if (filters.sessionId) {
      query = query.where('sessionId', '==', filters.sessionId);
    }
    if (filters.registrationId) {
      query = query.where('registrationId', '==', filters.registrationId);
    }

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.orderBy(sortBy, sortOrder);

    const pageSize = filters.pageSize || 50;
    const page = filters.page || 1;
    const offset = (page - 1) * pageSize;

    const snap = await query.offset(offset).limit(pageSize).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditEvent));

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  },

  async recent(limit = 10): Promise<AuditEvent[]> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.AUDIT_EVENTS)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditEvent));
  },
};