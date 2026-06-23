import type { TimedNote } from '../shared/temporal.js';
import type { FieldClusterRef } from '../shared/vocabulary.js';

export interface ActivitiesLeadership {
  activities: Activity[];
  competitions: Competition[];
  awards: Award[];
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  organization?: string;
  description?: string;
  fieldClusters?: FieldClusterRef[];
  startDate?: string;
  endDate?: string;
  ongoing: boolean;
  hoursPerWeek?: number;
  weeksPerYear?: number;
  currentRole?: string;
  leadership: boolean;
  growthStage?: GrowthStage;
  milestones?: ActivityMilestone[];
  motivation?: string;
  learnings?: TimedNote[];
  impact?: string;
  assessmentSource?: 'agent' | 'student';
  notes?: string;
}

export interface ActivityMilestone {
  date: string;
  change: string;
  newRole?: string;
  newStage?: GrowthStage;
}

export interface Competition {
  id: string;
  name: string;
  scope: CompetitionScope;
  field?: string;
  fieldClusters?: FieldClusterRef[];
  status: CompetitionStatus;
  takeaways?: TimedNote[];
  date?: string;
  result?: CompetitionResult;
  isAwardWorthy: boolean;
  description?: string;
  notes?: string;
}

export interface CompetitionResult {
  placement?: string;
  rank?: number;
  outOf?: number;
  tier?: 'participant' | 'recognized' | 'top_decile' | 'top_percentile' | 'winner';
  selectivityNote?: string;
}

export interface Award {
  id: string;
  title: string;
  level: CompetitionScope;
  date?: string;
  originType?: 'academic' | 'competition' | 'activity' | 'other';
  linkedCompetitionId?: string;
  description?: string;
}

export type ActivityType =
  | 'CLUB'
  | 'VOLUNTEER'
  | 'RESEARCH'
  | 'PROJECT'
  | 'INTERNSHIP'
  | 'WORK'
  | 'SPORTS'
  | 'ARTS'
  | 'TUTORING'
  | 'ENTREPRENEURSHIP'
  | 'PUBLICATION'
  | 'FAMILY_RESPONSIBILITY'
  | (string & {});

export type GrowthStage = 'EXPLORING' | 'PARTICIPATING' | 'CONTRIBUTING' | 'LEADING' | 'INITIATING';

export type CompetitionScope = 'SCHOOL' | 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';

export type CompetitionStatus =
  | 'INTERESTED'
  | 'PLANNED'
  | 'PREPARING'
  | 'PARTICIPATED'
  | 'PLACED'
  | 'CANCELLED';
