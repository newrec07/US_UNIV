import 'reflect-metadata';
import { fileURLToPath } from 'node:url';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { RedisService } from './redis/redis.service.js';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('AgentWorker');
  const redisConnected = await app.get(RedisService).checkConnection();
  logger.log(`Agent worker bootstrapped (redis: ${redisConnected ? 'connected' : 'unavailable'})`);
  await app.close();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  void bootstrap();
}
