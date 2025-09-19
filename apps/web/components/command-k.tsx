'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const commands = [
  { label: 'Nueva factura', shortcut: 'N', href: '/invoices/new' },
  { label: 'Dashboard', shortcut: 'D', href: '/' },
  { label: 'Clientes', shortcut: 'C', href: '/customers' },
  { label: 'Productos', shortcut: 'P', href: '/products' },
];

const isEditableElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
};

export function CommandK() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (isEditableElement(event.target)) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key.toLowerCase() === 'n') {
        router.push('/invoices/new');
      }
      if (event.key.toLowerCase() === 's') {
        document.dispatchEvent(new CustomEvent('invoice:issue'));
      }
      if (event.key.toLowerCase() === 'p') {
        document.dispatchEvent(new CustomEvent('invoice:pdf'));
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [router]);

  return (
    <>
      <button
        className="group absolute right-6 top-6 flex w-72 items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-400 transition hover:border-neutral-700 hover:text-white"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>Buscar (⌘K)</span>
      </button>
      <Command.Dialog open={open} onOpenChange={setOpen} label="Comandos">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-lg">
          <Command.Input className="w-full border-b border-neutral-800 bg-transparent px-4 py-3 outline-none" placeholder="Ir a…" />
          <Command.List className="max-h-60 overflow-y-auto">
            {commands.map((cmd) => (
              <Command.Item
                key={cmd.href}
                value={cmd.href}
                onSelect={() => {
                  router.push(cmd.href);
                  setOpen(false);
                }}
                className={cn(
                  'flex cursor-pointer items-center justify-between px-4 py-3 text-sm outline-none aria-selected:bg-neutral-900'
                )}
              >
                {cmd.label}
                <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs text-neutral-400">{cmd.shortcut}</kbd>
              </Command.Item>
            ))}
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  );
}
