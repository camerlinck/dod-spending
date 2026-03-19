import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { getUSASpending, DOD_AGENCY_CODE } from "@/lib/usaspending/client";
import { AgencyBudgetaryResourcesResponse } from "@/lib/usaspending/types";
import { formatCurrency, deltaPercent } from "@/lib/usaspending/formatters";

export default async function BudgetPage() {
  const data = await getUSASpending<AgencyBudgetaryResourcesResponse>(
    `/agency/${DOD_AGENCY_CODE}/budgetary_resources/?fiscal_year=2024`,
    { revalidate: 86400 }
  );

  const allYears = [...data.agency_data_by_year].sort((a, b) => b.fiscal_year - a.fiscal_year);

  const chartData = [...allYears]
    .sort((a, b) => a.fiscal_year - b.fiscal_year)
    .map((d) => ({
      year: `FY${d.fiscal_year}`,
      obligations: d.agency_total_obligated,
      outlays: d.agency_total_outlayed,
      budget_authority: d.agency_budgetary_resources,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historical Budget</h1>
        <p className="text-muted-foreground mt-1">
          DoD budget authority, obligations, and outlays over time (from USASpending.gov)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Multi-Year Budget Trend</CardTitle>
          <CardDescription>FY{allYears[allYears.length - 1]?.fiscal_year}–FY{allYears[0]?.fiscal_year}</CardDescription>
        </CardHeader>
        <CardContent>
          <SpendingTrendChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Year-by-Year Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fiscal Year</TableHead>
                <TableHead className="text-right">Budget Resources</TableHead>
                <TableHead className="text-right">Obligations</TableHead>
                <TableHead className="text-right">Outlays</TableHead>
                <TableHead className="text-right">Obligations YoY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allYears.map((yr, i) => {
                const prev = allYears[i + 1];
                const delta = prev ? deltaPercent(yr.agency_total_obligated, prev.agency_total_obligated) : null;
                return (
                  <TableRow key={yr.fiscal_year}>
                    <TableCell className="font-bold">FY{yr.fiscal_year}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(yr.agency_budgetary_resources, true)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(yr.agency_total_obligated, true)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(yr.agency_total_outlayed, true)}
                    </TableCell>
                    <TableCell className={`text-right text-sm ${delta !== null ? (delta >= 0 ? "text-blue-600" : "text-red-600") : "text-muted-foreground"}`}>
                      {delta !== null ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%` : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
