import { describe, expect, it } from 'vitest';
import { DatabaseService } from './database.service.js';

describe('DatabaseService', () => {
  it('resolves to a boolean instead of throwing when the database is unreachable', async () => {
    const service = new DatabaseService();
    await expect(service.checkConnection()).resolves.toBeTypeOf('boolean');
  });
});
