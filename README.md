# 🎫 Ticket System

A full-stack ticket management system built with **NestJS** (Backend) and **Next.js** (Frontend), featuring real-time queue processing with **BullMQ**.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Queue System](#-queue-system)
- [Testing](#-testing)
- [Deployment](#-deployment)

## ✨ Features

### 🎯 Core Features

- **Ticket Management**: Create, read, update, delete tickets
- **Status Tracking**: OPEN → IN_PROGRESS → RESOLVED workflow
- **Priority Levels**: LOW, MEDIUM, HIGH priority system
- **Search & Filter**: Advanced filtering by status, priority, and text search
- **Pagination**: Efficient data pagination with customizable page sizes
- **Sorting**: Sort by creation date, update date, priority, status, or title

### 🔄 Queue System

- **Notification Queue**: Automatic notifications for new tickets
- **SLA Monitoring**: Service Level Agreement tracking with 15-minute delay
- **Exponential Backoff**: Retry mechanism for failed jobs
- **Job Management**: BullMQ-powered background processing

### 🎨 User Interface

- **Real-time Updates**: Live status updates
- **Modern UI**: Clean, intuitive design with Tailwind CSS
- **Form Validation**: Client-side and server-side validation

## 🛠 Tech Stack

### Backend

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma](https://www.prisma.io/) ORM
- **Queue**: [BullMQ](https://docs.bullmq.io/) - Redis-based queue system
- **Validation**: [class-validator](https://github.com/typestack/class-validator) & [class-transformer](https://github.com/typestack/class-transformer)
- **Testing**: [Jest](https://jestjs.io/) - JavaScript testing framework

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Forms**: [React Hook Form](https://react-hook-form.com/) - Performant forms
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation
- **HTTP Client**: Built-in fetch API

### Development Tools

- **Package Manager**: [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- **TypeScript**: Type-safe JavaScript
- **ESLint**: Code linting and formatting
- **Prisma Studio**: Database GUI

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ticket-system
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 3. Environment Setup

Create environment files:

```bash
# Backend environment
cd backend
cp .env
```

Edit `backend/.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Redis
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"

# Queue Configuration
QUEUE_NOTIFY_NAME="ticketNotify"
QUEUE_SLA_NAME="ticketSla"
QUEUE_NOTIFY_ATTEMPTS="3"
QUEUE_NOTIFY_DELAY_TIME="2000"
QUEUE_SLA_DELAY_TIME="900000"

# Server
PORT=3001
```

### 4. Database Setup

```bash
cd backend

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma db push

# (Optional) Seed the database
pnpm prisma db seed
```

### 5. Start Redis (Required for BullMQ)

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or install Redis locally
# macOS: brew install redis
# Ubuntu: sudo apt install redis-server
```

## ⚙️ Configuration

### Backend Configuration

The backend uses the following configuration:

- **Port**: 3001 (configurable via PORT env var)
- **Database**: SQLite file at `backend/prisma/dev.db`
- **Queue**: Redis connection (default: localhost:6379)

### Frontend Configuration

The frontend is configured to:

- **Port**: 3000 (Next.js default)
- **API Base URL**: `http://localhost:3001` (backend)
- **App Router**: Enabled (Next.js 15)

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the Backend**:

```bash
cd backend
pnpm run start:dev
```

2. **Start the Frontend** (in a new terminal):

```bash
cd frontend
pnpm run dev
```

3. **Access the Application**:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `cd backend && pnpm prisma studio`

### Production Mode

```bash
# Build and start backend
cd backend
pnpm run build
pnpm run start:prod

# Build and start frontend
cd frontend
pnpm run build
pnpm run start
```

## 📚 API Documentation

### Ticket Endpoints

| Method | Endpoint             | Description                        |
| ------ | -------------------- | ---------------------------------- |
| GET    | `/tickets`           | Get paginated tickets with filters |
| POST   | `/tickets`           | Create a new ticket                |
| GET    | `/tickets/:id`       | Get ticket by ID                   |
| PUT    | `/tickets/:id`       | Update ticket                      |
| DELETE | `/tickets/:id`       | Delete ticket                      |
| GET    | `/admin/:name/stats` | Application statistics             |

### Query Parameters

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10)
- `status`: Filter by status (OPEN, IN_PROGRESS, RESOLVED)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH)
- `search`: Search in title/description
- `sortBy`: Sort field (createdAt, updatedAt, priority, status, title)
- `sortOrder`: Sort direction (asc, desc)

### Example API Calls

```bash
# Get all tickets
curl http://localhost:3001/tickets

# Get tickets with filters
curl "http://localhost:3001/tickets?status=OPEN&priority=HIGH&page=1&pageSize=5"

# Create a ticket
curl -X POST http://localhost:3001/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Bug Report","description":"Application crashes on startup","priority":"HIGH"}'

# Admin: Get specific queue details
curl http://localhost:3001/admin/queues/ticketSla/stats
```

## 📁 Project Structure

```
ticket-system/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── tickets/        # Ticket module
│   │   ├── queues/         # BullMQ processors
│   │   ├── prisma.service.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   ├── test/              # Test files
│   └── package.json
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and types
│   └── package.json
└── README.md
```

## 🔄 Queue System

### Queue Architecture

The system uses **BullMQ** for background job processing:

1. **Notification Queue** (`ticketNotify`):

   - Triggers when a new ticket is created
   - Sends notifications (console log for demo)
   - Uses exponential backoff for retries

2. **SLA Queue** (`ticketSla`):
   - Monitors ticket resolution time
   - Delayed by 15 minutes (900,000ms)
   - Checks if ticket is resolved within SLA

### Queue Configuration

```typescript
// Notification Job
{
  jobId: `notify-${ticketId}`,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  }
}

// SLA Job
{
  jobId: `sla-${ticketId}`,
  delay: 900000, // 15 minutes
  removeOnComplete: true,
  removeOnFail: 50
}
```

### Monitoring Queues

```bash
# View queue status in Redis
redis-cli
> KEYS bull:ticketNotify:*
> KEYS bull:ticketSla:*

# Or use BullMQ Dashboard (if implemented)
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pnpm test

# Run specific test suites
pnpm test:tickets        # Ticket service tests
pnpm test:queue          # Queue processor tests
pnpm test:tickets-queue  # Combined tests

# Run tests with coverage
pnpm test:cov

# Run tests in watch mode
pnpm test:watch
```

### Test Structure

- **Unit Tests**: Service and controller logic
- **Queue Tests**: BullMQ processor functionality
- **Integration Tests**: API endpoint testing
- **Mock Data**: Comprehensive test fixtures

### Frontend Tests

```bash
cd frontend

# Run tests (if configured)
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 🚀 Deployment

### Backend Deployment

1. **Build the application**:

```bash
cd backend
pnpm run build
```

2. **Set production environment variables**:

```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
REDIS_URL="your-redis-url"
PORT=3001
```

3. **Deploy to your preferred platform** (Docker, Vercel, Railway, etc.)

### Frontend Deployment

1. **Build the application**:

```bash
cd frontend
pnpm run build
```

2. **Deploy to Vercel, Netlify, or your preferred platform**

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## 🔧 Development Commands

### Backend Commands

```bash
cd backend

# Development
pnpm run start:dev          # Start with hot reload
pnpm run build             # Build for production
pnpm run start:prod        # Start production build

# Database
pnpm prisma generate       # Generate Prisma client
pnpm prisma db push        # Push schema changes
pnpm prisma studio         # Open Prisma Studio
pnpm prisma migrate dev    # Create and apply migration

# Testing
pnpm test                  # Run all tests
pnpm test:watch           # Run tests in watch mode
pnpm test:cov             # Run tests with coverage
```

### Frontend Commands

```bash
cd frontend

# Development
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run start            # Start production server
pnpm run lint             # Run ESLint

# Type checking
pnpm run type-check       # Check TypeScript types
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Redis Connection Error**:

   - Ensure Redis is running: `redis-cli ping`
   - Check Redis URL in environment variables

2. **Database Connection Error**:

   - Run `pnpm prisma generate` and `pnpm prisma db push`
   - Check DATABASE_URL in .env file

3. **Port Already in Use**:

   - Kill process: `lsof -ti:3001 | xargs kill -9`
   - Or change PORT in .env file

4. **Module Resolution Error**:
   - Clear node_modules: `rm -rf node_modules && pnpm install`
   - Check TypeScript configuration

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Documentation](https://docs.nestjs.com/)
- Join our [Discord Community](https://discord.gg/your-server)

---

**Happy Coding! 🎉**

Built with ❤️ using NestJS, Next.js, and BullMQ.
