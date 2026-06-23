import type { College } from '../college/college.js';
import type { Student } from '../student/student.js';
import type { AdmissionsCalendar } from '../timeline/calendar.js';
import type { User } from './user.js';

export interface System {
  students: Student[];
  colleges: College[];
  users: User[];
  calendars: AdmissionsCalendar[];
}
