export function computeAdmissionsCycle(graduationYear: number): string {
  return `${graduationYear - 1}-${graduationYear}`;
}
