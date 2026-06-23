import { z } from 'zod';
import type { AgentRun } from '@admissions/domain';

const AgentRunStatusSchema = z.enum(['queued', 'running', 'completed', 'failed']);

/**
 * system_layer — query-only. AgentRun is created and transitioned by the API
 * and Agent Worker, never directly by client input.
 */
export const AgentRunSchema: z.ZodType<AgentRun> = z.object({
  id: z.string(),
  triggeredByMessageId: z.string(),
  status: AgentRunStatusSchema,
  modelUsed: z.string(),
  promptVersion: z.string(),
  dataVersionAtStart: z.string(),
  createdAt: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  resultMessageId: z.string().optional(),
  error: z.string().optional(),
});
