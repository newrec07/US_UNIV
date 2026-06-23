export interface IdentityContext {
  legalName: string;
  preferredName?: string;
  dateOfBirth: string;
  schools: School[];
  graduationYear: number;
  targetCountries: string[];
  residencyStatus: ResidencyStatus;
  citizenships: string[];
  nativeLanguages?: string[];
  englishProficiencyContext?: 'native' | 'fluent' | 'developing';
  demographic?: StudentDemographicContext;
}

export interface School {
  id: string;
  name: string;
  country: string;
  curriculum: CurriculumSystem;
  gradeLocalLabel?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  sendsTranscript?: boolean;
}

export interface StudentDemographicContext {
  ethnicity?: string[];
  firstGeneration?: boolean;
  socioeconomicContext?: string;
  geographicContext?: 'urban' | 'suburban' | 'rural' | 'unknown';
  legacyAt?: string[];
  contextNotes?: string;
}

export type CurriculumSystem =
  | 'US_HIGH_SCHOOL'
  | 'NZ'
  | 'UK_GCSE_ALEVEL'
  | 'IB'
  | 'AP_HEAVY'
  | 'CANADA'
  | 'AUSTRALIA'
  | 'KOREA'
  | 'FRANCE_BAC'
  | 'GERMAN_ABITUR'
  | 'INDIA_CBSE'
  | 'INDIA_ICSE'
  | 'SINGAPORE'
  | 'CHINA_GAOKAO'
  | (string & {});

export type GradeLevel =
  | 'GRADE_9'
  | 'GRADE_10'
  | 'GRADE_11'
  | 'GRADE_12'
  | 'GAP_YEAR'
  | 'PRE_HIGH_SCHOOL';

export type ResidencyStatus =
  | 'US_CITIZEN'
  | 'US_PERMANENT_RESIDENT'
  | 'INTERNATIONAL'
  | 'DUAL_CITIZEN'
  | 'DACA'
  | 'REFUGEE_ASYLEE'
  | 'OTHER'
  | (string & {});
