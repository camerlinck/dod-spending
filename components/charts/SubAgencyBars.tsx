import { formatCurrency } from "@/lib/usaspending/formatters";
import type { SubAgencyGroup, SubAgencyRow } from "@/lib/usaspending/sub-agencies";

// Categorical slots 1–2 of the dataviz reference palette, plus a neutral for the folded tail.
// Validated on white: CVD ΔE 24.7, normal-vision ΔE 33.6; gray↔orange 11.0 / 17.9.
const GROUP_COLORS: Record<SubAgencyGroup, string> = {
  military: "#2a78d6",
  "defense-wide": "#eb6834",
  other: "#8a8a8a",
};

const GROUP_LABELS: Record<SubAgencyGroup, string> = {
  military: "Military departments",
  "defense-wide": "Defense-wide agencies",
  other: "All other agencies",
};

function formatShare(share: number): string {
  return share < 0.01 ? "<1%" : `${Math.round(share * 100)}%`;
}

export function SubAgencyBars({ rows }: { rows: SubAgencyRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No sub-agency obligations reported for this fiscal year yet.</p>;
  }

  const max = Math.max(...rows.map((r) => r.value));
  const groups = (Object.keys(GROUP_COLORS) as SubAgencyGroup[]).filter((g) => rows.some((r) => r.group === g));

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {groups.map((g) => (
          <li key={g} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: GROUP_COLORS[g] }} />
            {GROUP_LABELS[g]}
          </li>
        ))}
      </ul>

      <ol className="space-y-1">
        {rows.map((row) => (
          <li
            key={row.key}
            tabIndex={0}
            className="group relative grid grid-cols-[1fr_auto] sm:grid-cols-[8rem_1fr_auto] items-center gap-x-3 gap-y-1 rounded px-1 py-1 outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="truncate text-sm font-medium sm:col-start-1 sm:row-start-1" title={row.fullName}>
              {row.label}
            </span>
            <span className="col-span-2 row-start-2 h-5 sm:col-span-1 sm:col-start-2 sm:row-start-1" aria-hidden>
              <span
                className="block h-full rounded-r-[4px]"
                style={{ width: `max(2px, ${(row.value / max) * 100}%)`, backgroundColor: GROUP_COLORS[row.group] }}
              />
            </span>
            <span className="col-start-2 row-start-1 text-right text-sm tabular-nums sm:col-start-3">
              {formatCurrency(row.value, true)}
              <span className="ml-2 inline-block w-9 text-muted-foreground">{formatShare(row.share)}</span>
            </span>

            <span
              role="tooltip"
              className="pointer-events-none absolute left-1 bottom-full z-10 mb-1 hidden max-w-sm rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block"
            >
              <span className="block font-medium">{row.fullName}</span>
              <span className="block text-muted-foreground">
                {formatCurrency(row.value)} obligated · {formatShare(row.share)} of DoD sub-agency total
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
