import type { Action } from '../student/action.js';

export type ActionForPriority = Pick<
  Action,
  'id' | 'urgency' | 'admissionsImpact' | 'isFoundational' | 'deadline' | 'status' | 'createdAt'
>;

const URGENCY_WEIGHT = {
  today: 100,
  this_week: 70,
  upcoming: 40,
  someday: 10,
} as const;

const IMPACT_WEIGHT = {
  high: 50,
  medium: 30,
  low: 10,
} as const;

const FOUNDATIONAL_BONUS = 25;
const ACTIVE_STATUSES = new Set(['suggested', 'accepted', 'in_progress']);

export function computeNextBestAction(actions: ActionForPriority[], now: Date): string | null {
  const scored = actions
    .filter((action) => ACTIVE_STATUSES.has(action.status))
    .map((action) => ({
      action,
      score: scoreAction(action, now),
      deadlineTime: parseDate(action.deadline),
    }));

  scored.sort((left, right) => {
    if (left.score !== right.score) return right.score - left.score;
    if (left.deadlineTime !== right.deadlineTime) {
      return left.deadlineTime - right.deadlineTime;
    }

    const createdComparison = left.action.createdAt.localeCompare(right.action.createdAt);
    if (createdComparison !== 0) return createdComparison;
    return left.action.id.localeCompare(right.action.id);
  });

  return scored[0]?.action.id ?? null;
}

function scoreAction(action: ActionForPriority, now: Date): number {
  let score =
    URGENCY_WEIGHT[action.urgency] +
    IMPACT_WEIGHT[action.admissionsImpact] +
    (action.isFoundational ? FOUNDATIONAL_BONUS : 0);

  if (!action.deadline) return score;

  const deadlineTime = Date.parse(action.deadline);
  if (Number.isNaN(deadlineTime)) return score;

  const daysLeft = (deadlineTime - now.getTime()) / 86_400_000;
  if (daysLeft < 0) score += 200;
  else if (daysLeft < 3) score += 80;
  else if (daysLeft < 7) score += 50;
  else if (daysLeft < 14) score += 20;

  return score;
}

function parseDate(value: string | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}
