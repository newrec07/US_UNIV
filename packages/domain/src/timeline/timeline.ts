import type { DataSourceType } from '../shared/provenance.js';

export interface MasterTimeline {
  milestones: Milestone[];
  generatedAt: string;
  basedOnGraduationYear: number;
  deactivatedTemplateIds?: string[];
  collegeDeadlines?: CollegeDeadline[];
}

export interface Milestone {
  id: string;
  templateId: string;
  title: string;
  detail?: string;
  phase: TimelinePhase;
  category: MilestoneCategory;
  date?: string;
  estimatedDate?: string;
  dateType: MilestoneDateType;
  dateSource?: string;
  status: MilestoneStatus;
  completedAt?: string;
  skippedReason?: string;
  linkedBlock?: string;
  linkedEntityId?: string;
  dependsOn?: string[];
  unlocks?: string[];
  branchPoint?: BranchPoint;
  actionTrigger?: MilestoneActionTrigger;
  notes?: string;
}

export interface BranchPoint {
  question: string;
  options: BranchOption[];
}

export interface BranchOption {
  label: string;
  activatesMilestones?: string[];
  deactivatesMilestones?: string[];
}

export interface MilestoneActionTrigger {
  daysBeforeDeadline: number;
  suggestedActionTitle: string;
  urgency: 'today' | 'this_week' | 'upcoming' | 'someday';
  admissionsImpact: 'high' | 'medium' | 'low';
}

export interface CollegeDeadline {
  collegeId: string;
  deadlineType: ApplicationRound;
  date: string;
  financialAidDeadline?: string;
  supplementDeadline?: string;
  source?: DataSourceType;
}

export type ApplicationRound = 'ED' | 'ED2' | 'EA' | 'REA' | 'RD' | 'ROLLING' | (string & {});

export type TimelinePhase =
  | 'TESTING_STRATEGY'
  | 'TESTING_EXECUTION'
  | 'SCORE_REVIEW'
  | 'COLLEGE_RESEARCH'
  | 'ESSAY_PORTFOLIO'
  | 'FINANCIAL_PREP'
  | 'APPLICATION_SUBMISSION'
  | 'DECISIONS_ENROLLMENT'
  | (string & {});

export type MilestoneCategory =
  | 'TEST_REGISTRATION'
  | 'TEST_DATE'
  | 'SCORE_RELEASE'
  | 'TEST_PREP'
  | 'TEST_DECISION'
  | 'APPLICATION_DEADLINE'
  | 'SUPPLEMENT_DEADLINE'
  | 'FINANCIAL_AID_DEADLINE'
  | 'SCHOLARSHIP_DEADLINE'
  | 'ESSAY_MILESTONE'
  | 'RECOMMENDATION'
  | 'TRANSCRIPT_REQUEST'
  | 'INTERVIEW'
  | 'CAMPUS_VISIT'
  | 'DECISION_RELEASE'
  | 'ENROLLMENT_DEADLINE'
  | 'COURSE_SELECTION'
  | 'ACTIVITY_MILESTONE'
  | 'PORTFOLIO_DEADLINE'
  | (string & {});

export type MilestoneDateType = 'external_fixed' | 'annual_fixed' | 'calculated' | 'student_set';

export type MilestoneStatus =
  | 'not_applicable'
  | 'pending_date'
  | 'upcoming'
  | 'approaching'
  | 'due_soon'
  | 'overdue'
  | 'completed'
  | 'skipped';
