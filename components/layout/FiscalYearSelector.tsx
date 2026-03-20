"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AVAILABLE_FISCAL_YEARS, DEFAULT_FISCAL_YEAR, CURRENT_FISCAL_YEAR } from "@/lib/fiscal-year";

export function FiscalYearSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFY = parseInt(searchParams.get("fy") ?? String(DEFAULT_FISCAL_YEAR), 10);
  const [isPending, startTransition] = useTransition();

  function handleChange(fy: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("fy", String(fy));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-pulse" />
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Updating data…
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <span className="text-xs text-slate-400 hidden sm:inline">Fiscal Year</span>
        <select
          value={currentFY}
          onChange={(e) => handleChange(parseInt(e.target.value, 10))}
          disabled={isPending}
          className="text-sm bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-slate-400 disabled:opacity-50"
        >
          {[...AVAILABLE_FISCAL_YEARS].reverse().map((fy) => (
            <option key={fy} value={fy}>
              FY{fy}{fy === CURRENT_FISCAL_YEAR ? " ⚠" : ""}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
