export const STANDARD_FIELD_CLUSTERS = [
  'STEM_LIFE_SCIENCE',
  'STEM_PHYSICAL',
  'STEM_ENGINEERING',
  'STEM_CS_MATH',
  'HEALTH',
  'SOCIAL_SCIENCE',
  'HUMANITIES',
  'BUSINESS',
  'ARTS',
] as const;

export type StandardFieldCluster = (typeof STANDARD_FIELD_CLUSTERS)[number];
export type FieldClusterRef = StandardFieldCluster | (string & {});

export interface StudentVocabularies {
  customFieldClusters?: CustomTerm[];
}

export interface CustomTerm {
  code: string;
  label: string;
  createdFrom?: string;
}
