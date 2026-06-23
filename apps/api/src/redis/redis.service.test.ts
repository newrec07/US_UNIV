import { describe, expect, it } from 'vitest';
import { RedisService } from './redis.service.js';

describe('RedisService', () => {
  it('resolves to a boolean instead of throwing when redis is unreachable', async () => {
    const service = new RedisService();
    await expect(service.checkConnection()).resolves.toBeTypeOf('boolean');
    await service.onModuleDestroy();
  });
});
