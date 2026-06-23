export interface Preferences {
  schoolSizePreference?: Preference<SchoolSize>;
  settingPreference?: Preference<CampusSetting>;
  geographicConstraints?: GeoPreference[];
  generic?: GenericPreference[];
  familyConstraints?: string[];
  notes?: string;
}

export interface Preference<T> {
  value: T;
  strength: 'hard' | 'strong' | 'soft';
}

export interface GeoPreference {
  region: string;
  intent: 'prefer' | 'avoid' | 'require';
  strength: 'hard' | 'strong' | 'soft';
}

export interface GenericPreference {
  topic: PreferenceTopic;
  detail?: string;
  strength: 'hard' | 'strong' | 'soft';
}

export type SchoolSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ANY';
export type CampusSetting = 'URBAN' | 'SUBURBAN' | 'RURAL' | 'ANY';

export type PreferenceTopic =
  | 'RESEARCH_ACCESS'
  | 'PRE_HEALTH_ADVISING'
  | 'CLIMATE'
  | 'DIVERSITY'
  | 'GREEK_LIFE'
  | 'RELIGIOUS_AFFILIATION'
  | 'STUDY_ABROAD'
  | 'INTERNSHIP_COOP'
  | 'CAMPUS_SAFETY'
  | 'DISTANCE_FROM_HOME'
  | (string & {});
