import { describe, expect, it } from 'vitest';
import { ProposedCommandDecisionSchema } from './proposed-command-decision.schema.js';

describe('ProposedCommandDecisionSchema', () => {
  it('accepts an approval', () => {
    const result = ProposedCommandDecisionSchema.safeParse({
      type: 'approve_proposed_command',
      proposedCommandId: 'pc-1',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a rejection with an optional reason', () => {
    const result = ProposedCommandDecisionSchema.safeParse({
      type: 'reject_proposed_command',
      proposedCommandId: 'pc-1',
      reason: 'Not relevant right now',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty proposedCommandId', () => {
    const result = ProposedCommandDecisionSchema.safeParse({
      type: 'approve_proposed_command',
      proposedCommandId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unrecognized decision type', () => {
    const result = ProposedCommandDecisionSchema.safeParse({
      type: 'snooze_proposed_command',
      proposedCommandId: 'pc-1',
    });
    expect(result.success).toBe(false);
  });
});
