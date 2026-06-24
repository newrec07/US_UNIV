import type { Household, StudentFinancials } from '../../student/financial-profile.js';

/**
 * Source: U.S. Department of Education, Federal Student Aid — "2025-26 Student
 * Aid Index (SAI) and Pell Grant Eligibility Guide", Version 1, July 2024.
 * Formula A (dependent student). Tables A1, A2, A4, A5 and the business/farm
 * net worth adjustment (the post-simplification replacement for Table A3)
 * are transcribed from that guide; see ADR-006 for the display policy this
 * result must follow.
 */
export const SAI_FORMULA_A_SOURCE =
  '2025-26 Student Aid Index (SAI) and Pell Grant Eligibility Guide, Version 1 (US Dept. of Education, Federal Student Aid, July 2024), Formula A';

const STUDENT_INCOME_PROTECTION_ALLOWANCE = 11_510;
const STUDENT_INCOME_ASSESSMENT_RATE = 0.5;
const STUDENT_ASSET_CONVERSION_RATE = 0.2;
const PARENT_ASSET_CONVERSION_RATE = 0.12;
const SAI_FLOOR = -1_500;
const SAI_CAP = 999_999;

const INCOME_PROTECTION_ALLOWANCE_BY_FAMILY_SIZE: Readonly<Record<number, number>> = {
  2: 28_530,
  3: 35_510,
  4: 43_870,
  5: 51_750,
  6: 60_540,
};
const INCOME_PROTECTION_ALLOWANCE_PER_ADDITIONAL_MEMBER = 6_840;

interface PayrollTaxBrackets {
  hiThreshold: number;
  oasdiCap: number;
  oasdiCapContribution: number;
}

// Table A1 — Step 1 (HI) uses 200,000/250,000; Step 2 (OASDI) uses the
// individual $160,200 wage base, or $320,400 combined for two earners/joint.
const PAYROLL_TAX_SINGLE_EARNER: PayrollTaxBrackets = {
  hiThreshold: 200_000,
  oasdiCap: 160_200,
  oasdiCapContribution: 9_932,
};
const PAYROLL_TAX_JOINT_OR_TWO_EARNERS: PayrollTaxBrackets = {
  hiThreshold: 250_000,
  oasdiCap: 320_400,
  oasdiCapContribution: 19_865,
};

interface ContributionBracket {
  /** AAI strictly below this value falls in this bracket; the last bracket has no ceiling. */
  ceiling: number | null;
  base: number;
  rate: number;
  /** AAI value the marginal rate is applied above (the bracket floor). */
  appliesAboveAai: number;
}

// Table A5 — Parents' Contribution from Adjusted Available Income (AAI).
const PARENTS_CONTRIBUTION_BRACKETS: readonly ContributionBracket[] = [
  { ceiling: -8_300, base: -1_826, rate: 0, appliesAboveAai: 0 },
  { ceiling: 21_300, base: 0, rate: 0.22, appliesAboveAai: -8_300 },
  { ceiling: 26_700, base: 4_686, rate: 0.25, appliesAboveAai: 21_300 },
  { ceiling: 32_000, base: 6_036, rate: 0.29, appliesAboveAai: 26_700 },
  { ceiling: 37_500, base: 7_573, rate: 0.34, appliesAboveAai: 32_000 },
  { ceiling: 42_900, base: 9_443, rate: 0.4, appliesAboveAai: 37_500 },
  { ceiling: null, base: 11_603, rate: 0.47, appliesAboveAai: 42_900 },
];

interface NetWorthBracket {
  ceiling: number | null;
  base: number;
  rate: number;
  appliesAbove: number;
}

// Business/farm net worth adjustment — replaces the old Table A3 (State Tax
// Allowance, removed by FAFSA simplification).
const BUSINESS_NET_WORTH_BRACKETS: readonly NetWorthBracket[] = [
  { ceiling: 0, base: 0, rate: 0, appliesAbove: 0 },
  { ceiling: 170_000, base: 0, rate: 0.4, appliesAbove: 0 },
  { ceiling: 510_000, base: 68_000, rate: 0.5, appliesAbove: 170_000 },
  { ceiling: 850_000, base: 238_000, rate: 0.6, appliesAbove: 510_000 },
  { ceiling: null, base: 442_000, rate: 1, appliesAbove: 850_000 },
];

export interface SaiFormulaAInput {
  household: Pick<
    Household,
    | 'filingStatus'
    | 'agi'
    | 'taxPaid'
    | 'incomeUntaxed'
    | 'cashSavings'
    | 'realEstateEquity'
    | 'businessValue'
    | 'collegeSavings529'
  >;
  householdSize: number;
  student: Pick<StudentFinancials, 'income' | 'assets'>;
}

export interface SaiFormulaAResult {
  estimatedSAI: number;
  awardYear: '2025-26';
  source: typeof SAI_FORMULA_A_SOURCE;
  /** Tables are official; input mapping still has the simplifications listed below. */
  confidence: 'estimated';
  usableForFinancialDecision: false;
  simplifications: string[];
  breakdown: {
    parentsAvailableIncome: number;
    parentsContributionFromAssets: number;
    parentsAdjustedAvailableIncome: number;
    parentsContributionFromAAI: number;
    studentAvailableIncome: number;
    studentContributionFromIncome: number;
    studentContributionFromAssets: number;
  };
}

function amountOf(figure: { amount: number } | undefined): number {
  return figure?.amount ?? 0;
}

