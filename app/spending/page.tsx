import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { postUSASpending } from "@/lib/usaspending/client";
import { SpendingByCategoryResponse } from "@/lib/usaspending/types";
import { formatCurrency } from "@/lib/usaspending/formatters";
import { parseFY, fyDateRange } from "@/lib/fiscal-year";

async function TopContractors({ fy }: { fy: number }) {
  const { start, end } = fyDateRange(fy);
  const data = await postUSASpending<SpendingByCategoryResponse>(
    "/search/spending_by_category/recipient/",
    {
      filters: {
        agencies: [{ type: "awarding", tier: "toptier", name: "Department of Defense" }],
        time_period: [{ start_date: start, end_date: end }],
        award_type_codes: ["A", "B", "C", "D"],
      },
      limit: 50,
      page: 1,
    },
    14400
  );

  const consolidated = new Map<string, number>();
  for (const r of data.results) {
    const name = r.name || "Unknown";
    consolidated.set(name, (consolidated.get(name) ?? 0) + r.amount);
  }
  const ranked = [...consolidated.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Contractor</TableHead>
          <TableHead className="text-right">Contract Obligations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ranked.map(([name, amount], i) => (
          <TableRow key={name}>
            <TableCell className="text-muted-foreground w-12">#{i + 1}</TableCell>
            <TableCell className="font-medium">{name}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(amount, true)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function SpendingByIndustry({ fy }: { fy: number }) {
  const { start, end } = fyDateRange(fy);
  const data = await postUSASpending<SpendingByCategoryResponse>(
    "/search/spending_by_category/naics/",
    {
      filters: {
        agencies: [{ type: "awarding", tier: "toptier", name: "Department of Defense" }],
        time_period: [{ start_date: start, end_date: end }],
        award_type_codes: ["A", "B", "C", "D"],
      },
      limit: 15,
      page: 1,
    },
    14400
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Industry (NAICS)</TableHead>
          <TableHead>Code</TableHead>
          <TableHead className="text-right">Obligations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.results.map((r, i) => (
          <TableRow key={r.code ?? i}>
            <TableCell className="font-medium">{r.name || "Unknown"}</TableCell>
            <TableCell><Badge variant="outline" className="font-mono text-xs">{r.code}</Badge></TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(r.amount, true)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function SpendingPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
  const { fy: fyParam } = await searchParams;
  const fy = parseFY(fyParam);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
        <p className="text-muted-foreground mt-1">FY{fy} DoD contract obligations by contractor and industry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Contractors</CardTitle>
            <CardDescription>FY{fy} contract obligations by recipient</CardDescription>
          </CardHeader>
          <CardContent><TopContractors fy={fy} /></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Industry (NAICS)</CardTitle>
            <CardDescription>Top industries by contract obligation</CardDescription>
          </CardHeader>
          <CardContent><SpendingByIndustry fy={fy} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
