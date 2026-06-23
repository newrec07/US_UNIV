import { describe, expect, it } from 'vitest';
import { convertGpaToUs } from './gpa-conversion.js';

describe('convertGpaToUs', () => {
  it('does not pass an unsupported grading system through as a US GPA', () => {
    expect(convertGpaToUs(88, 'UNREVIEWED_SYSTEM')).toMatchObject({
      estimatedUs: null,
      confidence: 'low',
      method: 'unsupported_system',
    });
  });
});
