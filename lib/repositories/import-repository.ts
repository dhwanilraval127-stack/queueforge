import { getAdminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/utils/constants';
import type { Import, ImportStatus } from '@/types/import';
import { generateId } from '@/lib/utils/id';
import { nowIso } from '@/lib/utils/date';

export const importRepository = {
  async create(data: Omit<Import, 'id' | 'createdAt'>): Promise<Import> {
    const db = getAdminDb();
    const id = generateId('imp');
    const record: Import = {
      id,
      ...data,
      createdAt: nowIso(),
    };
    await db.collection(COLLECTIONS.IMPORTS).doc(id).set(record);
    return record;
  },

  async update(id: string, updates: Partial<Import>): Promise<Import> {
    const db = getAdminDb();
    await db.collection(COLLECTIONS.IMPORTS).doc(id).update(updates);
    const doc = await db.collection(COLLECTIONS.IMPORTS).doc(id).get();
    return { id: doc.id, ...doc.data() } as Import;
  },

  async setStatus(id: string, status: ImportStatus, extra: Partial<Import> = {}): Promise<void> {
    const db = getAdminDb();
    await db.collection(COLLECTIONS.IMPORTS).doc(id).update({
      status,
      ...extra,
      ...(status === 'COMPLETED' ? { completedAt: nowIso() } : {}),
    });
  },

  async getById(id: string): Promise<Import | null> {
    const db = getAdminDb();
    const doc = await db.collection(COLLECTIONS.IMPORTS).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Import;
  },

  async list(limit = 20): Promise<Import[]> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.IMPORTS)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Import));
  },
};