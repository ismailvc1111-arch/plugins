import { strapi, unwrapCollection } from '@/lib/strapi';
import { formatCurrency } from '@/lib/utils';

async function getProducts() {
  const response = await strapi.get<{ data: { id: number; attributes: { name: string; unitPrice: number; defaultTaxRate: number } }[] }>('/api/products');
  return unwrapCollection(response);
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Productos</h1>
        <p className="text-sm text-neutral-400">Catálogo de productos y servicios con sus impuestos por defecto.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="text-lg font-semibold text-white">{product.name}</div>
            <div className="text-sm text-neutral-400">{formatCurrency(product.unitPrice)}</div>
            <div className="text-xs uppercase text-neutral-500">IVA {product.defaultTaxRate}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
