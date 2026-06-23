import { z } from 'zod';

/**
 * User decision on a ProposedCommand. `decidedByUserId` is derived
 * server-side from the authenticated session, not accepted as client input.
 */
export const ApproveProposedCommandSchema = z.object({
  type: z.literal('approve_proposed_command'),
  proposedCommandId: z.string().min(1),
});

export const RejectProposedCommandSchema = z.object({
  type: z.literal('reject_proposed_command'),
  proposedCommandId: z.string().min(1),
  reason: z.string().optional(),
});

export const ProposedCommandDecisionSchema = z.discriminatedUnion('type', [
  ApproveProposedCommandSchema,
  RejectProposedCommandSchema,
]);

export type ApproveProposedCommand = z.infer<typeof ApproveProposedCommandSchema>;
export type RejectProposedCommand = z.infer<typeof RejectProposedCommandSchema>;
export type ProposedCommandDecision = z.infer<typeof ProposedCommandDecisionSchema>;
