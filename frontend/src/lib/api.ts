import { TicketsQuery, TicketsListResponse, Ticket, Priority, Status } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function qs(params: Record<string, any>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') u.set(k, String(v));
  });
  return u.toString();
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    let detail: any;
    try { detail = await res.json(); } catch {}
    throw new Error(detail?.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listTickets(query: TicketsQuery): Promise<TicketsListResponse> {
  const q = qs(query);
  return http<TicketsListResponse>(`/tickets${q ? `?${q}` : ''}`);
}

export async function getTicket(id: string): Promise<Ticket> {
  return http<Ticket>(`/tickets/${id}`);
}

export async function createTicket(data: { title: string; description: string; priority: Priority; }): Promise<Ticket> {
  return http<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTicket(id: string, data: Partial<{ title: string; description: string; priority: Priority; status: Status; }>): Promise<Ticket> {
  return http<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteTicket(id: string): Promise<{ ok: true }> {
  return http<{ ok: true }>(`/tickets/${id}`, { method: 'DELETE' });
}
