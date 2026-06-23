import { describe, expect, it } from 'vitest';
import { computeAdmissionsCycle } from './admissions-cycle.js';

describe('computeAdmissionsCycle', () => {
  it('spans the academic year ending in the graduation year', () => {
    expect(computeAdmissionsCycle(2027)).toBe('2026-2027');
  });

  it('handles a single-digit year transition without losing precision', () => {
    expect(computeAdmissionsCycle(2030)).toBe('2029-2030');
  });
});
