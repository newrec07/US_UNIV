import type { Milestone, MilestoneStatus } from '../timeline/timeline.js';

export type MilestoneForStatus = Pick<
  Milestone,
  'status' | 'completedAt' | 'skippedReason' | 'date' | 'estimatedDate'
>;

const DUE_SOON_DAYS = 7;
const APPROACHING_DAYS = 30;

/**
 * Derives a milestone's current status from its dates instead of trusting a
 * stored value, per the "현재 상태는 이력에서 계산한다" principle. Terminal
 * states (not_applicable/completed/skipped) pass through unchanged because
 * they come from template applicability or explicit user action, not dates.
 */
export function computeMilestoneStatus(
  milestone: MilestoneForStatus,
  today: Date,
): MilestoneStatus {
  if (milestone.status === 'not_applicable') return 'not_applicable';
  if (milestone.status === 'completed' || milestone.completedAt) return 'completed';
  if (milestone.status === 'skipped' || milestone.skippedReason) return 'skipped';

  const effectiveDate = milestone.date ?? milestone.estimatedDate;
  if (!effectiveDate) return 'pending_date';

  const dueTime = Date.parse(effectiveDate);
  if (Number.isNaN(dueTime)) return 'pending_date';

  const daysUntil = (dueTime - today.getTime()) / 86_400_000;
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= DUE_SOON_DAYS) return 'due_soon';
  if (daysUntil <= APPROACHING_DAYS) return 'approaching';
  return 'upcoming';
}
