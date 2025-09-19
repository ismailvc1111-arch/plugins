import { redirect } from 'next/navigation';
import { strapi } from '@/lib/strapi';

async function createDraft() {
  const response = await strapi.post<{ data: { id: number } }>('/api/invoices', {
    data: {
      status: 'draft',
      currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'EUR',
    },
  });
  return response.data.id;
}

export default async function NewInvoicePage() {
  const invoiceId = await createDraft();
  redirect(`/invoices/${invoiceId}`);
}
