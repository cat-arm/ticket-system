// backend/src/queues/sla.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { Status } from 'src/tickets/dto/ticket.dto';

@Processor(process.env.QUEUE_SLA_NAME || 'ticketSla')
export class SlaProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    const { ticketId } = job.data as { ticketId: string };
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      console.log(`⏱️ [SLA] Ticket not found (ticketId=${ticketId}), skip`);
      return;
    }
    if (ticket.status !== Status.RESOLVED) {
      console.log(
        `⏱️ [SLA] BREACHED: ticketId=${ticketId} status=${ticket.status}`,
      );
    } else {
      console.log(`⏱️ [SLA] OK: ticketId=${ticketId} already RESOLVED`);
    }
  }
}
