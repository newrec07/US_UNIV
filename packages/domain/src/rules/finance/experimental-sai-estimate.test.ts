import { describe, expect, it } from 'vitest';
import { computeExperimentalSai } from './experimental-sai-estimate.js';

const BASE_INPUT = {
  parentAgi: 0,
  parentAssets: 0,
  studentIncome: 0,
  studentAssets: 0,
  householdSize: 4,
};

describe('computeExperimentalSai', () => {
  it('always marks the result as not usable for financial decisions, per ADR-006', () => {
    const result = computeExperimentalSai(BASE_INPUT);

    expect(result.usableForFinancialDecision).toBe(false);
    expect(result.confidence).toBe('rough_estimate');
    expect(result.warning).toMatch(/official award-year FAFSA formula/i);
  });

  it('returns zero contribution when there is no income or assets', () => {
    const result = computeExperimentalSai(BASE_INPUT);

    expect(result.estimatedSAI).toBe(0);
    expect(result.breakdown).toEqual({ parentContribution: 0, studentContribution: 0 });
  });

  it('floors the estimate at -1500 instead of going further negative', () => {
    const result = computeExperimentalSai(BASE_INPUT);
    expect(result.estimatedSAI).toBeGreaterThanOrEqual(-1500);
  });

  it('increases the parent contribution as AGI rises through the income brackets', () => {
    const low = computeExperimentalSai({ ...BASE_INPUT, parentAgi: 40_000 });
    const high = computeExperimentalSai({ ...BASE_INPUT, parentAgi: 120_000 });
    expect(high.breakdown.parentContribution).toBeGreaterThan(low.breakdown.parentContribution);
  });

  it('clamps household size to the supported 2-6 range instead of throwing', () => {
    const oversized = computeExperimentalSai({
      ...BASE_INPUT,
      parentAgi: 60_000,
      householdSize: 10,
    });
    const atCap = computeExperimentalSai({ ...BASE_INPUT, parentAgi: 60_000, householdSize: 6 });
    expect(oversized.estimatedSAI).toBe(atCap.estimatedSAI);
  });

  it('rejects negative inputs rather than silently treating them as zero', () => {
    expect(() => computeExperimentalSai({ ...BASE_INPUT, parentAgi: -1 })).toThrow(RangeError);
  });
});
