import type { DataSourceType } from '../shared/provenance.js';
import type { MilestoneCategory } from './timeline.js';

export interface AdmissionsCalendar {
  id: string;
  academicYear: string;
  events: CalendarEvent[];
  lastUpdated: string;
  source?: DataSourceType;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  category: MilestoneCategory;
  provider: ExternalProvider;
  relatedDates?: RelatedDate[];
  applicableTo?: string[];
  notes?: string;
}

export interface RelatedDate {
  type: RelatedDateType;
  date: string;
  label?: string;
}

export type RelatedDateType =
  | 'registration_deadline'
  | 'late_registration'
  | 'score_release'
  | 'fee_deadline'
  | 'order_deadline'
  | (string & {});

export type ExternalProvider =
  | 'COLLEGE_BOARD'
  | 'ACT_ORG'
  | 'COMMON_APP'
  | 'COALITION_APP'
  | 'UC_APP'
  | 'FAFSA'
  | 'CSS_PROFILE'
  | 'COLLEGE_SPECIFIC'
  | (string & {});
