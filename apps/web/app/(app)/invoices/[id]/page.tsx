import { notFound } from 'next/navigation';
import { InvoiceForm } from '@/components/invoice-form';
import { strapi, unwrapCollection } from '@/lib/strapi';
import { Invoice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SiiStatus } from '@/components/sii-status';
import { formatCurrency } from '@/lib/utils';
import { mapInvoice } from '@/lib/mappers';

async function getInvoice(id: string) {
  try {
    const response = await strapi.get<{ data: any }>(`/api/invoices/${id}?populate[customer]=*&populate[lines]=*&populate[company]=*`);
    return mapInvoice(response.data);
  } catch (error) {
    return null;
  }
}

async function getCustomers() {
  const response = await strapi.get<{ data: { id: number; attributes: { name: string } }[] }>('/api/customers');
  return unwrapCollection(response).map((customer) => ({ id: customer.id, name: customer.name }));
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);
  if (!invoice) {
    notFound();
  }
  const customers = await getCustomers();

  async function saveDraft(values: any) {
    'use server';
    await strapi.put(`/api/invoices/${params.id}`, { data: values });
  }

  async function issueInvoice() {
    'use server';
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/invoices/${params.id}/issue`, {
      method: 'POST',
    });
  }

  async function previewPdf() {
    'use server';
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/invoices/${params.id}/pdf`);
  }

  async function sendSii() {
    'use server';
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/invoices/${params.id}/send/sii`, {
      method: 'POST',
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Factura {invoice.series}
            {invoice.number ?? '—'}</h1>
          <p className="text-sm text-neutral-400">Estado: {invoice.status}</p>
        </div>
        <div className="flex items-center gap-3">
          <SiiStatus state={invoice.siiState} />
          <Button
            variant="secondary"
            asChild
            className="border border-neutral-800 bg-transparent text-neutral-300 hover:text-white"
          >
            <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
              Ver PDF
            </a>
          </Button>
          <form action={sendSii}>
            <Button type="submit" variant="ghost" className="border border-neutral-800">
              Enviar SII
            </Button>
          </form>
        </div>
      </header>
      <InvoiceForm
        invoice={invoice as Invoice}
        customers={customers}
        onSave={saveDraft}
        onIssue={issueInvoice}
        onPreviewPdf={() => {
          void previewPdf();
        }}
      />
      <footer className="rounded-xl border border-neutral-800 p-4 text-sm text-neutral-400">
        <div>Total: {formatCurrency(invoice.total, invoice.currency)}</div>
        <div>Facturae: {invoice.facturaeUrl ?? 'Pendiente'}</div>
        <div>PDF: {invoice.pdfUrl ?? 'Pendiente'}</div>
      </footer>
    </div>
  );
}
