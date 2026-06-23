import type { Student } from '../student/student.js';
import type { CompletenessLevel, SectionCompleteness } from '../student/meta.js';

export type DeepPartial<T> = T extends readonly (infer Item)[]
  ? DeepPartial<Item>[]
  : T extends object
    ? { [Key in keyof T]?: DeepPartial<T[Key]> }
    : T;

export type StudentDraft = DeepPartial<Student>;

interface CompletenessRule {
  section: string;
  check: (student: StudentDraft) => CompletenessLevel;
  blocksAssessment: boolean;
}

const COMPLETENESS_RULES: readonly CompletenessRule[] = [
  {
    section: 'identity',
    blocksAssessment: true,
    check: (student) => {
      const identity = student.identity;
      if (!identity?.legalName || !identity.graduationYear) return 'empty';
      if (!identity.residencyStatus || !identity.citizenships?.length) return 'partial';
      if (!identity.schools?.length) return 'partial';
      return 'complete';
    },
  },
  {
    section: 'academicDirection',
    blocksAssessment: false,
    check: (student) => {
      if (!student.academicDirection?.intendedMajors?.length) return 'empty';
      if (!student.academicDirection.fieldClusters?.length) return 'partial';
      return 'sufficient';
    },
  },
  {
    section: 'schoolAcademics',
    blocksAssessment: true,
    check: (student) => {
      const academics = student.schoolAcademics;
      if (!academics?.records?.length) return 'empty';

      const hasTerms = academics.records.some((record) => (record.terms?.length ?? 0) > 0);
      if (!hasTerms) return 'partial';

      const hasGpa =
        academics.cumulativeGpa?.reported !== undefined ||
        academics.cumulativeGpa?.estimatedUs !== undefined;
      return hasGpa ? 'complete' : 'sufficient';
    },
  },
  {
    section: 'standardizedTests',
    blocksAssessment: true,
    check: (student) => {
      const tests = student.standardizedTests?.tests ?? [];
      if (tests.length === 0) return 'empty';

      const hasTaken = tests.some(
        (test) => test.status === 'TAKEN' && (test.attempts?.length ?? 0) > 0,
      );
      if (hasTaken) return 'complete';

      const hasPlanned = tests.some(
        (test) => test.status === 'PLANNED' || test.status === 'PREPARING',
      );
      return hasPlanned ? 'partial' : 'empty';
    },
  },
  {
    section: 'activities',
    blocksAssessment: false,
    check: (student) => {
      const total =
        (student.activities?.activities?.length ?? 0) +
        (student.activities?.competitions?.length ?? 0);
      if (total === 0) return 'empty';
      if (total < 3) return 'partial';
      if (total < 6) return 'sufficient';
      return 'complete';
    },
  },
  {
    section: 'financial',
    blocksAssessment: true,
    check: (student) => {
      const profile = student.financial?.financialProfile;
      if (!profile || profile.needsAid === undefined) return 'empty';
      if (!profile.households?.length) return 'partial';
      if (profile.estimatedSAI !== undefined) return 'complete';
      return 'sufficient';
    },
  },
  {
    section: 'collegeList',
    blocksAssessment: false,
    check: (student) => {
      const collegeList = student.collegeList ?? [];
      if (collegeList.length === 0) return 'empty';
      if (collegeList.length < 3) return 'partial';
      return collegeList.some((college) => college.status) ? 'sufficient' : 'partial';
    },
  },
];

export function computeCompleteness(student: StudentDraft): SectionCompleteness[] {
  return COMPLETENESS_RULES.map((rule) => ({
    section: rule.section,
    level: rule.check(student),
    blocksAssessment: rule.blocksAssessment,
  }));
}
