import { describe, expect, it } from 'vitest';
import { computeNextBestAction } from './action-priority.js';

describe('computeNextBestAction', () => {
  it('returns null when no active action exists', () => {
    expect(
      computeNextBestAction(
        [
          {
            id: 'done',
            urgency: 'today',
            admissionsImpact: 'high',
            isFoundational: true,
            status: 'done',
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
        new Date('2026-06-22T00:00:00Z'),
      ),
    ).toBeNull();
  });

  it('uses a stable id tie-break after equal scores and timestamps', () => {
    const common = {
      urgency: 'this_week' as const,
      admissionsImpact: 'medium' as const,
      isFoundational: false,
      status: 'suggested' as const,
      createdAt: '2026-06-01T00:00:00Z',
    };

    expect(
      computeNextBestAction(
        [
          { id: 'b', ...common },
          { id: 'a', ...common },
        ],
        new Date('2026-06-22T00:00:00Z'),
      ),
    ).toBe('a');
  });
});
