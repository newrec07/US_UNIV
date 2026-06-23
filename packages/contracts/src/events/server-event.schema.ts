import { z } from 'zod';
import { ActionSchema } from '../action/action.schema.js';
import { MessageSchema } from '../messenger/message.schema.js';
import { AgentRunSchema } from '../messenger/agent-run.schema.js';
import { ProposedCommandSchema } from '../messenger/proposed-command.schema.js';

/**
 * SSE notifications the Web client receives when server state changes.
 * Each event carries the full updated entity (already validated by its own
 * query schema) rather than a partial diff, so the client can just replace
 * its cached copy.
 */
export const MessageCreatedEventSchema = z.object({
  type: z.literal('message_created'),
  message: MessageSchema,
});

export const AgentRunUpdatedEventSchema = z.object({
  type: z.literal('agent_run_updated'),
  agentRun: AgentRunSchema,
});

export const ProposedCommandCreatedEventSchema = z.object({
  type: z.literal('proposed_command_created'),
  proposedCommand: ProposedCommandSchema,
});

export const ActionUpdatedEventSchema = z.object({
  type: z.literal('action_updated'),
  action: ActionSchema,
});

export const ServerEventSchema = z.discriminatedUnion('type', [
  MessageCreatedEventSchema,
  AgentRunUpdatedEventSchema,
  ProposedCommandCreatedEventSchema,
  ActionUpdatedEventSchema,
]);

export type MessageCreatedEvent = z.infer<typeof MessageCreatedEventSchema>;
export type AgentRunUpdatedEvent = z.infer<typeof AgentRunUpdatedEventSchema>;
export type ProposedCommandCreatedEvent = z.infer<typeof ProposedCommandCreatedEventSchema>;
export type ActionUpdatedEvent = z.infer<typeof ActionUpdatedEventSchema>;
export type ServerEvent = z.infer<typeof ServerEventSchema>;
