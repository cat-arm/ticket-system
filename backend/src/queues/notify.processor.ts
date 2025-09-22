import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { Priority } from 'src/tickets/dto/ticket.dto';

interface NotifyJobData {
  ticketId: string;
  title: string;
  priority: Priority;
}

@Processor(process.env.QUEUE_NOTIFY_NAME || 'ticketNotify')
export class NotifyProcessor extends WorkerHost {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async process(job: Job<NotifyJobData>): Promise<boolean> {
    const { ticketId, title, priority } = job.data;
    console.log(
      `🔔 [Notify] ticketId=${ticketId} title="${title}" priority=${priority} (jobId=${job.id})`,
    );
    await Promise.resolve();
    return true;
  }
}
