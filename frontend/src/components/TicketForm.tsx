'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTicket, updateTicket } from '@/lib/api';
import { Priority, Ticket } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Zod Schema for validation
const schema = z.object({
  title: z.string().min(5, 'title ต้องยาวอย่างน้อย 5 ตัวอักษร'),
  description: z.string().max(5000, 'description ยาวเกิน 5000 ตัวอักษร'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});
type FormValues = z.infer<typeof schema>;

export default function TicketForm({ mode, initial }: { mode: 'create' | 'edit'; initial?: Ticket }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form Setup
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title || '',
      description: initial?.description || '',
      priority: (initial?.priority as Priority) || 'LOW',
    },
  });

  // Submit Handler
  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      if (mode === 'create') {
        await createTicket(values);
        router.push('/tickets');
      } else {
        if (!initial) return;
        await updateTicket(initial.id, values);
        router.refresh();
        router.push('/tickets');
      }
    } catch (e: any) {
      alert(e.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Input field for title */}
      <div>
        <label className="block text-sm font-medium text-black">Title</label>
        <input {...register('title')} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black" placeholder="Short summary..." />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>
      {/* Textarea for description */}
      <div>
        <label className="block text-sm font-medium text-black">Description</label>
        <textarea {...register('description')} rows={6} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black" placeholder="Detail about the issue…" />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>
      {/* Select dropdown */}
      <div>
        <label className="block text-sm font-medium text-black">Priority</label>
        <select {...register('priority')} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black">
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">
          {submitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
        </button>
        <button type="button" onClick={() => history.back()} className="rounded-lg border px-4 py-2 text-black">Cancel</button>
      </div>
    </form>
  );
}
