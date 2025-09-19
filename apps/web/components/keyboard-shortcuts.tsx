'use client';

import { cn } from '@/lib/utils';

export function KeyboardShortcuts({ className }: { className?: string }) {
  const items = [
    { key: '⌘K', action: 'Command palette' },
    { key: 'N', action: 'Nueva factura' },
    { key: 'S', action: 'Emitir factura' },
    { key: 'P', action: 'Ver PDF' },
  ];

  return (
    <div className={cn('rounded-lg border border-neutral-800 p-4 text-xs text-neutral-400', className)}>
      <div className="mb-2 font-semibold text-neutral-200">Atajos</div>
      <dl className="space-y-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <dt>{item.action}</dt>
            <dd>
              <kbd className="rounded bg-neutral-900 px-2 py-0.5 text-neutral-300 shadow-inner">{item.key}</kbd>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
