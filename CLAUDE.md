# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                           # dev server, http://localhost:3000
npm run build                         # production build; also type-checks and prerenders static pages (hits the live API)
npm run lint
npm test                              # Vitest, all tests (lib/**/*.test.ts)
npx vitest run lib/fiscal-year.test.ts   # single file
npx vitest run -t "parseFY"              # tests matching a name
```

## Architecture

A Next.js 16 App Router app (React 19, Tailwind 4, shadcn/ui on Base UI, Recharts) that shows Department of Defense spending from the public USASpending.gov API (`https://api.usaspending.gov/api/v2`). There is no database or API key: every page is a server component that fetches the API directly.

**Data access:** `lib/usaspending/client.ts` has `getUSASpending` and `postUSASpending`. Both throw on a non-OK response and take a Next `revalidate` value: 300s for search, 14400s (4h) for per-FY breakdowns, 86400s (1d) for historical budget data. `DOD_AGENCY_CODE = "097"` is DoD's toptier agency code, used in `/agency/097/...` endpoints. Response shapes are in `lib/usaspending/types.ts`. Server pages usually wrap each data section in its own async component inside `<Suspense>` with a `Skeleton` fallback (see `app/page.tsx`).

**Fiscal year flow:** the fiscal year comes from the `?fy=` query param. `FiscalYearSelector` (client, in `AppShell`) pushes `?fy=` in a transition. Server pages call `parseFY(searchParams.fy)`, which falls back to `DEFAULT_FISCAL_YEAR` for missing or out-of-range values. For endpoints that filter by date, `fyDateRange(fy)` returns `{ start_date, end_date }`, the exact shape USASpending's `time_period` filter expects. `lib/fiscal-year.ts` computes the FY from the current date (FY N = Oct 1 of N-1 to Sep 30 of N), and the default is the most recent completed FY. Don't hardcode years.

**FY rollover nulls:** right after Oct 1, USASpending returns the new FY in `budgetary_resources` with `null` amounts. The budget amount fields are typed `number | null`, and `formatCurrency` / `deltaPercent` / `StatCard` / `SpendingTrendChart` accept null. Keep new consumers of that data null-safe, or the `/budget` prerender breaks the build.

**Categories drill-down:** the path is `/categories` (object classes) → `/categories/[slug]` (PSC groups) → `/categories/[slug]/[pscCode]` (contracts). `lib/categories/config.ts` (`OBJECT_CLASS_CONFIGS`) maps object classes to slugs, and pages match API results to configs by **case-insensitive label equality** with the USASpending object class name. Drillable classes filter contract spending by PSC type (`Product` / `Service` / `Research and Development`) plus an optional 2-char PSC group. Non-drillable classes (personnel, benefits) only show an explanation. The PSC pages show an API error inline instead of returning 404.

**Search:** `/search` is the only client page. It calls the local route handler `app/api/search/route.ts`, which proxies `POST /search/spending_by_award/` with the DoD toptier agency filter, contract award types A–D, and the FY date range. The page stores each response with a request key built from (query, page, sort, order, fy), and derives loading/results from it. Don't call setState synchronously inside effects, because `react-hooks/set-state-in-effect` is enforced.

Recharts components (`components/charts/*`) must be client components. Server pages pass them plain data.
