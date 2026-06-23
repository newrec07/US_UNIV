import { describe, expect, it } from 'vitest';
import { convertGpaToUs } from './gpa-conversion.js';

describe('convertGpaToUs', () => {
  it('does not pass an unsupported grading system through as a US GPA', () => {
    expect(convertGpaToUs(88, 'UNREVIEWED_SYSTEM')).toMatchObject({
      estimatedUs: null,
      confidence: 'low',
      method: 'unsupported_system',
    });
  });

  it('passes a US 4.0-scale GPA through unconverted at high confidence', () => {
    expect(convertGpaToUs(3.6, 'US_GPA_4')).toMatchObject({
      estimatedUs: 3.6,
      confidence: 'high',
      method: 'US_native',
    });
  });

  describe('NCEA brackets', () => {
    it.each([
      [3.7, 3.9, 'medium'],
      [3.0, 3.5, 'medium'],
      [2.0, 3.0, 'low'],
      [1.0, 2.5, 'low'],
    ] as const)('converts NCEA %s to %s at %s confidence', (reported, estimatedUs, confidence) => {
      expect(convertGpaToUs(reported, 'NCEA')).toMatchObject({ estimatedUs, confidence });
    });
  });

  describe('IB_7 brackets', () => {
    it.each([
      [6.5, 4.0, 'high'],
      [6.0, 3.85, 'high'],
      [5.5, 3.7, 'high'],
      [5.0, 3.5, 'medium'],
      [4.0, 3.0, 'medium'],
      [3.0, 2.5, 'low'],
    ] as const)('converts IB_7 %s to %s at %s confidence', (reported, estimatedUs, confidence) => {
      expect(convertGpaToUs(reported, 'IB_7')).toMatchObject({ estimatedUs, confidence });
    });
  });

  describe('UK_ALEVEL brackets', () => {
    it.each([
      [4.5, 4.0, 'medium'],
      [4.0, 3.8, 'medium'],
      [3.0, 3.3, 'medium'],
      [1.0, 2.8, 'low'],
    ] as const)(
      'converts UK_ALEVEL %s to %s at %s confidence',
      (reported, estimatedUs, confidence) => {
        expect(convertGpaToUs(reported, 'UK_ALEVEL')).toMatchObject({ estimatedUs, confidence });
      },
    );
  });

  describe('PERCENTAGE brackets', () => {
    it.each([
      [95, 4.0, 'medium'],
      [90, 3.85, 'medium'],
      [85, 3.7, 'medium'],
      [80, 3.5, 'medium'],
      [70, 3.0, 'medium'],
      [60, 2.5, 'low'],
      [40, 2.0, 'low'],
    ] as const)(
      'converts PERCENTAGE %s to %s at %s confidence',
      (reported, estimatedUs, confidence) => {
        expect(convertGpaToUs(reported, 'PERCENTAGE')).toMatchObject({ estimatedUs, confidence });
      },
    );
  });
});
