import { ReactNode } from 'react';
import Link from 'next/link';
import { CommandK } from '@/components/command-k';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Dashboard', shortcut: 'D' },
  { href: '/invoices', label: 'Facturas', shortcut: 'N' },
  { href: '/customers', label: 'Clientes', shortcut: 'C' },
  { href: '/products', label: 'Productos', shortcut: 'P' },
  { href: '/settings', label: 'Ajustes', shortcut: ',' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-screen w-full grid-cols-[260px_1fr] bg-neutral-950 text-neutral-50">
      <aside className="flex flex-col border-r border-neutral-800 p-6">
        <div className="text-lg font-semibold tracking-tight">Facturae AEAT</div>
        <nav className="mt-8 flex flex-col gap-2 text-sm text-neutral-300">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <KeyboardShortcuts className="mt-auto" />
      </aside>
      <main className="relative flex flex-col overflow-y-auto">
        <CommandK />
        <div className="flex-1 space-y-6 p-8">{children}</div>
      </main>
    </div>
  );
}
