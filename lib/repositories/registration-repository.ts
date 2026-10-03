import { getAdminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/utils/constants';
import type {
  Registration,
  RegistrationStatus,
} from '@/types/registration';
import type { EngineExistingRegistration } from '@/lib/engine/types';
import type { RegistrationFiltersInput } from '@/lib/validation/registration-schema';

interface ListResult {
  items: Registration[];
  total: number;
  hasMore: boolean;
}

export const registrationRepository = {
  async getById(id: string): Promise<Registration | null> {
    const db = getAdminDb();
    const doc = await db.collection(COLLECTIONS.REGISTRATIONS).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Registration;
  },

  async getBySessionId(sessionId: string): Promise<Registration[]> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.REGISTRATIONS)
      .where('sessionId', '==', sessionId)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
  },

  async getBySessionIdAndStatus(
    sessionId: string,
    status: RegistrationStatus
  ): Promise<Registration[]> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.REGISTRATIONS)
      .where('sessionId', '==', sessionId)
      .where('status', '==', status)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
  },

  async getAllForEngine(): Promise<EngineExistingRegistration[]> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.REGISTRATIONS)
      .where('status', 'in', ['ACCEPTED', 'WAITLISTED'])
      .get();
    return snap.docs.map((d) => {
      const data = d.data() as Registration;
      return {
        id: d.id,
        studentId: data.studentId,
        sessionId: data.sessionId,
        status: data.status,
        queuePosition: data.queuePosition,
        originalSequence: data.originalSequence,
      };
    });
  },

  async countBySessionIdAndStatus(
    sessionId: string,
    status: RegistrationStatus
  ): Promise<number> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.REGISTRATIONS)
      .where('sessionId', '==', sessionId)
      .where('status', '==', status)
      .count()
      .get();
    return snap.data().count;
  },

  async countByStatus(status: RegistrationStatus): Promise<number> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.REGISTRATIONS)
      .where('status', '==', status)
      .count()
      .get();
    return snap.data().count;
  },

  async countAll(): Promise<number> {
    const db = getAdminDb();
    const snap = await db.collection(COLLECTIONS.REGISTRATIONS).count().get();
    return snap.data().count;
  },

  async create(registration: Registration): Promise<Registration> {
    const db = getAdminDb();
    await db.collection(COLLECTIONS.REGISTRATIONS).doc(registration.id).set(registration);
    return registration;
  },

  async createBatch(registrations: Registration[]): Promise<void> {
    if (registrations.length === 0) return;
    const db = getAdminDb();
    const BATCH_LIMIT = 500;
    for (let i = 0; i < registrations.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      const chunk = registrations.slice(i, i + BATCH_LIMIT);
      chunk.forEach((reg) => {
        const ref = db.collection(COLLECTIONS.REGISTRATIONS).doc(reg.id);
        batch.set(ref, reg);
      });
      await batch.commit();
    }
  },

  async update(id: string, updates: Partial<Registration>): Promise<Registration> {
    const db = getAdminDb();
    const data = { ...updates, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTIONS.REGISTRATIONS).doc(id).update(data);
    const doc = await db.collection(COLLECTIONS.REGISTRATIONS).doc(id).get();
    return { id: doc.id, ...doc.data() } as Registration;
  },

  async list(filters: RegistrationFiltersInput): Promise<ListResult> {
    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.REGISTRATIONS);

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.sessionId) {
      query = query.where('sessionId', '==', filters.sessionId);
    }
    if (filters.studentId) {
      query = query.where('studentId', '==', filters.studentId);
    }
    if (filters.importId) {
      query = query.where('sourceImportId', '==', filters.importId);
    }

    // Get total count
    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    // Order and paginate
    const sortBy = filters.sortBy || 'originalSequence';
    const sortOrder = filters.sortOrder || 'asc';
    query = query.orderBy(sortBy, sortOrder);

    const pageSize = filters.pageSize;
    const page = filters.page;
    const offset = (page - 1) * pageSize;

    const snap = await query.offset(offset).limit(pageSize).get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));

    // Client-side search filtering
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.studentId.toLowerCase().includes(term) ||
          r.sessionId.toLowerCase().includes(term)
      );
    }

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  },

  async deleteBySourceImport(importId: string): Promise<number> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.REGISTRATIONS)
      .where('sourceImportId', '==', importId)
      .get();

    let deleted = 0;
    const BATCH_LIMIT = 500;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      const chunk = docs.slice(i, i + BATCH_LIMIT);
      chunk.forEach((d) => {
        batch.delete(d.ref);
        deleted++;
      });
      await batch.commit();
    }
    return deleted;
  },
};