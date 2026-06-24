import { describe, expect, it } from 'vitest';
import { computeSaiFormulaA2025_26, type SaiFormulaAInput } from './sai-formula-a-2025-26.js';

function baseInput(overrides: Partial<SaiFormulaAInput> = {}): SaiFormulaAInput {
  return {
    household: {
      filingStatus: 'married_joint',
      agi: { amount: 0 },
      taxPaid: { amount: 0 },
      incomeUntaxed: { amount: 0 },
      cashSavings: { amount: 0 },
      realEstateEquity: { amount: 0 },
      businessValue: { amount: 0 },
      collegeSavings529: { amount: 0 },
    },
    householdSize: 4,
    student: { income: { amount: 0 }, assets: { amount: 0 } },
    ...overrides,
  };
}

describe('computeSaiFormulaA2025_26', () => {
  it('matches a hand-worked joint-filer example against the official 2025-26 tables', () => {
    const result = computeSaiFormulaA2025_26(
      baseInput({
        household: {
          filingStatus: 'married_joint',
          agi: { amount: 100_000 },
          taxPaid: { amount: 10_000 },
          incomeUntaxed: { amount: 0 },
          cashSavings: { amount: 20_000 },
          realEstateEquity: { amount: 0 },
          businessValue: { amount: 0 },
          collegeSavings529: { amount: 0 },
        },
        householdSize: 4,
      }),
    );

    expect(result.breakdown.parentsAvailableIncome).toBe(38_480);
    expect(result.breakdown.parentsContributionFromAssets).toBe(2_400);
    expect(result.breakdown.parentsAdjustedAvailableIncome).toBe(40_880);
    expect(result.breakdown.parentsContributionFromAAI).toBe(10_795);
    expect(result.estimatedSAI).toBe(10_795);
  });

  it('floors the result at -1500 for a low-income household instead of going more negative', () => {
    const result = computeSaiFormulaA2025_26(
      baseInput({
        household: {
          filingStatus: 'single',
          agi: { amount: 20_000 },
          taxPaid: { amount: 0 },
          incomeUntaxed: { amount: 0 },
          cashSavings: { amount: 0 },
          realEstateEquity: { amount: 0 },
          businessValue: { amount: 0 },
          collegeSavings529: { amount: 0 },
        },
        householdSize: 4,
      }),
    );

    expect(result.breakdown.parentsContributionFromAAI).toBe(-1_826);
    expect(result.estimatedSAI).toBe(-1_500);
  });

  it('applies the business/farm net worth adjustment before the 12% asset conversion', () => {
    const result = computeSaiFormulaA2025_26(
      baseInput({
        household: {
          filingStatus: 'married_joint',
          agi: { amount: 0 },
          taxPaid: { amount: 0 },
          incomeUntaxed: { amount: 0 },
          cashSavings: { amount: 0 },
          realEstateEquity: { amount: 0 },
          businessValue: { amount: 300_000 },
          collegeSavings529: { amount: 0 },
        },
      }),
    );

    // Adjusted net worth: 68,000 + 50% * (300,000 - 170,000) = 133,000.
    expect(result.breakdown.parentsContributionFromAssets).toBe(133_000 * 0.12);
  });

  it('adds the per-additional-member allowance beyond a household of 6', () => {
    const sizeSix = computeSaiFormulaA2025_26(baseInput({ householdSize: 6 }));
    const sizeSeven = computeSaiFormulaA2025_26(baseInput({ householdSize: 7 }));

    // A bigger household gets a bigger income protection allowance, which is
    // subtracted from available income — so available income goes *down*.
    expect(sizeSix.breakdown.parentsAvailableIncome - 6_840).toBe(
      sizeSeven.breakdown.parentsAvailableIncome,
    );
  });

  it('floors a negative student available income at zero instead of offsetting the parent contribution', () => {
    const result = computeSaiFormulaA2025_26(
      baseInput({ student: { income: { amount: 1_000 }, assets: { amount: 0 } } }),
    );

    expect(result.breakdown.studentAvailableIncome).toBe(0);
    expect(result.breakdown.studentContributionFromIncome).toBe(0);
  });

  it('assesses student income above the protection allowance at 50%', () => {
    const result = computeSaiFormulaA2025_26(
      baseInput({ student: { income: { amount: 15_000 }, assets: { amount: 0 } } }),
    );

    // Payroll tax allowance on $15,000: 1.45% HI + 6.2% OASDI = 7.65% = $1,147.50.
    const expectedAvailable = 15_000 - 15_000 * 0.0765 - 11_510;
    expect(result.breakdown.studentAvailableIncome).toBeCloseTo(expectedAvailable, 2);
    expect(result.breakdown.studentContributionFromIncome).toBeCloseTo(expectedAvailable * 0.5, 2);
  });

  it('assesses student assets at 20%', () => {
    const result = computeSaiFormulaA2025_26(
      baseInput({ student: { income: { amount: 0 }, assets: { amount: 5_000 } } }),
    );

    expect(result.breakdown.studentContributionFromAssets).toBe(1_000);
  });

  it('always marks the result as not usable for a real financial decision, per ADR-006', () => {
    const result = computeSaiFormulaA2025_26(baseInput());
    expect(result.usableForFinancialDecision).toBe(false);
    expect(result.confidence).toBe('estimated');
    expect(result.simplifications.length).toBeGreaterThan(0);
  });

  it('flags a missing filing status as a simplification instead of guessing silently', () => {
    const result = computeSaiFormulaA2025_26(
      baseInput({
        household: {
          agi: { amount: 0 },
          taxPaid: { amount: 0 },
          incomeUntaxed: { amount: 0 },
          cashSavings: { amount: 0 },
          realEstateEquity: { amount: 0 },
          businessValue: { amount: 0 },
          collegeSavings529: { amount: 0 },
        },
      }),
    );

    expect(result.simplifications.some((entry) => entry.includes('filingStatus'))).toBe(true);
  });
});
