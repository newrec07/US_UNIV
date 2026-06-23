import { describe, expect, it } from 'vitest';
import { computeCompleteness, type StudentDraft } from './completeness.js';

function levelOf(student: StudentDraft, section: string): string | undefined {
  return computeCompleteness(student).find((entry) => entry.section === section)?.level;
}

describe('computeCompleteness — identity', () => {
  it('is empty without a legal name or graduation year', () => {
    expect(levelOf({}, 'identity')).toBe('empty');
  });

  it('is partial once named but missing residency or schools', () => {
    expect(levelOf({ identity: { legalName: 'Jane Doe', graduationYear: 2027 } }, 'identity')).toBe(
      'partial',
    );
  });

  it('is complete once residency, citizenship, and schools are present', () => {
    expect(
      levelOf(
        {
          identity: {
            legalName: 'Jane Doe',
            graduationYear: 2027,
            residencyStatus: 'US_PERMANENT_RESIDENT',
            citizenships: ['NZ'],
            schools: [
              { id: 's1', name: 'Test High', country: 'NZ', curriculum: 'NZ', isCurrent: true },
            ],
          },
        },
        'identity',
      ),
    ).toBe('complete');
  });
});

describe('computeCompleteness — schoolAcademics', () => {
  it('is empty with no academic records', () => {
    expect(levelOf({}, 'schoolAcademics')).toBe('empty');
  });

  it('is partial with a record but no terms', () => {
    expect(
      levelOf(
        { schoolAcademics: { records: [{ schoolId: 's1', gradingSystem: 'NCEA', terms: [] }] } },
        'schoolAcademics',
      ),
    ).toBe('partial');
  });

  it('is sufficient with terms but no GPA on record', () => {
    expect(
      levelOf(
        {
          schoolAcademics: {
            records: [
              {
                schoolId: 's1',
                gradingSystem: 'NCEA',
                terms: [{ id: 't1', label: 'Term 1', at: '2026-01-01', courses: [] }],
              },
            ],
          },
        },
        'schoolAcademics',
      ),
    ).toBe('sufficient');
  });

  it('is complete once a cumulative GPA is recorded', () => {
    expect(
      levelOf(
        {
          schoolAcademics: {
            records: [
              {
                schoolId: 's1',
                gradingSystem: 'NCEA',
                terms: [{ id: 't1', label: 'Term 1', at: '2026-01-01', courses: [] }],
              },
            ],
            cumulativeGpa: { reported: 3.8 },
          },
        },
        'schoolAcademics',
      ),
    ).toBe('complete');
  });
});

describe('computeCompleteness — activities', () => {
  it('scales from empty to complete with activity count', () => {
    expect(levelOf({}, 'activities')).toBe('empty');
    expect(
      levelOf({ activities: { activities: [{} as never], competitions: [] } }, 'activities'),
    ).toBe('partial');
    expect(
      levelOf(
        { activities: { activities: [{}, {}, {}] as never[], competitions: [] } },
        'activities',
      ),
    ).toBe('sufficient');
    expect(
      levelOf(
        { activities: { activities: [{}, {}, {}, {}, {}, {}] as never[], competitions: [] } },
        'activities',
      ),
    ).toBe('complete');
  });
});

describe('computeCompleteness — financial', () => {
  it('is empty until needsAid is set', () => {
    expect(levelOf({}, 'financial')).toBe('empty');
  });

  it('is partial once needsAid is known but no household is recorded', () => {
    expect(
      levelOf(
        {
          financial: {
            financialProfile: {
              needsAid: true,
              willFileFAFSA: true,
              households: [],
              dataConfidence: 'parent_reported',
            },
          },
        },
        'financial',
      ),
    ).toBe('partial');
  });

  it('is sufficient with a household but no SAI estimate yet', () => {
    expect(
      levelOf(
        {
          financial: {
            financialProfile: {
              needsAid: true,
              willFileFAFSA: true,
              households: [{ id: 'h1', type: 'primary' }],
              dataConfidence: 'parent_reported',
            },
          },
        },
        'financial',
      ),
    ).toBe('sufficient');
  });

  it('is complete once an SAI estimate exists', () => {
    expect(
      levelOf(
        {
          financial: {
            financialProfile: {
              needsAid: true,
              willFileFAFSA: true,
              households: [{ id: 'h1', type: 'primary' }],
              estimatedSAI: 12000,
              dataConfidence: 'rough_estimate',
            },
          },
        },
        'financial',
      ),
    ).toBe('complete');
  });
});

describe('computeCompleteness — blocksAssessment', () => {
  it('flags identity, schoolAcademics, standardizedTests, and financial as assessment blockers', () => {
    const result = computeCompleteness({});
    const blockers = result.filter((entry) => entry.blocksAssessment).map((entry) => entry.section);
    expect(blockers).toEqual(['identity', 'schoolAcademics', 'standardizedTests', 'financial']);
  });
});
