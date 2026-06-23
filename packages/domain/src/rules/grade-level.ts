import type { GradeLevel } from '../student/identity.js';

export type ComputedGradeLevel = GradeLevel | 'GRADUATED';

export function computeGradeLevel(graduationYear: number, today: Date): ComputedGradeLevel {
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const academicYear = currentMonth >= 8 ? currentYear + 1 : currentYear;
  const yearsUntilGraduation = graduationYear - academicYear;

  if (yearsUntilGraduation < 0) return 'GRADUATED';
  if (yearsUntilGraduation === 0) return 'GRADE_12';
  if (yearsUntilGraduation === 1) return 'GRADE_11';
  if (yearsUntilGraduation === 2) return 'GRADE_10';
  if (yearsUntilGraduation === 3) return 'GRADE_9';
  return 'PRE_HIGH_SCHOOL';
}

export const GRADE_CONVERSION_TABLE: Readonly<
  Record<string, Readonly<Record<string, GradeLevel>>>
> = {
  NZ: {
    'Year 9': 'PRE_HIGH_SCHOOL',
    'Year 10': 'GRADE_9',
    'Year 11': 'GRADE_10',
    'Year 12': 'GRADE_11',
    'Year 13': 'GRADE_12',
  },
  UK_GCSE_ALEVEL: {
    'Year 10': 'GRADE_9',
    'Year 11': 'GRADE_10',
    'Year 12': 'GRADE_11',
    'Year 13': 'GRADE_12',
  },
  IB: {
    'IB Year 1': 'GRADE_11',
    'IB Year 2': 'GRADE_12',
  },
  KOREA: {
    중3: 'GRADE_9',
    고1: 'GRADE_10',
    고2: 'GRADE_11',
    고3: 'GRADE_12',
  },
};

export function convertLocalGrade(curriculum: string, localGrade: string): GradeLevel | null {
  return GRADE_CONVERSION_TABLE[curriculum]?.[localGrade] ?? null;
}
