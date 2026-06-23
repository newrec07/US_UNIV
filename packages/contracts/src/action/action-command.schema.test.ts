import { describe, expect, it } from 'vitest';
import { ActionCommandSchema } from './action-command.schema.js';

describe('ActionCommandSchema', () => {
  it('parses a dismiss command with an optional reason', () => {
    const result = ActionCommandSchema.safeParse({
      type: 'dismiss_action',
      actionId: 'action-1',
      reason: 'Already done outside the app',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty actionId', () => {
    const result = ActionCommandSchema.safeParse({
      type: 'accept_action',
      actionId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unrecognized command type', () => {
    const result = ActionCommandSchema.safeParse({
      type: 'archive_action',
      actionId: 'action-1',
    });
    expect(result.success).toBe(false);
  });
});
