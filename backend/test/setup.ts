// Test setup file
import 'reflect-metadata';

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.QUEUE_NOTIFY_NAME = 'test-ticketNotify';
process.env.QUEUE_SLA_NAME = 'test-ticketSla';
process.env.QUEUE_NOTIFY_ATTEMPTS = '3';
process.env.QUEUE_NOTIFY_DELAY_TIME = '1000';
process.env.QUEUE_SLA_DELAY_TIME = '900000';
