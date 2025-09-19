import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Facturae AEAT',
  description: 'Emisión rápida de facturas con integración AEAT',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
