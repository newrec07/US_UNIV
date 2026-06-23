import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { RedisService } from '../redis/redis.service.js';

interface HealthStatus {
  status: 'ok';
  database: 'connected' | 'unavailable';
  redis: 'connected' | 'unavailable';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const [databaseConnected, redisConnected] = await Promise.all([
      this.databaseService.checkConnection(),
      this.redisService.checkConnection(),
    ]);
    return {
      status: 'ok',
      database: databaseConnected ? 'connected' : 'unavailable',
      redis: redisConnected ? 'connected' : 'unavailable',
      timestamp: new Date().toISOString(),
    };
  }
}
