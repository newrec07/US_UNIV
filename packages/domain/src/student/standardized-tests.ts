import type { DataSourceType } from '../shared/provenance.js';
import type { SubjectArea } from './academics.js';

export interface StandardizedTests {
  tests: TestTrack[];
}

export interface TestTrack {
  testType: TestType;
  subject?: string;
  relatedSubjectArea?: SubjectArea;
  status: TestStatus;
  priority?: 'high' | 'medium' | 'low';
  attempts: TestAttempt[];
  targetScore?: string;
  plannedDate?: string;
  notes?: string;
}

export interface TestAttempt {
  date: string;
  isOfficial: boolean;
  source?: DataSourceType;
  totalScore?: ScoreValue;
  sectionScores?: ScoreValue[];
}

export interface ScoreValue {
  label?: string;
  value: string;
  maxValue?: string;
  percentile?: number;
}

export type TestType =
  | 'SAT'
  | 'ACT'
  | 'CLT'
  | 'AP'
  | 'IB_EXAM'
  | 'AP_CAPSTONE'
  | 'TOEFL'
  | 'IELTS'
  | 'DUOLINGO'
  | 'PTE'
  | 'CAMBRIDGE_ENGLISH'
  | 'PSAT'
  | 'PRE_ACT'
  | (string & {});

export type TestStatus =
  | 'NOT_STARTED'
  | 'PLANNED'
  | 'PREPARING'
  | 'TAKEN'
  | 'CANCELLED'
  | 'RETAKE_PLANNED';
