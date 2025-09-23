import Filters from '@/components/Filters';
import TicketTable from '@/components/TicketTable';
import { listTickets } from '@/lib/api';
import { TicketsQuery } from '@/lib/types';

export default async function TicketsPage({ searchParams }: { searchParams: Promise<TicketsQuery> }) {
  const params = await searchParams;
  const query: TicketsQuery = {
    status: params.status,
    priority: params.priority,
    search: params.search,
    page: params.page ? Number(params.page) : 1,
    pageSize: params.pageSize ? Number(params.pageSize) : 10,
    sortBy: (params.sortBy as any) || 'createdAt',
    sortOrder: (params.sortOrder as any) || 'desc',
  };

  const data = await listTickets(query);

  return (
    <div className="space-y-4">
      <Filters initial={query} />
      <TicketTable data={data} />
    </div>
  );
}
