export function formatCurrency(amount: number | null, compact = false): string {
  if (amount == null) return "—";
  if (compact) {
    if (Math.abs(amount) >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
    if (Math.abs(amount) >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (Math.abs(amount) >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${amount.toLocaleString()}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function fiscalYearLabel(fy: number): string {
  return `FY${fy}`;
}

export function deltaPercent(current: number | null, previous: number | null): number | undefined {
  if (current == null || previous == null) return undefined;
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}
