import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiiStatus } from '@/components/sii-status';
import { formatCurrency } from '@/lib/utils';
import { strapi } from '@/lib/strapi';
import { mapInvoice } from '@/lib/mappers';

async function getInvoices() {
  const response = await strapi.get<{ data: any[] }>('/api/invoices?populate[customer]=*&populate[lines]=*&populate[company]=*&sort=issueDate:desc&pagination[pageSize]=5');
  return response.data.map(mapInvoice);
}

export default async function DashboardPage() {
  const invoices = await getInvoices();
  const totals = invoices.reduce(
    (acc, invoice) => {
      return {
        subtotal: acc.subtotal + invoice.subtotal,
        tax: acc.tax + invoice.taxTotal,
        total: acc.total + invoice.total,
      };
    },
    { subtotal: 0, tax: 0, total: 0 }
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total emitido</CardTitle>
          <CardDescription>{formatCurrency(totals.total)}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>IVA repercutido</CardTitle>
          <CardDescription>{formatCurrency(totals.tax)}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Borradores</CardTitle>
          <CardDescription>{invoices.filter((inv) => inv.status === 'draft').length} pendientes</CardDescription>
        </CardHeader>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Últimas facturas</CardTitle>
          <CardDescription>Seguimiento rápido del estado SII</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-neutral-800 px-4 py-3">
              <div>
                <div className="text-sm text-neutral-400">{invoice.series}{invoice.number ?? '—'}</div>
                <div className="text-lg font-semibold text-white">{formatCurrency(invoice.total, invoice.currency)}</div>
              </div>
              <SiiStatus state={invoice.siiState} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
