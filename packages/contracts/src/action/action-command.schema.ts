import { z } from 'zod';
import type { ActionCommand } from '@admissions/domain';

// Member schemas are intentionally left without an explicit `z.ZodType<T>`
// annotation: that annotation erases the discriminant metadata
// `z.discriminatedUnion` needs from each member, breaking the union below.
export const AcceptActionCommandSchema = z.object({
  type: z.literal('accept_action'),
  actionId: z.string().min(1),
});

export const StartActionCommandSchema = z.object({
  type: z.literal('start_action'),
  actionId: z.string().min(1),
});

export const CompleteActionCommandSchema = z.object({
  type: z.literal('complete_action'),
  actionId: z.string().min(1),
});

export const DismissActionCommandSchema = z.object({
  type: z.literal('dismiss_action'),
  actionId: z.string().min(1),
  reason: z.string().optional(),
});

export const ActionCommandSchema = z.discriminatedUnion('type', [
  AcceptActionCommandSchema,
  StartActionCommandSchema,
  CompleteActionCommandSchema,
  DismissActionCommandSchema,
]);

// Compile-time check that the schema's inferred shape still matches the
// domain type, without annotating the schema itself (see note above).
type ActionCommandShapeMatches =
  z.infer<typeof ActionCommandSchema> extends ActionCommand
    ? ActionCommand extends z.infer<typeof ActionCommandSchema>
      ? true
      : false
    : false;
const _actionCommandShapeMatches: ActionCommandShapeMatches = true;
void _actionCommandShapeMatches;
