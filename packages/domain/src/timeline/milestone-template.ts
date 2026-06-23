import type { ExternalProvider } from './calendar.js';
import type {
  BranchPoint,
  MilestoneActionTrigger,
  MilestoneCategory,
  MilestoneDateType,
  TimelinePhase,
} from './timeline.js';

export interface MilestoneTemplate {
  id: string;
  title: string;
  detail?: string;
  phase: TimelinePhase;
  category: MilestoneCategory;
  timing: MilestoneTiming;
  dateType: MilestoneDateType;
  linkedBlock?: string;
  linkedEntityHint?: string;
  dependsOnTemplates?: string[];
  unlocksTemplates?: string[];
  actionTrigger?: MilestoneActionTrigger;
  applicableWhen?: MilestoneCondition[];
  excludeWhen?: MilestoneCondition[];
  branchPoint?: BranchPoint;
}

export type MilestoneTiming =
  | { type: 'annual_fixed'; month: number; day: number }
  | {
      type: 'cycle_relative';
      yearOffset: number;
      month: number;
      week?: 1 | 2 | 3 | 4;
    }
  | {
      type: 'external_fetch';
      provider: ExternalProvider;
      eventPattern: string;
    }
  | {
      type: 'relative_to';
      templateId: string;
      offsetDays: number;
    };

export interface MilestoneCondition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'exists';
  value?: string | string[] | boolean;
}
