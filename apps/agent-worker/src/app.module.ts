import { Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service.js';

@Module({
  providers: [RedisService],
})
export class AppModule {}