function payrollTaxAllowance(earnedIncome: number, brackets: PayrollTaxBrackets): number {
  const hi =
    earnedIncome <= brackets.hiThreshold
      ? earnedIncome * 0.0145
      : brackets.hiThreshold * 0.0145 + (earnedIncome - brackets.hiThreshold) * 0.0235;
  const oasdi =
    earnedIncome <= brackets.oasdiCap ? earnedIncome * 0.062 : brackets.oasdiCapContribution;
  return hi + oasdi;
}

function incomeProtectionAllowance(householdSize: number): number {
  if (householdSize <= 2) return INCOME_PROTECTION_ALLOWANCE_BY_FAMILY_SIZE[2]!;
  if (householdSize <= 6) return INCOME_PROTECTION_ALLOWANCE_BY_FAMILY_SIZE[householdSize]!;
  const extraMembers = householdSize - 6;
  return (
    INCOME_PROTECTION_ALLOWANCE_BY_FAMILY_SIZE[6]! +
    extraMembers * INCOME_PROTECTION_ALLOWANCE_PER_ADDITIONAL_MEMBER
  );
}

function adjustedBusinessNetWorth(netWorth: number): number {
  if (netWorth <= 0) return 0;
  const bracket =
    BUSINESS_NET_WORTH_BRACKETS.find(
      (entry) => entry.ceiling === null || netWorth < entry.ceiling,
    ) ?? BUSINESS_NET_WORTH_BRACKETS[BUSINESS_NET_WORTH_BRACKETS.length - 1]!;
  return bracket.base + (netWorth - bracket.appliesAbove) * bracket.rate;
}

function parentsContributionFromAai(aai: number): number {
  const bracket =
    PARENTS_CONTRIBUTION_BRACKETS.find((entry) => entry.ceiling === null || aai < entry.ceiling) ??
    PARENTS_CONTRIBUTION_BRACKETS[PARENTS_CONTRIBUTION_BRACKETS.length - 1]!;
  // Rate is 0 on the lowest bracket, so this also correctly returns the flat
  // -1,826 floor for AAI below -8,300 without a separate special case.
  return bracket.base + (aai - bracket.appliesAboveAai) * bracket.rate;
}

/**
 * Computes SAI Formula A (dependent student, single household reported) using
 * the official 2025-26 tables. This is not a full-fidelity implementation of
 * every Formula A edge case — see `simplifications` on the result, and
 * ADR-006 for why `usableForFinancialDecision` stays false regardless.
 */
export function computeSaiFormulaA2025_26(input: SaiFormulaAInput): SaiFormulaAResult {
  const simplifications: string[] = [
    "earned income from work is approximated as AGI (the guide's payroll tax allowance is based on earned income, which can differ from AGI)",
    'student tax paid is approximated as 0',
    'separated/MFS households are not modeled with split per-spouse incomes; they use the same brackets as a single filer',
  ];

  const isJointOrTwoEarner = input.household.filingStatus === 'married_joint';
  const payrollBrackets = isJointOrTwoEarner
    ? PAYROLL_TAX_JOINT_OR_TWO_EARNERS
    : PAYROLL_TAX_SINGLE_EARNER;
  if (!input.household.filingStatus) {
    simplifications.push('household.filingStatus was missing; treated as a single filer');
  }

  const parentAgi = amountOf(input.household.agi);
  const parentTaxPaid = amountOf(input.household.taxPaid);
  const parentUntaxedIncome = amountOf(input.household.incomeUntaxed);
  const parentPayrollTaxAllowance = payrollTaxAllowance(parentAgi, payrollBrackets);
  const parentIncomeProtectionAllowance = incomeProtectionAllowance(input.householdSize);

  const parentsAvailableIncome =
    parentAgi +
    parentUntaxedIncome -
    parentTaxPaid -
    parentPayrollTaxAllowance -
    parentIncomeProtectionAllowance;

  const businessNetWorth = adjustedBusinessNetWorth(amountOf(input.household.businessValue));
  const reportableNetWorth =
    amountOf(input.household.cashSavings) +
    amountOf(input.household.realEstateEquity) +
    amountOf(input.household.collegeSavings529) +
    businessNetWorth;
  const parentsContributionFromAssets =
    Math.max(0, reportableNetWorth) * PARENT_ASSET_CONVERSION_RATE;

  const parentsAdjustedAvailableIncome = parentsAvailableIncome + parentsContributionFromAssets;
  const parentsContributionFromAAI = parentsContributionFromAai(parentsAdjustedAvailableIncome);

  const studentIncome = amountOf(input.student.income);
  const studentPayrollTaxAllowance = payrollTaxAllowance(studentIncome, PAYROLL_TAX_SINGLE_EARNER);
  const studentAvailableIncome = Math.max(
    0,
    studentIncome - studentPayrollTaxAllowance - STUDENT_INCOME_PROTECTION_ALLOWANCE,
  );
  const studentContributionFromIncome = studentAvailableIncome * STUDENT_INCOME_ASSESSMENT_RATE;
  const studentContributionFromAssets =
    Math.max(0, amountOf(input.student.assets)) * STUDENT_ASSET_CONVERSION_RATE;

  const rawSai =
    parentsContributionFromAAI + studentContributionFromIncome + studentContributionFromAssets;
  const estimatedSAI = Math.min(SAI_CAP, Math.max(SAI_FLOOR, Math.round(rawSai)));

  return {
    estimatedSAI,
    awardYear: '2025-26',
    source: SAI_FORMULA_A_SOURCE,
    confidence: 'estimated',
    usableForFinancialDecision: false,
    simplifications,
    breakdown: {
      parentsAvailableIncome,
      parentsContributionFromAssets,
      parentsAdjustedAvailableIncome,
      parentsContributionFromAAI,
      studentAvailableIncome,
      studentContributionFromIncome,
      studentContributionFromAssets,
    },
  };
}
