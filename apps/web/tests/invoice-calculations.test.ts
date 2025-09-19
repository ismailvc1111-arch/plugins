import { describe, expect, it } from 'vitest';
import { calculateLineTotal, calculateTotals } from '@/lib/invoice-calculations';

describe('invoice calculations', () => {
  it('computes line total with tax', () => {
    expect(calculateLineTotal({ qty: 2, unitPrice: 100, taxRate: 21 })).toBe(242);
  });

  it('aggregates totals correctly', () => {
    const totals = calculateTotals([
      { qty: 1, unitPrice: 100, taxRate: 21 },
      { qty: 2, unitPrice: 50, taxRate: 10 },
    ]);
    expect(totals.subtotal).toBeCloseTo(200, 2);
    expect(totals.tax).toBeCloseTo(31, 2);
    expect(totals.total).toBeCloseTo(231, 2);
  });
});
