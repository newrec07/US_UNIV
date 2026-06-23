import { describe, expect, it } from 'vitest';
import { computeNetPrice, isNetPriceStale } from './net-price.js';

const NOW = new Date('2026-06-24T00:00:00Z');

describe('computeNetPrice — full need met', () => {
  it('grants the entire demonstrated need beyond the self-help cap', () => {
    const result = computeNetPrice(
      {
        collegeCOA: 80_000,
        estimatedSAI: 10_000,
        meetsFullNeed: true,
        avgNeedMetPct: 100,
        isGapping: false,
      },
      'v1',
      NOW,
    );

    expect(result.demonstratedNeed).toBe(70_000);
    expect(result.estimatedSelfHelp).toBe(6_500);
    expect(result.estimatedGrantAid).toBe(63_500);
    expect(result.gap).toBe(0);
    expect(result.estimatedNetPrice).toBe(16_500);
  });
});

describe('computeNetPrice — gapping college', () => {
  it('reports the unmet portion of need as a gap instead of inflating aid', () => {
    const result = computeNetPrice(
      {
        collegeCOA: 80_000,
        estimatedSAI: 10_000,
        meetsFullNeed: false,
        avgNeedMetPct: 80,
        isGapping: true,
      },
      'v1',
      NOW,
    );

    expect(result.demonstratedNeed).toBe(70_000);
    expect(result.gap).toBeCloseTo(14_000);
  });

  it('does not report a gap when the college does not self-identify as gapping', () => {
    const result = computeNetPrice(
      {
        collegeCOA: 80_000,
        estimatedSAI: 10_000,
        meetsFullNeed: false,
        avgNeedMetPct: 80,
        isGapping: false,
      },
      'v1',
      NOW,
    );

    expect(result.gap).toBe(0);
  });
});

describe('computeNetPrice — merit aid', () => {
  it('applies merit aid on top of need-based aid', () => {
    const result = computeNetPrice(
      {
        collegeCOA: 60_000,
        estimatedSAI: 30_000,
        meetsFullNeed: true,
        avgNeedMetPct: 100,
        estimatedMeritAward: 5_000,
        isGapping: false,
      },
      'v1',
      NOW,
    );

    expect(result.estimatedMeritAid).toBe(5_000);
    expect(result.estimatedNetPrice).toBe(
      result.costOfAttendance - result.estimatedGrantAid - result.estimatedMeritAid,
    );
  });

  it('defaults merit aid to zero when not provided', () => {
    const result = computeNetPrice(
      {
        collegeCOA: 60_000,
        estimatedSAI: 30_000,
        meetsFullNeed: true,
        avgNeedMetPct: 100,
        isGapping: false,
      },
      'v1',
      NOW,
    );

    expect(result.estimatedMeritAid).toBe(0);
  });
});

describe('computeNetPrice — self-help cap', () => {
  it('caps self-help at 6500 even when demonstrated need is small', () => {
    const result = computeNetPrice(
      {
        collegeCOA: 30_000,
        estimatedSAI: 27_000,
        meetsFullNeed: true,
        avgNeedMetPct: 100,
        isGapping: false,
      },
      'v1',
      NOW,
    );

    expect(result.demonstratedNeed).toBe(3_000);
    expect(result.estimatedSelfHelp).toBe(3_000);
    expect(result.estimatedGrantAid).toBe(0);
  });
});

describe('computeNetPrice — input validation', () => {
  it('rejects a negative cost of attendance', () => {
    expect(() =>
      computeNetPrice(
        {
          collegeCOA: -1,
          estimatedSAI: 0,
          meetsFullNeed: true,
          avgNeedMetPct: 100,
          isGapping: false,
        },
        'v1',
        NOW,
      ),
    ).toThrow(RangeError);
  });

  it('rejects a negative merit award', () => {
    expect(() =>
      computeNetPrice(
        {
          collegeCOA: 10_000,
          estimatedSAI: 0,
          meetsFullNeed: true,
          avgNeedMetPct: 100,
          estimatedMeritAward: -1,
          isGapping: false,
        },
        'v1',
        NOW,
      ),
    ).toThrow(RangeError);
  });

  it('rejects an avgNeedMetPct outside 0-100', () => {
    expect(() =>
      computeNetPrice(
        {
          collegeCOA: 10_000,
          estimatedSAI: 0,
          meetsFullNeed: false,
          avgNeedMetPct: 101,
          isGapping: false,
        },
        'v1',
        NOW,
      ),
    ).toThrow(RangeError);
  });
});

describe('computeNetPrice — version tracking', () => {
  it('stamps the result with the data version and calculation time', () => {
    const result = computeNetPrice(
      {
        collegeCOA: 10_000,
        estimatedSAI: 0,
        meetsFullNeed: true,
        avgNeedMetPct: 100,
        isGapping: false,
      },
      'v7',
      NOW,
    );

    expect(result.basedOnDataVersion).toBe('v7');
    expect(result.calculatedAt).toBe(NOW.toISOString());
  });
});

describe('isNetPriceStale', () => {
  it('is stale once the current data version has moved on', () => {
    expect(isNetPriceStale({ basedOnDataVersion: 'v1' }, 'v2')).toBe(true);
  });

  it('is not stale while the data version is unchanged', () => {
    expect(isNetPriceStale({ basedOnDataVersion: 'v1' }, 'v1')).toBe(false);
  });
});
