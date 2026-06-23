import { describe, expect, it } from 'vitest';
import { ProposedCommandSchema } from './proposed-command.schema.js';

const pendingProposal = {
  id: 'pc-1',
  agentRunId: 'run-1',
  command: { type: 'dismiss_action' as const, actionId: 'action-1' },
  basedOnDataVersion: 'v42',
  status: 'pending' as const,
  createdAt: '2026-06-01T00:00:00.000Z',
};

describe('ProposedCommandSchema', () => {
  it('accepts a pending proposal with no decision yet', () => {
    expect(ProposedCommandSchema.safeParse(pendingProposal).success).toBe(true);
  });

  it('accepts an approved proposal with decision fields filled in', () => {
    const result = ProposedCommandSchema.safeParse({
      ...pendingProposal,
      status: 'approved',
      decidedAt: '2026-06-01T00:10:00.000Z',
      decidedByUserId: 'user-1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an embedded command that fails its own ActionCommand validation', () => {
    const result = ProposedCommandSchema.safeParse({
      ...pendingProposal,
      command: { type: 'dismiss_action', actionId: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown status value', () => {
    const result = ProposedCommandSchema.safeParse({ ...pendingProposal, status: 'withdrawn' });
    expect(result.success).toBe(false);
  });

  it('rejects a proposal missing basedOnDataVersion', () => {
    const { basedOnDataVersion, ...withoutDataVersion } = pendingProposal;
    expect(ProposedCommandSchema.safeParse(withoutDataVersion).success).toBe(false);
  });
});
