import { Module } from '@nestjs/common';
import { NotifyProcessor } from './notify.processor';
import { SlaProcessor } from './sla.processor';

@Module({
  providers: [NotifyProcessor, SlaProcessor],
})
export class QueuesModule {}
