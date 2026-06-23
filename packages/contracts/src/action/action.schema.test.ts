import { describe, expect, it } from 'vitest';
import { ActionSchema } from './action.schema.js';

const validAction = {
  id: 'action-1',
  title: 'Register for the October SAT',
  origin: { block: 'standardized-tests', generatedBy: 'agent' as const },
  urgency: 'this_week' as const,
  admissionsImpact: 'high' as const,
  isFoundational: true,
  status: 'suggested' as const,
  createdAt: '2026-06-01T00:00:00.000Z',
};

describe('ActionSchema', () => {
  it('accepts a minimal valid action', () => {
    expect(ActionSchema.safeParse(validAction).success).toBe(true);
  });

  it('rejects an unknown status value', () => {
    const result = ActionSchema.safeParse({ ...validAction, status: 'archived' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing required field', () => {
    const { title, ...withoutTitle } = validAction;
    const result = ActionSchema.safeParse(withoutTitle);
    expect(result.success).toBe(false);
  });
});
