import { getAdminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/utils/constants';
import { nowIso } from '@/lib/utils/date';

interface Student {
  id: string;
  studentCode: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export const studentRepository = {
  async upsertByCode(code: string, name?: string): Promise<Student> {
    const db = getAdminDb();
    const id = `std_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const now = nowIso();
    const docRef = db.collection(COLLECTIONS.STUDENTS).doc(id);
    const existing = await docRef.get();
    if (existing.exists) {
      return { id: existing.id, ...existing.data() } as Student;
    }
    const student: Student = {
      id,
      studentCode: code,
      name,
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set(student);
    return student;
  },

  async upsertBatch(codes: string[]): Promise<void> {
    if (codes.length === 0) return;
    const db = getAdminDb();
    const now = nowIso();
    const BATCH_LIMIT = 500;
    const unique = Array.from(new Set(codes));
    for (let i = 0; i < unique.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      const chunk = unique.slice(i, i + BATCH_LIMIT);
      chunk.forEach((code) => {
        const id = `std_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const ref = db.collection(COLLECTIONS.STUDENTS).doc(id);
        batch.set(
          ref,
          {
            id,
            studentCode: code,
            createdAt: now,
            updatedAt: now,
          },
          { merge: true }
        );
      });
      await batch.commit();
    }
  },
};