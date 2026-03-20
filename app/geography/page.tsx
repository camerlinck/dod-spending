import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { postUSASpending } from "@/lib/usaspending/client";
import { SpendingByGeographyResponse } from "@/lib/usaspending/types";
import { formatCurrency } from "@/lib/usaspending/formatters";
import { parseFY, fyDateRange } from "@/lib/fiscal-year";

export default async function GeographyPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
  const { fy: fyParam } = await searchParams;
  const fy = parseFY(fyParam);
  const data = await postUSASpending<SpendingByGeographyResponse>(
    "/search/spending_by_geography/",
    {
      filters: {
        agencies: [{ type: "awarding", tier: "toptier", name: "Department of Defense" }],
        time_period: [fyDateRange(fy)],
      },
      geo_layer: "state",
      scope: "place_of_performance",
    },
    14400
  );

  const states = data.results.filter((s) => s.aggregated_amount > 0).sort((a, b) => b.aggregated_amount - a.aggregated_amount);
  const total = states.reduce((s, r) => s + r.aggregated_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Geographic Distribution</h1>
        <p className="text-muted-foreground mt-1">FY{fy} DoD spending by state (place of performance)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending by State</CardTitle>
          <CardDescription>{states.length} states · {formatCurrency(total, true)} total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Obligations</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {states.map((state, i) => (
                <TableRow key={state.shape_code}>
                  <TableCell className="text-muted-foreground w-12">#{i + 1}</TableCell>
                  <TableCell className="font-medium">{state.display_name}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(state.aggregated_amount, true)}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">{((state.aggregated_amount / total) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
