'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  attribute: 'class' | 'data-theme';
  defaultTheme?: string;
  enableSystem?: boolean;
};

export function ThemeProvider({ children, ...props }: Props) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
