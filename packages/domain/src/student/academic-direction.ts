import type { FieldClusterRef } from '../shared/vocabulary.js';

export interface AcademicDirection {
  intendedMajors: MajorInterest[];
  careerTracks?: string[];
  fieldClusters: FieldClusterRef[];
  academicInterests?: string[];
  notes?: string;
}

export interface MajorInterest {
  name: string;
  fieldClusters?: FieldClusterRef[];
  certainty?: 'exploring' | 'leaning' | 'committed';
}
