import { describe, expect, it } from 'vitest';
import { computeGradeLevel, convertLocalGrade } from './grade-level.js';

describe('computeGradeLevel', () => {
  it('uses August as the academic-year boundary', () => {
    expect(computeGradeLevel(2027, new Date('2026-07-31T00:00:00Z'))).toBe('GRADE_11');
    expect(computeGradeLevel(2027, new Date('2026-08-01T00:00:00Z'))).toBe('GRADE_12');
  });

  it('returns graduated after the graduation academic year', () => {
    expect(computeGradeLevel(2025, new Date('2026-06-01T00:00:00Z'))).toBe('GRADUATED');
  });
});

describe('convertLocalGrade', () => {
  it('maps NZ Year 9 without an unsafe GRADE_8 assertion', () => {
    expect(convertLocalGrade('NZ', 'Year 9')).toBe('PRE_HIGH_SCHOOL');
  });

  it('returns null for an unsupported mapping', () => {
    expect(convertLocalGrade('UNKNOWN', 'Year 11')).toBeNull();
  });
});
