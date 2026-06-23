export type DataSourceType =
  | 'student_input'
  | 'parent_input'
  | 'document_upload'
  | 'official_report'
  | 'agent_inferred'
  | 'web_research'
  | (string & {});

export type DataConfidence = 'high' | 'medium' | 'low';

export interface Provenance {
  source: DataSourceType;
  confidence?: DataConfidence;
  asOf?: string;
}

export interface ExternalFactProvenance {
  sourceUrl: string;
  sourceTitle?: string;
  publisher: string;
  retrievedAt: string;
  effectiveYear?: string;
  confidence: 'official' | 'secondary' | 'estimated';
}
