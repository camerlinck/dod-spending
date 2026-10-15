# DoD Spending Explorer

A Next.js app for exploring U.S. Department of Defense spending, using public data from the [USASpending.gov API](https://api.usaspending.gov/).

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Dashboard: headline budget figures, multi-year trend, sub-agency breakdown |
| `/budget` | Historical budget authority, obligations and outlays by fiscal year |
| `/spending` | Spending breakdown for the selected fiscal year |
| `/agencies` | Spending by DoD sub-agency |
| `/accounts` | Spending by federal account |
| `/categories` | Spending by object class, drilling into Product & Service Codes (PSC) and contracts |
| `/geography` | Spending by place of performance |
| `/search` | Contract award search |

Most pages take an `?fy=` query parameter, set from the fiscal year selector in the header.

## Fiscal years

Federal fiscal year N runs from Oct 1 of N-1 through Sep 30 of N. `lib/fiscal-year.ts` works out the current FY from today's date, so the selector rolls over on its own each October. The default view is the most recent completed FY. The year in progress is flagged because its data is partial. Right after Oct 1, USASpending may return the new FY with `null` amounts, and the UI shows those as "—".

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests (Vitest)
npm run lint
npm run build
```

No API key is needed. USASpending responses are cached through Next.js `revalidate`, which is one hour by default and longer for historical data.
