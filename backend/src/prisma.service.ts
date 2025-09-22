// connect priama with nest
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // open connection
  async onModuleInit() {
    await this.$connect();
  }

  // close connection
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
