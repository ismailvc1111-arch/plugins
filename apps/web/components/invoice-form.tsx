'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/money-input';
import { formatCurrency } from '@/lib/utils';
import { Invoice } from '@/lib/types';
import { toast } from 'sonner';
import { calculateLineTotal, calculateTotals, LineInput } from '@/lib/invoice-calculations';

const lineSchema = z.object({
  id: z.number().optional(),
  description: z.string().min(1),
  qty: z.coerce.number().min(0.01),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0),
});

const schema = z.object({
  customer: z.number(),
  issueDate: z.string(),
  currency: z.string().default('EUR'),
  lines: z.array(lineSchema).min(1),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  invoice: Invoice;
  customers: { id: number; name: string }[];
  onSave: (values: Partial<FormValues>) => Promise<void>;
  onIssue: () => Promise<void>;
  onPreviewPdf: () => void;
};

export function InvoiceForm({ invoice, customers, onSave, onIssue, onPreviewPdf }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer: invoice.customer.id,
      issueDate: invoice.issueDate ?? new Date().toISOString().slice(0, 10),
      currency: invoice.currency,
      lines: invoice.lines.map((line) => ({
        id: line.id,
        description: line.description,
        qty: line.qty,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
      })),
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lines' });

  useEffect(() => {
    const onIssueEvent = () => onIssue();
    const onPdfEvent = () => onPreviewPdf();
    document.addEventListener('invoice:issue', onIssueEvent as EventListener);
    document.addEventListener('invoice:pdf', onPdfEvent as EventListener);
    return () => {
      document.removeEventListener('invoice:issue', onIssueEvent as EventListener);
      document.removeEventListener('invoice:pdf', onPdfEvent as EventListener);
    };
  }, [onIssue, onPreviewPdf]);

  const watchedCustomer = form.watch('customer');
  const watchedDate = form.watch('issueDate');
  const watchedLines = form.watch('lines') as LineInput[];

  const payloadKey = JSON.stringify({ watchedCustomer, watchedDate, watchedLines });

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const lines = (watchedLines ?? []).map((line) => ({
          ...line,
          lineTotal: calculateLineTotal(line),
        }));
        await onSave({
          customer: watchedCustomer,
          issueDate: watchedDate,
          lines,
        });
      } catch (error) {
        console.error(error);
        toast.error('No se pudo guardar el borrador');
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [payloadKey, onSave]);

  const totals = useMemo(() => calculateTotals(watchedLines ?? []), [watchedLines]);

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async () => {
        await onIssue();
      })}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="customer">Cliente</Label>
          <select
            id="customer"
            {...form.register('customer')}
            className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-white focus:border-emerald-500"
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id} className="bg-neutral-900">
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <Label htmlFor="issueDate">Fecha</Label>
          <Input type="date" id="issueDate" {...form.register('issueDate')} />
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const lineTotal = calculateLineTotal(watchedLines[index] ?? { qty: 0, unitPrice: 0, taxRate: 0 });
          return (
            <div key={field.id} className="rounded-xl border border-neutral-800 p-4">
              <div className="grid gap-3 md:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
                <Textarea
                  placeholder="Descripción"
                  {...form.register(`lines.${index}.description`)}
                  className="md:col-span-2"
                />
                <Input type="number" step="0.01" {...form.register(`lines.${index}.qty`)} />
                <MoneyInput control={form.control} name={`lines.${index}.unitPrice`} />
                <Input type="number" step="0.01" {...form.register(`lines.${index}.taxRate`)} />
                <div className="flex flex-col justify-between text-right text-sm text-neutral-400">
                  <span>{formatCurrency(lineTotal, invoice.currency)}</span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ description: 'Nuevo concepto', qty: 1, unitPrice: 0, taxRate: 0 })}
        >
          Añadir línea
        </Button>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-300">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal, invoice.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA</span>
          <span>{formatCurrency(totals.tax, invoice.currency)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-white">
          <span>Total</span>
          <span>{formatCurrency(totals.total, invoice.currency)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={invoice.status !== 'draft'}>
          Emitir (S)
        </Button>
        <Button type="button" variant="ghost" onClick={onPreviewPdf}>
          PDF (P)
        </Button>
      </div>
    </form>
  );
}
