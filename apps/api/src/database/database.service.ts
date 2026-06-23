import { Injectable } from '@nestjs/common';
import { getPrismaClient } from '@admissions/database';

@Injectable()
export class DatabaseService {
  async checkConnection(): Promise<boolean> {
    try {
      await getPrismaClient().$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
