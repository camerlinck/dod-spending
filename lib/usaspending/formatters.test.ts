import { describe, expect, it } from "vitest";
import { deltaPercent, formatCurrency } from "./formatters";

describe("formatCurrency", () => {
  it("renders null as a dash", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(null, true)).toBe("—");
  });

  it("compacts large amounts", () => {
    expect(formatCurrency(2.6175e12, true)).toBe("$2.62T");
    expect(formatCurrency(1.5e9, true)).toBe("$1.5B");
    expect(formatCurrency(2.5e6, true)).toBe("$2.5M");
  });

  it("formats full amounts without cents", () => {
    expect(formatCurrency(1234567.89)).toBe("$1,234,568");
  });
});

describe("deltaPercent", () => {
  it("computes percent change", () => {
    expect(deltaPercent(110, 100)).toBeCloseTo(10);
  });

  it("returns undefined when either side is null", () => {
    expect(deltaPercent(null, 100)).toBeUndefined();
    expect(deltaPercent(100, null)).toBeUndefined();
  });
});
