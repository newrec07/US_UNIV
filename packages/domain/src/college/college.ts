import type { DataSourceType } from '../shared/provenance.js';

export interface College {
  id: string;
  name: string;
  aliases?: string[];
  country: string;
  state?: string;
  city?: string;
  type?: 'public' | 'private_nonprofit' | 'private_forprofit';
  costOfAttendance?: MoneyByYear;
  needPolicy?: CollegeNeedPolicy;
  meritPolicy?: CollegeMeritPolicy;
  admitRate?: number;
  enrolledDemographics?: CollegeDemographicReference;
  usesTopXPercent?: boolean;
  endedLegacy?: boolean;
  dataYear?: number;
  dataSource?: DataSourceType;
  lastUpdated?: string;
}

export interface CollegeNeedPolicy {
  meetsFullNeed?: boolean;
  avgNeedMetPct?: number;
  isGapping?: boolean;
  requiresCSSProfile?: boolean;
  aidForNonCitizens?: 'same' | 'limited' | 'none' | 'unknown';
}

export interface CollegeMeritPolicy {
  offers?: boolean;
  aggressiveness?: 'none' | 'modest' | 'generous' | 'very_generous';
  avgAward?: number;
  thresholds?: string;
}

export interface MoneyByYear {
  current?: number;
  byYear?: Record<string, number>;
}

export interface CollegeDemographicReference {
  enrolledDemographics?: Record<string, number>;
  pctFirstGen?: number;
  pctPell?: number;
  postSFFA_trend?: string;
  dataYear?: number;
  dataConfidence: 'official_cds' | 'estimated' | 'unknown';
}
