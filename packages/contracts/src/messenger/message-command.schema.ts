import { z } from 'zod';

/**
 * Client-submitted command to post a new message. `senderType` and
 * `senderUserId` are derived server-side from the authenticated session, not
 * accepted as client input.
 */
export const SendMessageCommandSchema = z.object({
  type: z.literal('send_message'),
  content: z.string().min(1),
});

export type SendMessageCommand = z.infer<typeof SendMessageCommandSchema>;
