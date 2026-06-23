import type { DataConfidence } from '../shared/provenance.js';

export type StudentCollegeStatus =
  | 'researching'
  | 'shortlisted'
  | 'applying'
  | 'applied'
  | 'withdrawn'
  | 'enrolled';

export interface StudentCollege {
  collegeId: string;
  status?: StudentCollegeStatus;
  appliedMajor?: string;
  estimatedCost?: NetPriceBreakdown;
  affordabilityVerdict?: 'affordable' | 'stretch' | 'unaffordable' | 'unknown';
  fitConfidence?: DataConfidence;
  notes?: string;
}

export interface NetPriceBreakdown {
  costOfAttendance: number;
  estimatedGrantAid?: number;
  estimatedMeritAid?: number;
  estimatedSelfHelp?: number;
  estimatedNetPrice?: number;
  /** SystemMeta.dataVersion this breakdown was calculated against, to detect staleness. */
  basedOnDataVersion: string;
  calculatedAt: string;
}
