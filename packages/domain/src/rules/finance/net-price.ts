export interface NetPriceInput {
  collegeCOA: number;
  estimatedSAI: number;
  meetsFullNeed: boolean;
  avgNeedMetPct: number;
  estimatedMeritAward?: number;
  isGapping: boolean;
}

export interface NetPriceResult {
  costOfAttendance: number;
  demonstratedNeed: number;
  estimatedGrantAid: number;
  estimatedMeritAid: number;
  estimatedSelfHelp: number;
  estimatedNetPrice: number;
  gap: number;
}

export function computeNetPrice(input: NetPriceInput): NetPriceResult {
  assertNonNegative(input.collegeCOA, 'collegeCOA');
  assertNonNegative(input.estimatedMeritAward ?? 0, 'estimatedMeritAward');

  if (input.avgNeedMetPct < 0 || input.avgNeedMetPct > 100) {
    throw new RangeError('avgNeedMetPct must be between 0 and 100.');
  }

  const demonstratedNeed = Math.max(0, input.collegeCOA - input.estimatedSAI);
  const needMet = input.meetsFullNeed
    ? demonstratedNeed
    : demonstratedNeed * (input.avgNeedMetPct / 100);
  const estimatedSelfHelp = Math.min(needMet, 6500);
  const estimatedGrantAid = Math.max(0, needMet - estimatedSelfHelp);
  const estimatedMeritAid = input.estimatedMeritAward ?? 0;
  const gap = input.isGapping ? Math.max(0, demonstratedNeed - needMet) : 0;
  const estimatedNetPrice = Math.max(0, input.collegeCOA - estimatedGrantAid - estimatedMeritAid);

  return {
    costOfAttendance: input.collegeCOA,
    demonstratedNeed,
    estimatedGrantAid,
    estimatedMeritAid,
    estimatedSelfHelp,
    estimatedNetPrice,
    gap,
  };
}

function assertNonNegative(value: number, name: string): void {
  if (value < 0) {
    throw new RangeError(`${name} must be non-negative.`);
  }
}
