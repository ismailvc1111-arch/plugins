'use client';

import { Badge } from '@/components/ui/badge';

const STATES: Record<string, { label: string; tone: 'pending' | 'success' | 'error' }> = {
  pending: { label: 'Pendiente', tone: 'pending' },
  sent: { label: 'Enviado', tone: 'success' },
  error: { label: 'Error', tone: 'error' },
};

export function SiiStatus({ state }: { state?: string | null }) {
  const fallback = STATES[state ?? ''] ?? STATES.pending;
  return <Badge tone={fallback.tone}>{fallback.label}</Badge>;
}
