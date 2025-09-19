import Link from 'next/link';
import { strapi } from '@/lib/strapi';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { SiiStatus } from '@/components/sii-status';
import { mapInvoice } from '@/lib/mappers';

async function getInvoices() {
  const response = await strapi.get<{ data: any[] }>('/api/invoices?populate[customer]=*&populate[lines]=*&populate[company]=*&sort=issueDate:desc');
  return response.data.map(mapInvoice);
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Facturas</h1>
        <Button asChild>
          <Link href="/invoices/new">Nueva factura (N)</Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-800">
        <Table>
          <THead>
            <TR>
              <TH>#</TH>
              <TH>Cliente</TH>
              <TH>Fecha</TH>
              <TH className="text-right">Total</TH>
              <TH>Estado</TH>
            </TR>
          </THead>
          <TBody>
            {invoices.map((invoice) => (
              <TR key={invoice.id}>
                <TD>
                  <Link href={`/invoices/${invoice.id}`} className="text-emerald-300 hover:underline">
                    {invoice.series}
                    {invoice.number ?? '—'}
                  </Link>
                </TD>
                <TD>{invoice.customer.name}</TD>
                <TD>{invoice.issueDate}</TD>
                <TD className="text-right">{formatCurrency(invoice.total, invoice.currency)}</TD>
                <TD>
                  <SiiStatus state={invoice.siiState} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
