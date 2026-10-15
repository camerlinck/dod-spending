import type { SubAgency } from "./types";

export type SubAgencyGroup = "military" | "defense-wide" | "other";

export interface SubAgencyRow {
  key: string;
  label: string;
  fullName: string;
  value: number;
  share: number;
  group: SubAgencyGroup;
}

const MILITARY_PREFIX = "Department of the ";

// Ranks sub-agencies by obligations, keeping the top `topN` and folding the rest into one "Other" row.
// Military departments get their branch name ("Navy"); other agencies use their abbreviation when there is one.
export function summarizeSubAgencies(agencies: SubAgency[], topN = 10): SubAgencyRow[] {
  const positive = agencies
    .filter((a) => a.total_obligations > 0)
    .sort((a, b) => b.total_obligations - a.total_obligations);
  const total = positive.reduce((sum, a) => sum + a.total_obligations, 0);
  if (total === 0) return [];

  const rest = positive.length > topN + 1 ? positive.slice(topN) : [];
  const shown = rest.length ? positive.slice(0, topN) : positive;

  const rows: SubAgencyRow[] = shown.map((a) => {
    const military = a.name.startsWith(MILITARY_PREFIX);
    return {
      key: a.name,
      label: military ? a.name.slice(MILITARY_PREFIX.length) : a.abbreviation || a.name,
      fullName: a.name,
      value: a.total_obligations,
      share: a.total_obligations / total,
      group: military ? "military" : "defense-wide",
    };
  });

  if (rest.length) {
    const value = rest.reduce((sum, a) => sum + a.total_obligations, 0);
    rows.push({
      key: "__other__",
      label: `Other (${rest.length})`,
      fullName: `${rest.length} other agencies: ${rest.map((a) => a.abbreviation || a.name).join(", ")}`,
      value,
      share: value / total,
      group: "other",
    });
  }

  return rows;
}
