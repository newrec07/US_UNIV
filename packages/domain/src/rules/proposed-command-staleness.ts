import type { ProposedCommand } from '../messenger/proposed-command.js';

/**
 * True when SystemMeta.dataVersion has moved on since this proposal was
 * reasoned about, meaning it should transition to 'expired' instead of being
 * approved against now-outdated context.
 */
export function isProposalStale(proposal: ProposedCommand, currentDataVersion: string): boolean {
  return proposal.basedOnDataVersion !== currentDataVersion;
}
