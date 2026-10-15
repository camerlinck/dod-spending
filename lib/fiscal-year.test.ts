import { describe, expect, it } from "vitest";
import {
  AVAILABLE_FISCAL_YEARS,
  CURRENT_FISCAL_YEAR,
  DEFAULT_FISCAL_YEAR,
  fiscalYearForDate,
  fyDateRange,
  fyLabel,
  parseFY,
} from "./fiscal-year";

describe("fiscalYearForDate", () => {
  it("rolls over on Oct 1", () => {
    expect(fiscalYearForDate(new Date(2026, 8, 30))).toBe(2026);
    expect(fiscalYearForDate(new Date(2026, 9, 1))).toBe(2027);
  });

  it("keeps Jan 1 in the FY that started the previous October", () => {
    expect(fiscalYearForDate(new Date(2027, 0, 1))).toBe(2027);
  });
});

describe("fiscal year constants", () => {
  it("defaults to the most recent completed FY", () => {
    expect(DEFAULT_FISCAL_YEAR).toBe(CURRENT_FISCAL_YEAR - 1);
  });

  it("lists every FY from 2017 through the current one", () => {
    expect(AVAILABLE_FISCAL_YEARS[0]).toBe(2017);
    expect(AVAILABLE_FISCAL_YEARS.at(-1)).toBe(CURRENT_FISCAL_YEAR);
    expect(AVAILABLE_FISCAL_YEARS).toHaveLength(CURRENT_FISCAL_YEAR - 2017 + 1);
  });
});

describe("parseFY", () => {
  it("accepts an available year", () => {
    expect(parseFY("2020")).toBe(2020);
  });

  it("falls back to the default for missing, invalid or out-of-range input", () => {
    expect(parseFY(undefined)).toBe(DEFAULT_FISCAL_YEAR);
    expect(parseFY("abc")).toBe(DEFAULT_FISCAL_YEAR);
    expect(parseFY("2016")).toBe(DEFAULT_FISCAL_YEAR);
    expect(parseFY(String(CURRENT_FISCAL_YEAR + 1))).toBe(DEFAULT_FISCAL_YEAR);
  });
});

describe("fyDateRange", () => {
  it("returns USASpending start_date/end_date for Oct 1 – Sep 30", () => {
    expect(fyDateRange(2025)).toEqual({ start_date: "2024-10-01", end_date: "2025-09-30" });
  });
});

describe("fyLabel", () => {
  it("marks only the current FY as in progress", () => {
    expect(fyLabel(CURRENT_FISCAL_YEAR)).toBe(`FY${CURRENT_FISCAL_YEAR} (in progress)`);
    expect(fyLabel(2020)).toBe("FY2020");
  });
});
