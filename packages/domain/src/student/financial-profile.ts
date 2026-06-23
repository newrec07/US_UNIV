import type { DataConfidence, DataSourceType } from '../shared/provenance.js';
import type { Preferences } from './preferences.js';

export interface FinancialAndPreferences {
  financialProfile: FinancialProfile;
  preferences: Preferences;
}

export interface FinancialProfile {
  needsAid: boolean;
  willFileFAFSA: boolean;
  willFileCSSProfile?: boolean;
  households: Household[];
  studentFinancials?: StudentFinancials;
  householdSize?: number;
  numberInCollege?: number;
  specialCircumstances?: string[];
  estimatedSAI?: number;
  saiCalculatedAt?: string;
  saiBasedOnTaxYear?: number;
  dataConfidence: 'rough_estimate' | 'parent_reported' | 'tax_verified';
}

export interface Household {
  id: string;
  type: 'primary' | 'noncustodial' | 'combined';
  taxYear?: number;
  filingStatus?: 'married_joint' | 'single' | 'separated' | 'hoh' | 'other';
  agi?: FinancialFigure;
  taxPaid?: FinancialFigure;
  incomeUntaxed?: FinancialFigure;
  cashSavings?: FinancialFigure;
  realEstateEquity?: FinancialFigure;
  businessValue?: FinancialFigure;
  collegeSavings529?: FinancialFigure;
  homeEquity?: FinancialFigure;
}

export interface FinancialFigure {
  amount: number;
  source?: DataSourceType;
  confidence?: DataConfidence;
}

export interface StudentFinancials {
  income?: FinancialFigure;
  assets?: FinancialFigure;
}
