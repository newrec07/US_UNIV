export interface Message {
  id: string;
  senderType: MessageSenderType;
  /** User.id — present for 'student' | 'parent', omitted for 'agent'. */
  senderUserId?: string;
  content: string;
  createdAt: string;
  /** Links to the AgentRun that produced or is processing this message. */
  agentRunId?: string;
}

export type MessageSenderType = 'student' | 'parent' | 'agent';
