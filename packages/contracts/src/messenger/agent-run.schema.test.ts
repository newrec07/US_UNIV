import { describe, expect, it } from 'vitest';
import { AgentRunSchema } from './agent-run.schema.js';

const queuedRun = {
  id: 'run-1',
  triggeredByMessageId: 'msg-1',
  status: 'queued' as const,
  modelUsed: 'claude-sonnet-4-6',
  promptVersion: '2026-06-01',
  dataVersionAtStart: 'v42',
  createdAt: '2026-06-01T00:00:00.000Z',
};

describe('AgentRunSchema', () => {
  it('accepts a freshly queued run without lifecycle timestamps', () => {
    expect(AgentRunSchema.safeParse(queuedRun).success).toBe(true);
  });

  it('accepts a completed run with all optional fields filled in', () => {
    const result = AgentRunSchema.safeParse({
      ...queuedRun,
      status: 'completed',
      startedAt: '2026-06-01T00:00:01.000Z',
      completedAt: '2026-06-01T00:00:05.000Z',
      resultMessageId: 'msg-2',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown status value', () => {
    const result = AgentRunSchema.safeParse({ ...queuedRun, status: 'cancelled' });
    expect(result.success).toBe(false);
  });

  it('rejects a run missing dataVersionAtStart', () => {
    const { dataVersionAtStart, ...withoutDataVersion } = queuedRun;
    expect(AgentRunSchema.safeParse(withoutDataVersion).success).toBe(false);
  });
});
