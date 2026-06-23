import { describe, expect, it } from 'vitest';
import { SendMessageCommandSchema } from './message-command.schema.js';

describe('SendMessageCommandSchema', () => {
  it('accepts a non-empty message', () => {
    const result = SendMessageCommandSchema.safeParse({
      type: 'send_message',
      content: 'What should I focus on this week?',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = SendMessageCommandSchema.safeParse({ type: 'send_message', content: '' });
    expect(result.success).toBe(false);
  });

  it('strips a client-supplied senderUserId instead of trusting it', () => {
    const result = SendMessageCommandSchema.safeParse({
      type: 'send_message',
      content: 'Hello',
      senderUserId: 'user-1',
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('senderUserId');
  });
});
