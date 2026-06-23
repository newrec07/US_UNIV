import type { DataConfidence } from '../shared/provenance.js';

/** status_layer — see docs/product/domain-model.md#표현-계층과-도메인-타입의-매핑 */
export interface ProfileAssessment {
  current: AssessmentSnapshot;
  history?: AssessmentSnapshotLite[];
}

export interface AssessmentSnapshot {
  assessments: DimensionAssessment[];
  overallSummary?: AssessmentSummary;
  generatedAt: string;
  generatedBy: 'agent' | 'consultant';
  modelUsed?: string;
  basedOnDataVersion: string;
}

export interface AssessmentSnapshotLite {
  generatedAt: string;
  ratings: Partial<Record<AdmissionsDimension, DimensionRating>>;
  overallRisk: 'low' | 'medium' | 'high';
}

export interface DimensionAssessment {
  dimension: AdmissionsDimension;
  rating: DimensionRating;
  evidence: Evidence[];
  confidence: DataConfidence;
  whyItMatters?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Evidence {
  statement: string;
  sourceBlock?: string;
  sourceRef?: string;
}

export interface AssessmentSummary {
  topStrengths: AdmissionsDimension[];
  topGaps: AdmissionsDimension[];
  overallRisk: 'low' | 'medium' | 'high';
  nextBestActionId?: string;
  narrative?: string;
}

export type DimensionRating = 'strong' | 'adequate' | 'developing' | 'weak' | 'critical_gap';

export type AdmissionsDimension =
  | 'SCHOOL_GRADES'
  | 'COURSE_RIGOR'
  | 'STANDARDIZED_TESTS'
  | 'ACTIVITY_DEPTH'
  | 'LEADERSHIP'
  | 'COMPETITION_AWARDS'
  | 'NARRATIVE_COHERENCE'
  | 'ESSAY_READINESS'
  | 'COLLEGE_LIST_FIT'
  | 'FINANCIAL_FIT'
  | 'TIMELINE_PROGRESS'
  | (string & {});
