import { strapi, unwrapCollection } from '@/lib/strapi';

async function getCustomers() {
  const response = await strapi.get<{ data: { id: number; attributes: { name: string; taxId: string; email?: string } }[] }>('/api/customers');
  return unwrapCollection(response);
}

export default async function CustomersPage() {
  const customers = await getCustomers();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-neutral-400">Gestión centralizada de clientes y destinatarios de facturas.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="text-lg font-semibold text-white">{customer.name}</div>
            <div className="text-sm text-neutral-400">NIF: {customer.taxId}</div>
            <div className="text-sm text-neutral-500">{customer.email ?? 'Sin email'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
