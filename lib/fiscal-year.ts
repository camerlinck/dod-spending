export const AVAILABLE_FISCAL_YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
export const DEFAULT_FISCAL_YEAR = 2025;
export const CURRENT_FISCAL_YEAR = 2026; // in-progress

export function parseFY(value: string | undefined): number {
  const n = parseInt(value ?? "", 10);
  if (AVAILABLE_FISCAL_YEARS.includes(n)) return n;
  return DEFAULT_FISCAL_YEAR;
}

export function fyDateRange(fy: number): { start: string; end: string } {
  return {
    start: `${fy - 1}-10-01`,
    end: `${fy}-09-30`,
  };
}

export function fyLabel(fy: number): string {
  if (fy === CURRENT_FISCAL_YEAR) return `FY${fy} (in progress)`;
  return `FY${fy}`;
}
