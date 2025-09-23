'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TicketsListResponse } from '@/lib/types';
import { deleteTicket } from '@/lib/api';
import { useState } from 'react';

export default function TicketTable({ data }: { data: TicketsListResponse }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Pagination Delete Functional
  const gotoPage = (page: number) => {
    const u = new URLSearchParams(Array.from(sp.entries()));
    u.set('page', String(page));
    router.push(`/tickets?${u.toString()}`);
  };

  return (
    <div className="rounded-xl border bg-white">
      <table className="w-full table-fixed">
        <thead className="border-b bg-gray-50 text-left text-sm">
          <tr>
            <th className="p-3 w-[40%] text-black font-semibold">Title</th>
            <th className="p-3 w-[12.5%] text-black font-semibold">Priority</th>
            <th className="p-3 w-[12.5%] text-black font-semibold">Status</th>
            <th className="p-3 w-[20%] text-black font-semibold">Created</th>
            <th className="p-3 w-[15%] text-black font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.items.length === 0 && (
            <tr><td colSpan={5} className="p-6 text-center text-black">No tickets found.</td></tr>
          )}
          {data.items.map(t => (
            <tr key={t.id} className="border-b last:border-0 text-black">
              <td className="p-3">
                <Link href={`/tickets/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
                <div className="text-xs text-gray-500 line-clamp-1">{t.description}</div>
              </td>
              <td className="p-3">{t.priority}</td>
              <td className="p-3">{t.status}</td>
              <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Link href={`/tickets/${t.id}`} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">View</Link>
                  {/* Delete  v */}
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this ticket?')) return;
                      try {
                        setLoadingId(t.id);
                        await deleteTicket(t.id);
                        router.refresh();
                      } finally {
                        setLoadingId(null);
                      }
                    }}
                    disabled={loadingId === t.id}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50 text-red-500"
                  >
                    {loadingId === t.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        {/* Pagination Controls  */}
        {data.totalPages > 1 && (
          <tfoot>
            <tr>
              <td colSpan={5} className="p-3">
                <div className="flex items-center justify-between text-black text-sm">
                  <div>Page <strong>{data.page}</strong> / {data.totalPages} • {data.total} items</div>
                  <div className="flex gap-2">
                    <button onClick={() => gotoPage(Math.max(1, data.page - 1))} disabled={data.page <= 1} className="rounded border px-3 py-1 disabled:opacity-50">Prev</button>
                    <button onClick={() => gotoPage(Math.min(data.totalPages, data.page + 1))} disabled={data.page >= data.totalPages} className="rounded border px-3 py-1 disabled:opacity-50">Next</button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
