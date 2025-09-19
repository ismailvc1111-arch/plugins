'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type ButtonElement = React.ElementRef<'button'>;

const variants = {
  primary: 'bg-emerald-500 text-black hover:bg-emerald-400',
  secondary: 'bg-neutral-800 text-white hover:bg-neutral-700',
  ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-900',
};

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: keyof typeof variants;
  asChild?: boolean;
};

export const Button = React.forwardRef<ButtonElement, ButtonProps>(
  ({ className, variant = 'primary', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
