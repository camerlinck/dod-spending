"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AVAILABLE_FISCAL_YEARS, DEFAULT_FISCAL_YEAR, CURRENT_FISCAL_YEAR } from "@/lib/fiscal-year";

export function FiscalYearSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFY = parseInt(searchParams.get("fy") ?? String(DEFAULT_FISCAL_YEAR), 10);

  function handleChange(fy: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("fy", String(fy));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 ml-auto shrink-0">
      <span className="text-xs text-slate-400 hidden sm:inline">Fiscal Year</span>
      <select
        value={currentFY}
        onChange={(e) => handleChange(parseInt(e.target.value, 10))}
        className="text-sm bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-slate-400"
      >
        {[...AVAILABLE_FISCAL_YEARS].reverse().map((fy) => (
          <option key={fy} value={fy}>
            FY{fy}{fy === CURRENT_FISCAL_YEAR ? " ⚠" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
