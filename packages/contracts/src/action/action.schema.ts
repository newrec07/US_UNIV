import { z } from 'zod';
import type { Action, ActionOrigin } from '@admissions/domain';

const ActionOriginSchema: z.ZodType<ActionOrigin> = z.object({
  block: z.string(),
  entityId: z.string().optional(),
  generatedBy: z.enum(['agent', 'student', 'consultant']),
});

const ActionUrgencySchema = z.enum(['today', 'this_week', 'upcoming', 'someday']);
const ActionImpactSchema = z.enum(['high', 'medium', 'low']);
const ActionStatusSchema = z.enum(['suggested', 'accepted', 'in_progress', 'done', 'dismissed']);

/**
 * action_layer — validates Agent-proposed Action drafts and API query
 * responses against the domain Action shape (see
 * docs/product/domain-model.md#표현-계층과-도메인-타입의-매핑).
 */
export const ActionSchema: z.ZodType<Action> = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string().optional(),
  estimatedMinutes: z.number().optional(),
  origin: ActionOriginSchema,
  urgency: ActionUrgencySchema,
  admissionsImpact: ActionImpactSchema,
  isFoundational: z.boolean(),
  deadline: z.string().optional(),
  status: ActionStatusSchema,
  reason: z.string().optional(),
  createdAt: z.string(),
  statusChangedAt: z.string().optional(),
});
