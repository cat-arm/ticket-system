import { getTicket } from '@/lib/api';
import TicketDetailActions from '@/components/TicketDetailActions';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicket(id);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 text-black">
        <h2 className="mb-2 text-xl font-semibold text-black">{ticket.title}</h2>
        <div className="text-sm text-gray-600">ID: {ticket.id}</div>
        <div className="mt-3 whitespace-pre-wrap text-black">{ticket.description}</div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div><span className="text-gray-500">Priority:</span> <strong>{ticket.priority}</strong></div>
          <div><span className="text-gray-500">Status:</span> <strong>{ticket.status}</strong></div>
          <div><span className="text-gray-500">Created:</span> {new Date(ticket.createdAt).toLocaleString()}</div>
          <div><span className="text-gray-500">Updated:</span> {new Date(ticket.updatedAt).toLocaleString()}</div>
        </div>
      </div>

      <TicketDetailActions ticket={ticket} />
    </div>
  );
}
