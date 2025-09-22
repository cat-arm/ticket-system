// backend/src/admin/admin.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Controller('admin')
export class AdminController {
  constructor(private readonly config: ConfigService) {}

  @Get('queues/:name/stats')
  async stats(@Param('name') name: string) {
    const connection: { host: string; port: number } = {
      host: this.config.get<string>('REDIS_HOST', '127.0.0.1'),
      port: parseInt(this.config.get<string>('REDIS_PORT', '6379'), 10),
    };
    const queue = new Queue(name, { connection });
    const counts = await queue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
      'paused',
    );
    await queue.close();
    return {
      name,
      ...counts,
    };
  }
}
