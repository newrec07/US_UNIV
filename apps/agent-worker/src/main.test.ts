import { describe, expect, it } from 'vitest';
import { bootstrap } from './main.js';

describe('bootstrap', () => {
  it('starts and stops the worker application context without throwing', async () => {
    await expect(bootstrap()).resolves.toBeUndefined();
  });
});
