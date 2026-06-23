/** action_layer — see docs/product/domain-model.md#표현-계층과-도메인-타입의-매핑 */
export interface Action {
  id: string;
  title: string;
  detail?: string;
  estimatedMinutes?: number;
  origin: ActionOrigin;
  urgency: ActionUrgency;
  admissionsImpact: ActionImpact;
  isFoundational: boolean;
  deadline?: string;
  status: ActionStatus;
  reason?: string;
  createdAt: string;
  statusChangedAt?: string;
}

export interface ActionOrigin {
  block: string;
  entityId?: string;
  generatedBy: 'agent' | 'student' | 'consultant';
}

export type ActionUrgency = 'today' | 'this_week' | 'upcoming' | 'someday';
export type ActionImpact = 'high' | 'medium' | 'low';
export type ActionStatus = 'suggested' | 'accepted' | 'in_progress' | 'done' | 'dismissed';
