import { z } from 'zod';
import type { ProposedCommand } from '@admissions/domain';
import { ActionCommandSchema } from '../action/action-command.schema.js';

const ProposedCommandStatusSchema = z.enum(['pending', 'approved', 'rejected', 'expired']);

/** Query-only. ProposedCommand is created by the Agent Worker and transitioned by API approval, never by direct client input. */
export const ProposedCommandSchema: z.ZodType<ProposedCommand> = z.object({
  id: z.string(),
  agentRunId: z.string(),
  command: ActionCommandSchema,
  rationale: z.string().optional(),
  basedOnDataVersion: z.string(),
  status: ProposedCommandStatusSchema,
  createdAt: z.string(),
  decidedAt: z.string().optional(),
  decidedByUserId: z.string().optional(),
});
