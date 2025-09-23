import TicketForm from '@/components/TicketForm';

export default function CreateTicketPage() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-black">Create Ticket</h2>
      <TicketForm mode="create" />
    </div>
  );
}
