/**
 * 이 모듈은 운영용 FAFSA SAI 계산기가 아니다.
 *
 * 실제 SAI는 award year별 공식 표와 변수로 계산해야 한다. 현재 구현은 데이터 흐름과
 * UI를 개발하기 위한 명시적 experimental placeholder이며 사용자 재정 결정에 사용하면 안 된다.
 */

export interface ExperimentalSaiInput {
  parentAgi: number;
  parentAssets: number;
  studentIncome: number;
  studentAssets: number;
  householdSize: number;
}

export interface ExperimentalSaiResult {
  estimatedSAI: number;
  confidence: 'rough_estimate';
  method: 'experimental_unverified_sai';
  usableForFinancialDecision: false;
  warning: string;
  breakdown: {
    parentContribution: number;
    studentContribution: number;
  };
}

export function computeExperimentalSai(input: ExperimentalSaiInput): ExperimentalSaiResult {
  const values = Object.values(input);
  if (values.some((value) => value < 0)) {
    throw new RangeError('SAI input values must be non-negative.');
  }

  const ipaTable: Readonly<Record<number, number>> = {
    2: 20550,
    3: 25550,
    4: 31550,
    5: 37200,
    6: 43500,
  };
  const boundedHouseholdSize = Math.min(Math.max(input.householdSize, 2), 6);
  const ipa = ipaTable[boundedHouseholdSize] ?? 31550;
  const taxAllowance = input.parentAgi * 0.22;
  const availableIncome = Math.max(0, input.parentAgi - ipa - taxAllowance);

  let incomeContribution: number;
  if (availableIncome <= 20000) {
    incomeContribution = availableIncome * 0.22;
  } else if (availableIncome <= 50000) {
    incomeContribution = 4400 + (availableIncome - 20000) * 0.32;
  } else {
    incomeContribution = 14000 + (availableIncome - 50000) * 0.47;
  }

  const assetContribution = Math.max(0, (input.parentAssets - 10000) * 0.0564);
  const parentContribution = Math.round(incomeContribution + assetContribution);
  const studentContribution = Math.round(
    Math.max(0, (input.studentIncome - 7040) * 0.5) + input.studentAssets * 0.2,
  );

  return {
    estimatedSAI: Math.max(-1500, parentContribution + studentContribution),
    confidence: 'rough_estimate',
    method: 'experimental_unverified_sai',
    usableForFinancialDecision: false,
    warning:
      'Experimental placeholder only. Replace with the official award-year FAFSA formula before user-facing use.',
    breakdown: { parentContribution, studentContribution },
  };
}
