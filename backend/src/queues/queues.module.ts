import { Module } from '@nestjs/common';
import { NotifyProcessor } from './notify.processor';
import { SlaProcessor } from './sla.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueueAsync(
      {
        inject: [ConfigService],
        name: process.env.QUEUE_NOTIFY_NAME || 'ticketNotify',
        useFactory: () => ({}),
      },
      {
        inject: [ConfigService],
        name: process.env.QUEUE_SLA_NAME || 'ticketSla',
        useFactory: () => ({}),
      },
    ),
  ],
  providers: [NotifyProcessor, SlaProcessor, PrismaService],
  exports: [],
})
export class QueuesModule {}
