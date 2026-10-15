const FIRST_FISCAL_YEAR = 2017;

// Federal FY N runs Oct 1 of N-1 through Sep 30 of N.
export function fiscalYearForDate(date: Date): number {
  return date.getMonth() >= 9 ? date.getFullYear() + 1 : date.getFullYear();
}

export const CURRENT_FISCAL_YEAR = fiscalYearForDate(new Date()); // in-progress
export const DEFAULT_FISCAL_YEAR = CURRENT_FISCAL_YEAR - 1; // most recent completed
export const AVAILABLE_FISCAL_YEARS = Array.from(
  { length: CURRENT_FISCAL_YEAR - FIRST_FISCAL_YEAR + 1 },
  (_, i) => FIRST_FISCAL_YEAR + i,
);

export function parseFY(value: string | undefined): number {
  const n = parseInt(value ?? "", 10);
  if (AVAILABLE_FISCAL_YEARS.includes(n)) return n;
  return DEFAULT_FISCAL_YEAR;
}

export function fyDateRange(fy: number): { start_date: string; end_date: string } {
  return {
    start_date: `${fy - 1}-10-01`,
    end_date: `${fy}-09-30`,
  };
}

export function fyLabel(fy: number): string {
  if (fy === CURRENT_FISCAL_YEAR) return `FY${fy} (in progress)`;
  return `FY${fy}`;
}
