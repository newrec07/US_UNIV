export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent';
}
