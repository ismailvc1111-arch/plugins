'use client';

import { InputHTMLAttributes, useMemo } from 'react';
import { useController, Control } from 'react-hook-form';
import { formatCurrency } from '@/lib/utils';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  control: Control<any>;
  name: string;
  currency?: string;
};

export function MoneyInput({ control, name, currency = 'EUR', ...props }: Props) {
  const { field } = useController({ control, name });
  const preview = useMemo(() => formatCurrency(Number(field.value || 0), currency), [field.value, currency]);

  return (
    <div className="space-y-1">
      <input
        {...props}
        {...field}
        type="number"
        step="0.01"
        className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
      />
      <p className="text-xs text-neutral-500">{preview}</p>
    </div>
  );
}
