import { getAdminDb } from '@/lib/firebase/admin';
import { COLLECTIONS, DEFAULT_RULE_SET_ID } from '@/lib/utils/constants';
import type { RuleSet, RuleSetInput } from '@/types/rules';
import { DEFAULT_RULE_SET } from '@/types/rules';
import { nowIso } from '@/lib/utils/date';

export const rulesRepository = {
  async getActive(): Promise<RuleSet> {
    const db = getAdminDb();
    const doc = await db.collection(COLLECTIONS.RULE_SETS).doc(DEFAULT_RULE_SET_ID).get();
    if (!doc.exists) {
      // Initialize with defaults
      const now = nowIso();
      const rules: RuleSet = {
        id: DEFAULT_RULE_SET_ID,
        ...DEFAULT_RULE_SET,
        createdAt: now,
        updatedAt: now,
      };
      await db.collection(COLLECTIONS.RULE_SETS).doc(DEFAULT_RULE_SET_ID).set(rules);
      return rules;
    }
    return { id: doc.id, ...doc.data() } as RuleSet;
  },

  async update(updates: RuleSetInput): Promise<RuleSet> {
    const db = getAdminDb();
    const current = await this.getActive();
    const data: RuleSet = {
      ...current,
      ...updates,
      updatedAt: nowIso(),
    };
    await db.collection(COLLECTIONS.RULE_SETS).doc(DEFAULT_RULE_SET_ID).set(data);
    return data;
  },
};