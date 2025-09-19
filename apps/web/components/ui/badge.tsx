'use client';

import { cn } from '@/lib/utils';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'pending' | 'success' | 'error';
};

export function Badge({ className, tone = 'default', ...props }: Props) {
  const styles: Record<typeof tone, string> = {
    default: 'bg-neutral-800 text-neutral-200',
    pending: 'bg-amber-500/20 text-amber-300',
    success: 'bg-emerald-500/20 text-emerald-300',
    error: 'bg-red-500/20 text-red-300',
  };
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        styles[tone],
        className
      )}
    />
  );
}
