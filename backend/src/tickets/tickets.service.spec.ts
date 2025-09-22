/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma.service';
import {
  CreateTicketDto,
  QueryTicketDto,
  Status,
  Priority,
} from './dto/ticket.dto';

// Mock data
const mockTicket = {
  id: 'ticket-123',
  title: 'Test Bug Report',
  description: 'Application crashes when user clicks login button',
  priority: Priority.HIGH,
  status: Status.OPEN,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const mockCreateTicketDto: CreateTicketDto = {
  title: 'Test Bug Report',
  description: 'Application crashes when user clicks login button',
  priority: Priority.HIGH,
};

// Mock Prisma Service
const mockPrismaService = {
  ticket: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock Queue
const mockQueue = {
  add: jest.fn(),
};

describe('TicketsService', () => {
  let service: TicketsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;
  let notifyQueue: any;
  let slaQueue: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                QUEUE_NOTIFY_NAME: 'ticketNotify',
                QUEUE_SLA_NAME: 'ticketSla',
                QUEUE_NOTIFY_ATTEMPTS: '3',
                QUEUE_NOTIFY_DELAY_TIME: '1000',
                QUEUE_SLA_DELAY_TIME: '900000', // 15 minutes
              };
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return config[key] || defaultValue;
            }),
          },
        },
        {
          provide: getQueueToken('test-ticketNotify'),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken('test-ticketSla'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notifyQueue = module.get(getQueueToken('test-ticketNotify'));
    slaQueue = module.get(getQueueToken('test-ticketSla'));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create function', () => {
    it('should create ticket and enqueue both notify and SLA jobs', async () => {
      // Arrange
      mockPrismaService.ticket.create.mockResolvedValue(mockTicket);
      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      // Act
      const result = await service.create(mockCreateTicketDto);

      // Assert
      expect(result).toEqual(mockTicket);

      // Verify database call
      expect(mockPrismaService.ticket.create).toHaveBeenCalledWith({
        data: {
          title: mockCreateTicketDto.title,
          description: mockCreateTicketDto.description,
          priority: mockCreateTicketDto.priority,
          status: Status.OPEN,
        },
      });

      // Verify notify job

      expect(notifyQueue.add).toHaveBeenCalledWith(
        'ticketNotify',
        {
          ticketId: mockTicket.id,
          title: mockTicket.title,
          priority: mockTicket.priority,
        },
        {
          jobId: `notify-${mockTicket.id}`,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );

      // Verify SLA job

      expect(slaQueue.add).toHaveBeenCalledWith(
        'ticketSla',
        { ticketId: mockTicket.id },
        {
          jobId: `sla-${mockTicket.id}`,
          delay: 900000, // 15 minutes
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );
    });

    it('should handle queue errors gracefully', async () => {
      // Arrange
      mockPrismaService.ticket.create.mockResolvedValue(mockTicket);
      mockQueue.add.mockRejectedValue(new Error('Queue error'));

      // Act & Assert
      await expect(service.create(mockCreateTicketDto)).rejects.toThrow(
        'Queue error',
      );
    });
  });

  describe('buildWhere function', () => {
    it('should build where clause with status filter', () => {
      // Arrange
      const query: QueryTicketDto = { status: Status.OPEN };

      // Act
      const where = (service as any).buildWhere(query);

      // Assert
      expect(where).toEqual({ status: Status.OPEN });
    });

    it('should build where clause with priority filter', () => {
      // Arrange
      const query: QueryTicketDto = { priority: Priority.HIGH };

      // Act
      const where = (service as any).buildWhere(query);

      // Assert
      expect(where).toEqual({ priority: Priority.HIGH });
    });

    it('should build where clause with search filter', () => {
      // Arrange
      const query: QueryTicketDto = { search: 'bug' };

      // Act
      const where = (service as any).buildWhere(query);

      // Assert
      expect(where).toEqual({
        OR: [
          { title: { contains: 'bug' } },
          { description: { contains: 'bug' } },
        ],
      });
    });

    it('should build where clause with multiple filters', () => {
      // Arrange
      const query: QueryTicketDto = {
        status: Status.OPEN,
        priority: Priority.HIGH,
        search: 'critical',
      };

      // Act
      const where = (service as any).buildWhere(query);

      // Assert
      expect(where).toEqual({
        status: Status.OPEN,
        priority: Priority.HIGH,
        OR: [
          { title: { contains: 'critical' } },
          { description: { contains: 'critical' } },
        ],
      });
    });

    it('should return empty where clause for empty query', () => {
      // Arrange
      const query: QueryTicketDto = {};

      // Act
      const where = (service as any).buildWhere(query);

      // Assert
      expect(where).toEqual({});
    });
  });

  describe('list function', () => {
    it('should return paginated tickets with correct structure', async () => {
      // Arrange
      const mockTickets = [mockTicket];
      const mockCount = 1;
      mockPrismaService.$transaction.mockResolvedValue([
        mockTickets,
        mockCount,
      ]);

      // Act
      const result = await service.list({});

      // Assert
      expect(result).toEqual({
        items: mockTickets,
        page: 1,
        pageSize: 10,
        total: mockCount,
        totalPages: 1,
      });
    });

    it('should handle custom pagination parameters', async () => {
      // Arrange
      const mockTickets = [mockTicket];
      const mockCount = 25;
      mockPrismaService.$transaction.mockResolvedValue([
        mockTickets,
        mockCount,
      ]);
      const queryDto = { page: 2, pageSize: 5 };

      // Act
      const result = await service.list(queryDto);

      // Assert
      expect(result).toEqual({
        items: mockTickets,
        page: 2,
        pageSize: 5,
        total: mockCount,
        totalPages: 5,
      });
    });

    it('should validate and clamp page and pageSize limits', async () => {
      // Arrange
      const mockTickets = [mockTicket];
      const mockCount = 1;
      mockPrismaService.$transaction.mockResolvedValue([
        mockTickets,
        mockCount,
      ]);
      const queryDto = { page: -1, pageSize: 200 }; // Invalid values

      // Act
      const result = await service.list(queryDto);

      // Assert
      expect(result.page).toBe(1); // Should be clamped to 1
      expect(result.pageSize).toBe(100); // Should be clamped to 100
    });
  });
});
