import type { StudentCollege } from '../college/student-college.js';
import type { AgentRun } from '../messenger/agent-run.js';
import type { Message } from '../messenger/message.js';
import type { ProposedCommand } from '../messenger/proposed-command.js';
import type { StudentVocabularies } from '../shared/vocabulary.js';
import type { MasterTimeline } from '../timeline/timeline.js';
import type { AcademicDirection } from './academic-direction.js';
import type { SchoolAcademics } from './academics.js';
import type { Action } from './action.js';
import type { ActivitiesLeadership } from './activities.js';
import type { ProfileAssessment } from './assessment.js';
import type { FinancialAndPreferences } from './financial-profile.js';
import type { IdentityContext } from './identity.js';
import type { SystemMeta } from './meta.js';
import type { StandardizedTests } from './standardized-tests.js';

export interface Student {
  id: string;
  identity: IdentityContext;
  academicDirection: AcademicDirection;
  schoolAcademics: SchoolAcademics;
  standardizedTests: StandardizedTests;
  activities: ActivitiesLeadership;
  financial: FinancialAndPreferences;
  collegeList: StudentCollege[];
  assessment: ProfileAssessment;
  meta: SystemMeta;
  timeline: MasterTimeline;
  actions: Action[];
  messages: Message[];
  agentRuns: AgentRun[];
  proposedCommands: ProposedCommand[];
  vocabularies: StudentVocabularies;
}
