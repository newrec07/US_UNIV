import { describe, expect, it } from 'vitest';
import { ServerEventSchema } from './server-event.schema.js';

describe('ServerEventSchema', () => {
  it('accepts a message_created event wrapping a valid Message', () => {
    const result = ServerEventSchema.safeParse({
      type: 'message_created',
      message: {
        id: 'msg-1',
        senderType: 'agent',
        content: 'Hi there',
        createdAt: '2026-06-01T00:00:00.000Z',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an action_updated event whose embedded Action is invalid', () => {
    const result = ServerEventSchema.safeParse({
      type: 'action_updated',
      action: { id: 'action-1', title: 'Missing required fields' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unrecognized event type', () => {
    const result = ServerEventSchema.safeParse({ type: 'dashboard_refreshed' });
    expect(result.success).toBe(false);
  });
});
