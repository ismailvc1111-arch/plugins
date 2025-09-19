export type Company = {
  id: number;
  name: string;
  taxId: string;
  country: string;
  series?: string;
  currency?: string;
};

export type Customer = {
  id: number;
  name: string;
  taxId: string;
  country: string;
  email?: string;
  address?: string;
};

export type InvoiceLine = {
  id?: number;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  product?: number | null;
};

export type Invoice = {
  id: number;
  status: 'draft' | 'issued' | 'sent';
  series: string;
  number: number | null;
  issueDate: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  facturaeUrl?: string | null;
  pdfUrl?: string | null;
  siiState?: string | null;
  lines: InvoiceLine[];
  customer: Customer;
};
