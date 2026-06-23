import type { DataConfidence } from '../shared/provenance.js';
import type { GradingSystem } from '../student/academics.js';

export interface GpaConversionResult {
  estimatedUs: number | null;
  confidence: DataConfidence;
  method: string;
  warning?: string;
}

export function convertGpaToUs(reported: number, system: GradingSystem): GpaConversionResult {
  switch (system) {
    case 'NCEA':
      if (reported >= 3.7) return result(3.9, 'medium', 'NCEA_GPA_direct');
      if (reported >= 3.0) return result(3.5, 'medium', 'NCEA_GPA_direct');
      if (reported >= 2.0) return result(3.0, 'low', 'NCEA_GPA_direct');
      return result(2.5, 'low', 'NCEA_GPA_direct');

    case 'IB_7':
      if (reported >= 6.5) return result(4.0, 'high', 'IB_7_to_US');
      if (reported >= 6.0) return result(3.85, 'high', 'IB_7_to_US');
      if (reported >= 5.5) return result(3.7, 'high', 'IB_7_to_US');
      if (reported >= 5.0) return result(3.5, 'medium', 'IB_7_to_US');
      if (reported >= 4.0) return result(3.0, 'medium', 'IB_7_to_US');
      return result(2.5, 'low', 'IB_7_to_US');

    case 'UK_ALEVEL':
      if (reported >= 4.5) return result(4.0, 'medium', 'UK_ALEVEL_to_US');
      if (reported >= 4.0) return result(3.8, 'medium', 'UK_ALEVEL_to_US');
      if (reported >= 3.0) return result(3.3, 'medium', 'UK_ALEVEL_to_US');
      return result(2.8, 'low', 'UK_ALEVEL_to_US');

    case 'PERCENTAGE':
      if (reported >= 95) return result(4.0, 'medium', 'PCT_to_US');
      if (reported >= 90) return result(3.85, 'medium', 'PCT_to_US');
      if (reported >= 85) return result(3.7, 'medium', 'PCT_to_US');
      if (reported >= 80) return result(3.5, 'medium', 'PCT_to_US');
      if (reported >= 70) return result(3.0, 'medium', 'PCT_to_US');
      if (reported >= 60) return result(2.5, 'low', 'PCT_to_US');
      return result(2.0, 'low', 'PCT_to_US');

    case 'US_GPA_4':
      return result(reported, 'high', 'US_native');

    default:
      return {
        estimatedUs: null,
        confidence: 'low',
        method: 'unsupported_system',
        warning: `No reviewed US GPA conversion is available for ${system}.`,
      };
  }
}

function result(
  estimatedUs: number,
  confidence: DataConfidence,
  method: string,
): GpaConversionResult {
  return { estimatedUs, confidence, method };
}
