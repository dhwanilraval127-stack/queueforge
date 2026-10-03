import { getAdminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/utils/constants';
import type { Session, SessionInput } from '@/types/session';
import { generateId } from '@/lib/utils/id';
import { nowIso } from '@/lib/utils/date';

export const sessionRepository = {
  async getAll(): Promise<Session[]> {
    const db = getAdminDb();
    const snap = await db.collection(COLLECTIONS.SESSIONS).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Session));
  },

  async getById(id: string): Promise<Session | null> {
    const db = getAdminDb();
    const doc = await db.collection(COLLECTIONS.SESSIONS).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Session;
  },

  async getByCode(code: string): Promise<Session | null> {
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.SESSIONS)
      .where('code', '==', code)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0]!;
    return { id: doc.id, ...doc.data() } as Session;
  },

  async getByIds(ids: string[]): Promise<Session[]> {
    if (ids.length === 0) return [];
    const db = getAdminDb();
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
      chunks.push(ids.slice(i, i + 30));
    }
    const results: Session[] = [];
    for (const chunk of chunks) {
      const snap = await db
        .collection(COLLECTIONS.SESSIONS)
        .where('__name__', 'in', chunk)
        .get();
      snap.docs.forEach((d) => results.push({ id: d.id, ...d.data() } as Session));
    }
    return results;
  },

  async create(input: SessionInput): Promise<Session> {
    const db = getAdminDb();
    const now = nowIso();
    const id = input.code ? `sess_${input.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : generateId('sess');
    const session: Session = {
      id,
      code: input.code,
      name: input.name,
      capacity: input.capacity,
      active: input.active ?? true,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(COLLECTIONS.SESSIONS).doc(id).set(session);
    return session;
  },

  async upsertByCode(input: SessionInput): Promise<Session> {
    const existing = await this.getByCode(input.code);
    if (existing) {
      return this.update(existing.id, {
        name: input.name,
        capacity: input.capacity,
        active: input.active,
      });
    }
    return this.create(input);
  },

  async update(
    id: string,
    updates: Partial<Omit<Session, 'id' | 'createdAt'>>
  ): Promise<Session> {
    const db = getAdminDb();
    const now = nowIso();
    const data = { ...updates, updatedAt: now };
    await db.collection(COLLECTIONS.SESSIONS).doc(id).update(data);
    const doc = await db.collection(COLLECTIONS.SESSIONS).doc(id).get();
    return { id: doc.id, ...doc.data() } as Session;
  },

  async delete(id: string): Promise<void> {
    const db = getAdminDb();
    await db.collection(COLLECTIONS.SESSIONS).doc(id).delete();
  },
};