import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AdminController],
})
export class AdminModule {}
