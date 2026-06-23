import { describe, expect, it } from 'vitest';
import { getPrismaClient } from './client.js';

describe('getPrismaClient', () => {
  it('returns the same client instance on repeated calls', () => {
    expect(getPrismaClient()).toBe(getPrismaClient());
  });
});
