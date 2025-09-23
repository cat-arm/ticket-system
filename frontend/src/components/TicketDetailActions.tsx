'use client';

import { Ticket, Status } from '@/lib/types';
import { updateTicket, deleteTicket } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import TicketForm from './TicketForm';

const statuses: Status[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

export default function TicketDetailActions({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(ticket.status);

  // update status
  async function saveStatus() {
    try {
      setSaving(true);
      await updateTicket(ticket.id, { status });
      router.refresh();
      router.push('/tickets');
    } catch (e: any) {
      alert(e.message || 'Error');
    } finally {
      setSaving(false);
    }
  }

  // remove ticket
  async function remove() {
    if (!confirm('Delete this ticket?')) return;
    await deleteTicket(ticket.id);
    router.push('/tickets');
  }

  return ( 
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-3 font-semibold text-black">Update Status</h3>
        <div className="flex items-center gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="rounded border px-3 py-2 text-black">
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={saveStatus} disabled={saving} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 text-black">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={remove} className="rounded border px-4 py-2 text-black">Delete</button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 text-black">
        <h3 className="mb-3 font-semibold text-black">Edit Ticket</h3>
        <TicketForm mode="edit" initial={ticket} />
      </div>
    </div>
  );
}
