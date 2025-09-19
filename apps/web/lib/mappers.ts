import { Invoice } from '@/lib/types';

export function mapInvoice(entity: any): Invoice {
  const attrs = entity.attributes ?? entity;
  const customer = attrs.customer?.data
    ? { id: attrs.customer.data.id, ...attrs.customer.data.attributes }
    : attrs.customer;
  const lines = Array.isArray(attrs.lines?.data)
    ? attrs.lines.data.map((line: any) => ({ id: line.id, ...line.attributes }))
    : attrs.lines;
  return {
    id: entity.id ?? attrs.id,
    status: attrs.status,
    series: attrs.series ?? attrs.company?.data?.attributes?.series ?? 'A',
    number: attrs.number,
    issueDate: attrs.issueDate,
    subtotal: Number(attrs.subtotal ?? 0),
    taxTotal: Number(attrs.taxTotal ?? 0),
    total: Number(attrs.total ?? 0),
    currency: attrs.currency ?? attrs.company?.data?.attributes?.currency ?? 'EUR',
    facturaeUrl: attrs.facturaeUrl,
    pdfUrl: attrs.pdfUrl,
    siiState: attrs.siiState,
    lines: lines?.map((line: any) => ({
      id: line.id,
      description: line.description,
      qty: Number(line.qty ?? 0),
      unitPrice: Number(line.unitPrice ?? 0),
      taxRate: Number(line.taxRate ?? 0),
      lineTotal: Number(line.lineTotal ?? 0),
      product: line.product?.data?.id ?? line.product ?? null,
    })) ?? [],
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          taxId: customer.taxId,
          country: customer.country,
          email: customer.email,
          address: customer.address,
        }
      : {
          id: 0,
          name: '',
          taxId: '',
          country: 'ES',
        },
  };
}
