import { describe, expect, it } from "vitest";
import { summarizeSubAgencies } from "./sub-agencies";
import type { SubAgency } from "./types";

function agency(name: string, abbreviation: string | null, total_obligations: number): SubAgency {
  return { name, abbreviation, total_obligations, transaction_obligated_amount: 0, new_award_count: 0, children: [] };
}

const AGENCIES = [
  agency("Defense Logistics Agency", "DLA", 40),
  agency("Department of the Navy", "USN", 100),
  agency("USTRANSCOM", null, 10),
  agency("Defense Media Activity", "DMA", 5),
  agency("Defense Finance and Accounting Service", "DFAS", 5),
  agency("Negative Agency", "NEG", -3),
];

describe("summarizeSubAgencies", () => {
  it("ranks by obligations and shortens labels", () => {
    const rows = summarizeSubAgencies(AGENCIES, 10);
    expect(rows.map((r) => r.label)).toEqual(["Navy", "DLA", "USTRANSCOM", "DMA", "DFAS"]);
    expect(rows[0]).toMatchObject({ fullName: "Department of the Navy", group: "military" });
    expect(rows[1].group).toBe("defense-wide");
  });

  it("computes shares of the positive total, ignoring negative obligations", () => {
    const rows = summarizeSubAgencies(AGENCIES, 10);
    expect(rows[0].share).toBeCloseTo(100 / 160);
    expect(rows.reduce((s, r) => s + r.share, 0)).toBeCloseTo(1);
  });

  it("folds everything past topN into an Other row", () => {
    const rows = summarizeSubAgencies(AGENCIES, 2);
    expect(rows.map((r) => r.label)).toEqual(["Navy", "DLA", "Other (3)"]);
    expect(rows[2]).toMatchObject({ value: 20, group: "other" });
    expect(rows[2].fullName).toContain("USTRANSCOM, DMA, DFAS");
  });

  it("doesn't fold a single leftover agency into Other", () => {
    expect(summarizeSubAgencies(AGENCIES, 4).map((r) => r.label)).toEqual(["Navy", "DLA", "USTRANSCOM", "DMA", "DFAS"]);
  });

  it("returns nothing when there are no positive obligations", () => {
    expect(summarizeSubAgencies([agency("Empty", null, 0)])).toEqual([]);
  });
});
