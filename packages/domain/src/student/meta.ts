import type { DataSourceType } from '../shared/provenance.js';

/** system_layer — see docs/product/domain-model.md#표현-계층과-도메인-타입의-매핑 */
export interface SystemMeta {
  schemaVersion: string;
  dataVersion: string;
  migratedFrom?: string;
  createdAt: string;
  updatedAt: string;
  lastAgentRunAt?: string;
  completeness: SectionCompleteness[];
  dataSources?: DataSourceLog[];
  onboardingComplete: boolean;
  notes?: string;
}

/** status_layer — see docs/product/domain-model.md#표현-계층과-도메인-타입의-매핑 */
export interface SectionCompleteness {
  section: string;
  level: CompletenessLevel;
  blocksAssessment?: boolean;
}

export type CompletenessLevel = 'empty' | 'partial' | 'sufficient' | 'complete';

export interface DataSourceLog {
  ref: DataRef;
  source: DataSourceType;
  timestamp: string;
  detail?: string;
}

export interface DataRef {
  block: string;
  entityId?: string;
}
