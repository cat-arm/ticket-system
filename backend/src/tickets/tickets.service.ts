import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import {
  CreateTicketDto,
  QueryTicketDto,
  UpdateTicketDto,
  Status,
  Priority,
} from './dto/ticket.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TicketsService {
  private notifyQueueName: string;
  private slaQueueName: string;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(process.env.QUEUE_NOTIFY_NAME || 'ticketNotify')
    private readonly notifyQueue: Queue,
    @InjectQueue(process.env.QUEUE_SLA_NAME || 'ticketSla')
    private readonly slaQueue: Queue,
    private readonly config: ConfigService,
  ) {
    this.notifyQueueName = this.config.get('QUEUE_NOTIFY_NAME', 'ticketNotify');
    this.slaQueueName = this.config.get('QUEUE_SLA_NAME', 'ticketSla');
  }

  private buildWhere(query: QueryTicketDto): Prisma.TicketWhereInput {
    const where: Prisma.TicketWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.search) {
      // case-sensitive when search
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    return where;
  }

  async list(query: QueryTicketDto) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.max(1, Math.min(100, Number(query.pageSize || 10)));
    const where = this.buildWhere(query);

    const orderBy = {
      [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(body: CreateTicketDto) {
    const newTicket = await this.prisma.ticket.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: Status.OPEN,
      },
    });

    // Enqueue: TicketNotifyJob
    const notifyJobId = `notify-${newTicket.id}`;
    await this.notifyQueue.add(
      'ticketNotify',
      {
        ticketId: newTicket.id,
        title: newTicket.title,
        priority: newTicket.priority,
      },
      {
        jobId: notifyJobId,
        attempts: Number(process.env.QUEUE_NOTIFY_ATTEMPTS),
        backoff: {
          type: 'exponential',
          delay: Number(process.env.QUEUE_NOTIFY_DELAY_TIME),
        },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );

    // Enqueue: TicketSlaJob delay 15 minute
    const slaJobId = `sla-${newTicket.id}`;
    await this.slaQueue.add(
      'ticketSla',
      { ticketId: newTicket.id },
      {
        jobId: slaJobId,
        delay: Number(process.env.QUEUE_SLA_DELAY_TIME),
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );
    return newTicket;
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return ticket;
  }

  private async removeSlaJob(ticketId: string) {
    const jobId = `sla:${ticketId}`;
    const job = await this.slaQueue.getJob(jobId);

    if (job) {
      await this.slaQueue.remove(jobId);
    }
  }

  async update(id: string, body: UpdateTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const updateTicket = await this.prisma.ticket.update({
      where: { id },
      data: {
        title: body.title ?? ticket.title,
        description: body.description ?? ticket.description,
        priority: (body.priority as Priority) ?? ticket.priority,
        status: (body.status as Status) ?? ticket.status,
      },
    });

    // if status change to RESOLVED then remove from SLA job
    if (body.status && body.status === Status.RESOLVED) {
      await this.removeSlaJob(id);
    }

    return updateTicket;
  }

  async remove(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    // remove SLA job if it still there
    await this.removeSlaJob(id);

    await this.prisma.ticket.delete({ where: { id } });
    return { ok: true };
  }
}
