"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FiscalYearSelector } from "./FiscalYearSelector";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/agencies", label: "Agencies" },
  { href: "/categories", label: "Spending Categories" },
  { href: "/accounts", label: "Federal Accounts" },
  { href: "/spending", label: "Contracts" },
  { href: "/search", label: "Search" },
  { href: "/geography", label: "Geography" },
  { href: "/budget", label: "Historical Budget" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-14">
            <Link href="/" className="font-bold text-lg tracking-tight whitespace-nowrap">
              DoD Spending Explorer
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors",
                    pathname === item.href
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Suspense fallback={null}>
              <FiscalYearSelector />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t mt-16 py-6 text-center text-sm text-muted-foreground">
        Data sourced from{" "}
        <a href="https://usaspending.gov" target="_blank" rel="noopener noreferrer" className="underline">
          USASpending.gov
        </a>{" "}
        and the{" "}
        <a href="https://www.whitehouse.gov/omb/budget/historical-tables/" target="_blank" rel="noopener noreferrer" className="underline">
          OMB
        </a>
        . Updated daily.
      </footer>
    </div>
  );
}
