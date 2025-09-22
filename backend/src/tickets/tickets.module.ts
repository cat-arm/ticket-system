import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from 'src/prisma.service';

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
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
  exports: [TicketsService],
})
export class TicketsModule {}
