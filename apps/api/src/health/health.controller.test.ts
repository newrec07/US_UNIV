import { describe, expect, it } from 'vitest';
import { DatabaseService } from '../database/database.service.js';
import { RedisService } from '../redis/redis.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports database and redis connectivity', async () => {
    const databaseService = { checkConnection: async () => true } as DatabaseService;
    const redisService = { checkConnection: async () => true } as RedisService;
    const controller = new HealthController(databaseService, redisService);

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(result.redis).toBe('connected');
  });

  it('reports unavailable dependencies without throwing', async () => {
    const databaseService = { checkConnection: async () => false } as DatabaseService;
    const redisService = { checkConnection: async () => false } as RedisService;
    const controller = new HealthController(databaseService, redisService);

    const result = await controller.check();

    expect(result.database).toBe('unavailable');
    expect(result.redis).toBe('unavailable');
  });
});
