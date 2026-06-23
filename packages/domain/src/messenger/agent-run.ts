export interface AgentRun {
  id: string;
  /** Message.id that queued this run. */
  triggeredByMessageId: string;
  status: AgentRunStatus;
  modelUsed: string;
  promptVersion: string;
  /** SystemMeta.dataVersion read at queue time, to detect concurrent changes. */
  dataVersionAtStart: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  /** Message.id of the agent's reply, once posted. */
  resultMessageId?: string;
  error?: string;
}

export type AgentRunStatus = 'queued' | 'running' | 'completed' | 'failed';
