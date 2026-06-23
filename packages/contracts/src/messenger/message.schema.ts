import { z } from 'zod';
import type { Message } from '@admissions/domain';

const MessageSenderTypeSchema = z.enum(['student', 'parent', 'agent']);

/** Validates API responses and Agent-produced message records against the domain `Message` shape. */
export const MessageSchema: z.ZodType<Message> = z.object({
  id: z.string(),
  senderType: MessageSenderTypeSchema,
  senderUserId: z.string().optional(),
  content: z.string(),
  createdAt: z.string(),
  agentRunId: z.string().optional(),
});
