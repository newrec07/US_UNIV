import { describe, expect, it } from 'vitest';
import { computeMilestoneStatus } from './timeline-status.js';

const NOW = new Date('2026-06-24T00:00:00Z');

describe('computeMilestoneStatus', () => {
  it('passes not_applicable through unchanged regardless of dates', () => {
    expect(computeMilestoneStatus({ status: 'not_applicable', date: '2026-01-01' }, NOW)).toBe(
      'not_applicable',
    );
  });

  it('is completed once completedAt is set, even before the due date', () => {
    expect(
      computeMilestoneStatus(
        { status: 'upcoming', completedAt: '2026-06-01T00:00:00Z', date: '2026-12-01' },
        NOW,
      ),
    ).toBe('completed');
  });

  it('is completed when status is already completed without an explicit timestamp', () => {
    expect(computeMilestoneStatus({ status: 'completed' }, NOW)).toBe('completed');
  });

  it('is skipped once a skip reason is recorded', () => {
    expect(
      computeMilestoneStatus(
        { status: 'upcoming', skippedReason: 'not applicable to this student' },
        NOW,
      ),
    ).toBe('skipped');
  });

  it('is pending_date with neither a confirmed nor an estimated date', () => {
    expect(computeMilestoneStatus({ status: 'pending_date' }, NOW)).toBe('pending_date');
  });

  it('falls back to the estimated date when no confirmed date exists', () => {
    expect(computeMilestoneStatus({ status: 'upcoming', estimatedDate: '2026-06-20' }, NOW)).toBe(
      'overdue',
    );
  });

  it('is overdue once the date has passed', () => {
    expect(computeMilestoneStatus({ status: 'upcoming', date: '2026-06-01' }, NOW)).toBe('overdue');
  });

  it('is due_soon at the boundary of 7 days out', () => {
    expect(computeMilestoneStatus({ status: 'upcoming', date: '2026-07-01' }, NOW)).toBe(
      'due_soon',
    );
  });

  it('is approaching just past the due_soon boundary', () => {
    expect(computeMilestoneStatus({ status: 'upcoming', date: '2026-07-02' }, NOW)).toBe(
      'approaching',
    );
  });

  it('is approaching at the boundary of 30 days out', () => {
    expect(computeMilestoneStatus({ status: 'upcoming', date: '2026-07-24' }, NOW)).toBe(
      'approaching',
    );
  });

  it('is upcoming just past the approaching boundary', () => {
    expect(computeMilestoneStatus({ status: 'upcoming', date: '2026-07-25' }, NOW)).toBe(
      'upcoming',
    );
  });

  it('treats an unparseable date as pending_date rather than throwing', () => {
    expect(computeMilestoneStatus({ status: 'upcoming', date: 'not-a-date' }, NOW)).toBe(
      'pending_date',
    );
  });
});
