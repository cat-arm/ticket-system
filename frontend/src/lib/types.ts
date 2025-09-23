export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface TicketsQuery {
  status?: Status;
  priority?: Priority;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface TicketsListResponse {
  items: Ticket[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}