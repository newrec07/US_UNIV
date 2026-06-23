import { describe, expect, it } from 'vitest';
import { MessageSchema } from './message.schema.js';

const validAgentMessage = {
  id: 'msg-1',
  senderType: 'agent' as const,
  content: 'Your SAT registration deadline is in two weeks.',
  createdAt: '2026-06-01T00:00:00.000Z',
  agentRunId: 'run-1',
};

describe('MessageSchema', () => {
  it('accepts an agent message without a senderUserId', () => {
    expect(MessageSchema.safeParse(validAgentMessage).success).toBe(true);
  });

  it('accepts a parent message with a senderUserId', () => {
    const result = MessageSchema.safeParse({
      id: 'msg-2',
      senderType: 'parent',
      senderUserId: 'user-1',
      content: 'Can we talk about the FAFSA deadline?',
      createdAt: '2026-06-01T00:05:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown senderType', () => {
    const result = MessageSchema.safeParse({ ...validAgentMessage, senderType: 'counselor' });
    expect(result.success).toBe(false);
  });

  it('rejects a message missing content', () => {
    const { content, ...withoutContent } = validAgentMessage;
    expect(MessageSchema.safeParse(withoutContent).success).toBe(false);
  });
});
