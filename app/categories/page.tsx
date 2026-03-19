import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ObjectClassDonut } from "@/components/charts/ObjectClassDonut";
import { getUSASpending, DOD_AGENCY_CODE } from "@/lib/usaspending/client";
import { ObjectClassResponse } from "@/lib/usaspending/types";
import { formatCurrency } from "@/lib/usaspending/formatters";
import { OBJECT_CLASS_CONFIGS } from "@/lib/categories/config";
import { parseFY } from "@/lib/fiscal-year";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
  const { fy: fyParam } = await searchParams;
  const fy = parseFY(fyParam);

  const data = await getUSASpending<ObjectClassResponse>(
    `/agency/${DOD_AGENCY_CODE}/object_class/?fiscal_year=${fy}`,
    { revalidate: 14400 }
  );

  const classes = data.results
    .filter((o) => o.obligated_amount > 0)
    .sort((a, b) => b.obligated_amount - a.obligated_amount);

  const total = classes.reduce((s, o) => s + o.obligated_amount, 0);

  const donutData = classes.slice(0, 8).map((o) => {
    const config = OBJECT_CLASS_CONFIGS.find(
      (c) => c.label.toLowerCase() === o.name.toLowerCase()
    );
    return {
      name: o.name,
      value: o.obligated_amount,
      slug: config?.drillable ? config.slug : undefined,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Spending Categories</h1>
        <p className="text-muted-foreground mt-1">
          FY{fy} DoD spending by category. Click a category to explore the breakdown by
          what was actually purchased (Product &amp; Service Code).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown by Category</CardTitle>
          <CardDescription>Top 8 object classes by obligation amount</CardDescription>
        </CardHeader>
        <CardContent>
          <ObjectClassDonut data={donutData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Object Classes</CardTitle>
          <CardDescription>
            {formatCurrency(total, true)} total obligated ·{" "}
            <span className="text-muted-foreground">
              Obligations = funds committed; Outlays = cash actually disbursed in FY{fy}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Obligated</TableHead>
                <TableHead className="text-right">Outlayed (actual spend)</TableHead>
                <TableHead className="text-right">Unspent gap</TableHead>
                <TableHead className="text-right">Share of obligations</TableHead>
                <TableHead className="text-right">Drill-down</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((oc) => {
                const config = OBJECT_CLASS_CONFIGS.find(
                  (c) => c.label.toLowerCase() === oc.name.toLowerCase()
                );
                const gap = oc.obligated_amount - oc.gross_outlay_amount;
                return (
                  <TableRow key={oc.name}>
                    <TableCell className="font-medium">{oc.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(oc.obligated_amount, true)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(oc.gross_outlay_amount, true)}
                    </TableCell>
                    <TableCell className={`text-right font-mono text-sm ${gap > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                      {gap > 0 ? `+${formatCurrency(gap, true)}` : formatCurrency(gap, true)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {((oc.obligated_amount / total) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {config?.drillable ? (
                        <Link
                          href={`/categories/${config.slug}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          PSC breakdown →
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">Direct spending</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-base">About These Categories</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Drillable categories</strong> (Equipment, Supplies, R&D, Services, O&amp;M) represent
            contract spending. Each contract has a Product &amp; Service Code (PSC) that identifies what was
            purchased — from "Aircraft, Fixed Wing" to "Guided Missiles" to "Managed Healthcare." Click
            "PSC breakdown" to explore.
          </p>
          <p>
            <strong>Direct spending categories</strong> (Benefits for Former Personnel, Military Personnel
            Pay, Civilian Pay) are mandatory appropriations paid directly to individuals — not contracts.
            No PSC codes are assigned. These account for ~$500B of the DoD budget.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
