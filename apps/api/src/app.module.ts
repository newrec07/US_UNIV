import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service.js';
import { HealthController } from './health/health.controller.js';
import { RedisService } from './redis/redis.service.js';

@Module({
  controllers: [HealthController],
  providers: [DatabaseService, RedisService],
})
export class AppModule {}
