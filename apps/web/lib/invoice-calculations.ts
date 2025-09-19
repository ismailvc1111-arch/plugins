export type LineInput = {
  qty: number;
  unitPrice: number;
  taxRate: number;
};

export function calculateLineTotal(line: LineInput) {
  const base = line.qty * line.unitPrice;
  const tax = (base * line.taxRate) / 100;
  return Number((base + tax).toFixed(2));
}

export function calculateTotals(lines: LineInput[]) {
  return lines.reduce(
    (acc, line) => {
      const base = line.qty * line.unitPrice;
      const tax = (base * line.taxRate) / 100;
      return {
        subtotal: Number((acc.subtotal + base).toFixed(2)),
        tax: Number((acc.tax + tax).toFixed(2)),
        total: Number((acc.total + base + tax).toFixed(2)),
      };
    },
    { subtotal: 0, tax: 0, total: 0 }
  );
}
