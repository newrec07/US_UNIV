import type { DataConfidence, DataSourceType } from '../shared/provenance.js';
import type { Trend } from '../shared/temporal.js';

export interface SchoolAcademics {
  records: AcademicRecord[];
  cumulativeGpa?: GpaValue;
  overallRigor?: 'low' | 'moderate' | 'high' | 'very_high';
  gradeTrend?: Trend;
  notes?: string;
}

export interface AcademicRecord {
  schoolId: string;
  gradingSystem: GradingSystem;
  terms: Term[];
  recordGpa?: GpaValue;
}

export interface Term {
  id: string;
  label: string;
  at: string;
  endDate?: string;
  courses: Course[];
  termGpa?: GpaValue;
}

export interface Course {
  name: string;
  subjectArea: SubjectArea;
  level?: CourseLevel;
  gradeReceived?: string;
  credits?: number;
  inProgress: boolean;
}

export interface GpaValue {
  reported?: number;
  reportedScale?: string;
  unweighted?: number;
  weighted?: number;
  estimatedUs?: number;
  conversionConfidence?: DataConfidence;
  source?: DataSourceType;
}

export type GradingSystem =
  | 'US_GPA_4'
  | 'PERCENTAGE'
  | 'IB_7'
  | 'NCEA'
  | 'UK_ALEVEL'
  | 'LETTER'
  | (string & {});

export type SubjectArea =
  | 'MATH'
  | 'SCIENCE_CHEM'
  | 'SCIENCE_BIO'
  | 'SCIENCE_PHYS'
  | 'ENGLISH'
  | 'SOCIAL_STUDIES'
  | 'FOREIGN_LANGUAGE'
  | 'CS'
  | 'ARTS'
  | 'PE'
  | 'OTHER'
  | (string & {});

export type CourseLevel =
  | 'REGULAR'
  | 'HONORS'
  | 'AP'
  | 'IB_SL'
  | 'IB_HL'
  | 'DUAL_ENROLLMENT'
  | 'ADVANCED'
  | (string & {});
