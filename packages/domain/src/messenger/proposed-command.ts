import type { ActionCommand } from '../student/action-command.js';

export interface ProposedCommand {
  id: string;
  /** AgentRun.id that generated this proposal. */
  agentRunId: string;
  /** Only ActionCommand is proposable today; widen when more domains need agent-proposed changes. */
  command: ActionCommand;
  rationale?: string;
  /** SystemMeta.dataVersion this proposal was reasoned against, to detect staleness before approval. */
  basedOnDataVersion: string;
  status: ProposedCommandStatus;
  createdAt: string;
  decidedAt?: string;
  /** User.id of whoever approved or rejected this. */
  decidedByUserId?: string;
}

export type ProposedCommandStatus = 'pending' | 'approved' | 'rejected' | 'expired';
