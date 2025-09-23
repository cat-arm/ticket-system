import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ticket System',
  description: 'Next.js frontend for Ticket System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-5xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Ticket System</h1>
            <nav className="text-sm space-x-4">
              <a href="/tickets" className="hover:underline">Tickets</a>
              <a href="/tickets/create" className="hover:underline">Create</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
