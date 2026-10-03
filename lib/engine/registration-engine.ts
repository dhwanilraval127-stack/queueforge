import type {
  EngineRegistrationInput,
  EngineContext,
  EngineDecision,
  EngineSession,
  EngineExistingRegistration,
  SessionOccupancy,
  BatchProcessResult,
} from './types';
import type { RuleSet } from '@/types/rules';
import { makeDecision } from './decision-engine';
import { buildOccupancy } from './capacity-manager';
import { getEffectiveRules } from './rule-engine';

export class RegistrationEngine {
  private context: EngineContext;

  constructor(
    sessions: EngineSession[],
    existingRegistrations: EngineExistingRegistration[],
    rules?: Partial<RuleSet>
  ) {
    const sessionsMap = new Map<string, EngineSession>();
    sessions.forEach((s) => sessionsMap.set(s.id, s));

    const effectiveRules = getEffectiveRules(rules);

    // Build initial occupancy from existing registrations
    const occupancyMap = new Map<string, SessionOccupancy>();
    for (const session of sessions) {
      const accepted = existingRegistrations.filter(
        (r) => r.sessionId === session.id && r.status === 'ACCEPTED'
      ).length;
      const waitlisted = existingRegistrations.filter(
        (r) => r.sessionId === session.id && r.status === 'WAITLISTED'
      ).length;
      occupancyMap.set(
        session.id,
        buildOccupancy(session.id, session.capacity, accepted, waitlisted)
      );
    }

    this.context = {
      sessions: sessionsMap,
      existingRegistrations: [...existingRegistrations],
      rules: effectiveRules,
      sessionOccupancy: occupancyMap,
    };
  }

  processRegistration(input: EngineRegistrationInput): EngineDecision {
    return makeDecision(input, this.context);
  }

  processBatch(inputs: EngineRegistrationInput[]): BatchProcessResult {
    // Sort by originalSequence to preserve order
    const sorted = [...inputs].sort(
      (a, b) => a.originalSequence - b.originalSequence
    );

    const decisions: Array<{
      input: EngineRegistrationInput;
      decision: EngineDecision;
    }> = [];

    for (const input of sorted) {
      const decision = this.processRegistration(input);
      decisions.push({ input, decision });
    }

    return {
      decisions,
      finalOccupancy: new Map(this.context.sessionOccupancy),
    };
  }

  getOccupancy(sessionId: string): SessionOccupancy | undefined {
    return this.context.sessionOccupancy.get(sessionId);
  }

  getRules(): RuleSet {
    return this.context.rules;
  }

  getContext(): EngineContext {
    return this.context;
  }
}