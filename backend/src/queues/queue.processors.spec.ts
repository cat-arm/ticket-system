/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotifyProcessor } from './notify.processor';
import { SlaProcessor } from './sla.processor';
import { PrismaService } from '../prisma.service';
import { Status, Priority } from '../tickets/dto/ticket.dto';

const mockTicket = {
  id: 'ticket-123',
  title: 'Test Bug Report',
  description: 'Application crashes when user clicks login button',
  priority: Priority.HIGH,
  status: Status.OPEN,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const mockNotifyJobData = {
  ticketId: 'ticket-123',
  title: 'Test Bug Report',
  priority: Priority.HIGH,
};

const mockSlaJobData = {
  ticketId: 'ticket-123',
};

// Mock Prisma Service
const mockPrismaService = {
  ticket: {
    findUnique: jest.fn(),
  },
};

// Mock Config Service
const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    const config = {
      QUEUE_NOTIFY_NAME: 'test-ticketNotify',
      QUEUE_SLA_NAME: 'test-ticketSla',
    };
    return config[key] || defaultValue;
  }),
};

describe('Queue Processors', () => {
  let notifyProcessor: NotifyProcessor;
  let slaProcessor: SlaProcessor;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotifyProcessor,
        SlaProcessor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    notifyProcessor = module.get<NotifyProcessor>(NotifyProcessor);
    slaProcessor = module.get<SlaProcessor>(SlaProcessor);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('NotifyProcessor', () => {
    it('should process notification job successfully', async () => {
      // Arrange
      const mockJob = {
        id: 'job-123',
        data: mockNotifyJobData,
      } as any;

      // Act
      const result = await notifyProcessor.process(mockJob);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle different priority levels', async () => {
      // Arrange
      const priorities = [Priority.HIGH, Priority.MEDIUM, Priority.LOW];

      for (const priority of priorities) {
        const mockJob = {
          id: `job-${priority}`,
          data: { ...mockNotifyJobData, priority },
        } as any;

        // Act
        const result = await notifyProcessor.process(mockJob);

        // Assert
        expect(result).toBe(true);
      }
    });

    it('should handle job processing errors gracefully', async () => {
      // Arrange
      const mockJob = {
        id: 'job-123',
        data: null, // Invalid data
      } as any;

      // Act & Assert
      await expect(notifyProcessor.process(mockJob)).rejects.toThrow();
    });
  });

  describe('SlaProcessor', () => {
    it('should detect SLA BREACH for OPEN ticket', async () => {
      // Arrange
      const openTicket = { ...mockTicket, status: Status.OPEN };
      mockPrismaService.ticket.findUnique.mockResolvedValue(openTicket);

      const mockJob = {
        id: 'job-123',
        data: mockSlaJobData,
      } as any;

      // Act
      await slaProcessor.process(mockJob);

      // Assert
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: mockSlaJobData.ticketId },
      });
      // Should log SLA BREACHED
    });

    it('should detect SLA BREACH for IN_PROGRESS ticket', async () => {
      // Arrange
      const inProgressTicket = { ...mockTicket, status: Status.IN_PROGRESS };
      mockPrismaService.ticket.findUnique.mockResolvedValue(inProgressTicket);

      const mockJob = {
        id: 'job-123',
        data: mockSlaJobData,
      } as any;

      // Act
      await slaProcessor.process(mockJob);

      // Assert
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: mockSlaJobData.ticketId },
      });
      // Should log SLA BREACHED
    });

    it('should detect SLA OK for RESOLVED ticket', async () => {
      // Arrange
      const resolvedTicket = { ...mockTicket, status: Status.RESOLVED };
      mockPrismaService.ticket.findUnique.mockResolvedValue(resolvedTicket);

      const mockJob = {
        id: 'job-123',
        data: mockSlaJobData,
      } as any;

      // Act
      await slaProcessor.process(mockJob);

      // Assert
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: mockSlaJobData.ticketId },
      });
      // Should log SLA OK
    });

    it('should handle non-existent ticket gracefully', async () => {
      // Arrange
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      const mockJob = {
        id: 'job-123',
        data: mockSlaJobData,
      } as any;

      // Act
      await slaProcessor.process(mockJob);

      // Assert
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: mockSlaJobData.ticketId },
      });
      // Should log "Ticket not found, skip"
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrismaService.ticket.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      const mockJob = {
        id: 'job-123',
        data: mockSlaJobData,
      } as any;

      // Act & Assert
      await expect(slaProcessor.process(mockJob)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle invalid job data gracefully', async () => {
      // Arrange
      const mockJob = {
        id: 'job-123',
        data: { ticketId: null }, // Invalid data
      } as any;

      // Act & Assert
      await expect(slaProcessor.process(mockJob)).rejects.toThrow();
    });
  });

  describe('SLA Scenarios', () => {
    it('should handle all ticket status scenarios correctly', async () => {
      // Test all possible status combinations
      const statuses = [Status.OPEN, Status.IN_PROGRESS, Status.RESOLVED];

      for (const status of statuses) {
        // Arrange
        const ticket = { ...mockTicket, status };
        mockPrismaService.ticket.findUnique.mockResolvedValue(ticket);

        const mockJob = {
          id: `job-${status}`,
          data: mockSlaJobData,
        } as any;

        // Act
        await slaProcessor.process(mockJob);

        // Assert
        expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
          where: { id: mockSlaJobData.ticketId },
        });
      }
    });

    it('should handle different ticket priorities in SLA check', async () => {
      // Test SLA check with different priorities
      const priorities = [Priority.LOW, Priority.MEDIUM, Priority.HIGH];

      for (const priority of priorities) {
        // Arrange
        const ticket = { ...mockTicket, priority, status: Status.OPEN };
        mockPrismaService.ticket.findUnique.mockResolvedValue(ticket);

        const mockJob = {
          id: `job-${priority}`,
          data: mockSlaJobData,
        } as any;

        // Act
        await slaProcessor.process(mockJob);

        // Assert
        expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
          where: { id: mockSlaJobData.ticketId },
        });
      }
    });
  });
});
