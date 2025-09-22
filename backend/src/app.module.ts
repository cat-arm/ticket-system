// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from './prisma.service';
import { TicketsModule } from './tickets/tickets.module';
import { QueuesModule } from './queues/queues.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      // bullMQQ connection with redis
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.get('REDIS_HOST', '127.0.0.1'),
          port: parseInt(cfg.get('REDIS_PORT', '6379'), 10),
        },
      }),
    }),
    TicketsModule,
    QueuesModule,
    AdminModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
