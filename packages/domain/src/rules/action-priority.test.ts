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

  it('breaks a score tie by the nearer deadline when both fall in the same bonus bracket', () => {
    const common = {
      urgency: 'this_week' as const,
      admissionsImpact: 'medium' as const,
      isFoundational: false,
      status: 'suggested' as const,
      createdAt: '2026-06-01T00:00:00Z',
    };

    // Both deadlines are within the same "<14 days" bonus bracket, so the
    // scores tie and the comparison falls through to the deadline tie-break.
    expect(
      computeNextBestAction(
        [
          { id: 'later', ...common, deadline: '2026-07-04T00:00:00Z' },
          { id: 'sooner', ...common, deadline: '2026-06-30T00:00:00Z' },
        ],
        new Date('2026-06-22T00:00:00Z'),
      ),
    ).toBe('sooner');
  });

  it('ranks high impact above low impact at equal urgency', () => {
    const common = {
      urgency: 'someday' as const,
      isFoundational: false,
      status: 'suggested' as const,
      createdAt: '2026-06-01T00:00:00Z',
    };

    expect(
      computeNextBestAction(
        [
          { id: 'low', ...common, admissionsImpact: 'low' },
          { id: 'high', ...common, admissionsImpact: 'high' },
        ],
        new Date('2026-06-22T00:00:00Z'),
      ),
    ).toBe('high');
  });

  it('gives a foundational action enough bonus to beat a non-foundational one at equal urgency and impact', () => {
    const common = {
      urgency: 'someday' as const,
      admissionsImpact: 'medium' as const,
      status: 'suggested' as const,
      createdAt: '2026-06-01T00:00:00Z',
    };

    expect(
      computeNextBestAction(
        [
          { id: 'regular', ...common, isFoundational: false },
          { id: 'foundational', ...common, isFoundational: true },
        ],
        new Date('2026-06-22T00:00:00Z'),
      ),
    ).toBe('foundational');
  });

  it('boosts an overdue deadline above a same-urgency action with no deadline', () => {
    const common = {
      urgency: 'someday' as const,
      admissionsImpact: 'medium' as const,
      isFoundational: false,
      status: 'suggested' as const,
      createdAt: '2026-06-01T00:00:00Z',
    };

    expect(
      computeNextBestAction(
        [
          { id: 'no-deadline', ...common },
          { id: 'overdue', ...common, deadline: '2026-06-01T00:00:00Z' },
        ],
        new Date('2026-06-22T00:00:00Z'),
      ),
    ).toBe('overdue');
  });

  it.each(['accepted', 'in_progress'] as const)(
    'treats %s actions as active alongside suggested',
    (status) => {
      const action = {
        id: 'active',
        urgency: 'today' as const,
        admissionsImpact: 'high' as const,
        isFoundational: false,
        createdAt: '2026-06-01T00:00:00Z',
        status,
      };

      expect(computeNextBestAction([action], new Date('2026-06-22T00:00:00Z'))).toBe('active');
    },
  );
});
