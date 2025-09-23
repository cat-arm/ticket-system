'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Status, Priority, TicketsQuery } from '@/lib/types';
import { useCallback, useMemo } from 'react';

const statuses: Status[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export default function Filters({ initial }: { initial: TicketsQuery }) {
  const router = useRouter();
  const sp = useSearchParams();

  // current state
  const current = useMemo(() => {
    const obj: TicketsQuery = {
      status: (sp.get('status') as Status) || initial.status,
      priority: (sp.get('priority') as Priority) || initial.priority,
      search: sp.get('search') || initial.search,
      page: Number(sp.get('page') || initial.page || 1),
      pageSize: Number(sp.get('pageSize') || initial.pageSize || 10),
      sortBy: (sp.get('sortBy') as any) || initial.sortBy || 'createdAt',
      sortOrder: (sp.get('sortOrder') as any) || initial.sortOrder || 'desc',
    };
    return obj;
  }, [sp, initial]);

  // update url parameters
  const setParam = useCallback((key: string, value?: string) => {
    const u = new URLSearchParams(Array.from(sp.entries()));
    if (!value || value === 'ALL') u.delete(key); else u.set(key, value);
    u.set('page', '1');
    router.push(`/tickets?${u.toString()}`);
  }, [router, sp]);

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-20 md:items-end">
      <div className="md:col-span-6">
        <label className="block text-sm font-medium mb-1">Search</label>
        {/* Search filter for title / description */}
        <input
          defaultValue={current.search || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value);
          }}
          placeholder="title/description..."
          className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="md:col-span-3">
        <label className="block text-sm font-medium mb-1">Status</label>
        {/* Status filter */}
        <select
          value={current.status || 'ALL'}
          onChange={(e) => setParam('status', e.target.value === 'ALL' ? undefined : e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm text-left"
        >
          <option value="ALL">All</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="md:col-span-3">
        <label className="block text-sm font-medium mb-1">Priority</label>
        {/* Priority filter */}
        <select
          value={current.priority || 'ALL'}
          onChange={(e) => setParam('priority', e.target.value === 'ALL' ? undefined : e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm text-left"
        >
          <option value="ALL">All</option>
          {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="md:col-span-3">
        <label className="block text-sm font-medium mb-1">Sort By</label>
        {/* Sort By value */}
        <select
          value={current.sortBy}
          onChange={(e) => setParam('sortBy', e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm text-left"
        >
          <option value="createdAt">createdAt</option>
          <option value="updatedAt">updatedAt</option>
          <option value="priority">priority</option>
          <option value="status">status</option>
          <option value="title">title</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Order</label>
        {/* Sort Order */}
        <button
          onClick={() => setParam('sortOrder', current.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="w-full h-10 rounded-lg border px-3 py-2 text-sm"
        >
          {current.sortOrder === 'asc' ? 'ASC' : 'DESC'}
        </button>
      </div>
      <div className="md:col-span-3">
        <label className="block text-sm font-medium mb-1">Size</label>
        {/* Page Size */}
        <select
          value={current.pageSize || 10}
          onChange={(e) => setParam('pageSize', e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm text-left"
        >
          {/* Page Size: 5, 10 items per page */}
          {[5,10].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>
    </div>
  );
}
