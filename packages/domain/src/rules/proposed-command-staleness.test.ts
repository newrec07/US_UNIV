import { describe, expect, it } from 'vitest';
import { isProposalStale } from './proposed-command-staleness.js';
import type { ProposedCommand } from '../messenger/proposed-command.js';

const basePendingProposal: ProposedCommand = {
  id: 'pc-1',
  agentRunId: 'run-1',
  command: { type: 'dismiss_action', actionId: 'action-1' },
  basedOnDataVersion: 'v42',
  status: 'pending',
  createdAt: '2026-06-01T00:00:00.000Z',
};

describe('isProposalStale', () => {
  it('is not stale when the data version is unchanged', () => {
    expect(isProposalStale(basePendingProposal, 'v42')).toBe(false);
  });

  it('is stale once dataVersion has moved past the proposal basis', () => {
    expect(isProposalStale(basePendingProposal, 'v43')).toBe(true);
  });
});
