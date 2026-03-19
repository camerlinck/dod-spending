import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { postUSASpending } from "@/lib/usaspending/client";
import { SpendingByCategoryResponse } from "@/lib/usaspending/types";
import { formatCurrency } from "@/lib/usaspending/formatters";
import { getConfig, PSC_GROUP_LABELS, type ObjectClassConfig } from "@/lib/categories/config";
import { parseFY, fyDateRange } from "@/lib/fiscal-year";

function buildPscFilter(config: ObjectClassConfig) {
  if (config.pscGroupFilter) {
    return { require: [[config.pscType, config.pscGroupFilter]] };
  }
  return { require: [[config.pscType]] };
}

function getPscGroupKey(code: string): string {
  const first = code[0].toUpperCase();
  const second = code[1]?.toUpperCase() ?? "";
  // Products: start with digit → 2-char FSG (e.g. "15xx")
  if (first >= "0" && first <= "9") return code.slice(0, 2);
  // R&D: "A" followed by a letter → 2-char group (e.g. "ACxx")
  if (first === "A" && second >= "A" && second <= "Z") return code.slice(0, 2).toUpperCase();
  // 7x IT services: "7" followed by a letter → 2-char group (e.g. "7Axx")
  if (first === "7" && second >= "A" && second <= "Z") return code.slice(0, 2).toUpperCase();
  // All other services: single-letter group (e.g. "R706" → "R")
  return first;
}

// Groups PSC results by their group prefix
function groupByPscGroup(
  results: SpendingByCategoryResponse["results"]
): { group: string; label: string; amount: number; codes: typeof results }[] {
  const map = new Map<string, { amount: number; codes: typeof results }>();

  for (const r of results) {
    const groupKey = getPscGroupKey(r.code);
    const existing = map.get(groupKey);
    if (existing) {
      existing.amount += r.amount;
      existing.codes.push(r);
    } else {
      map.set(groupKey, { amount: r.amount, codes: [r] });
    }
  }

  return [...map.entries()]
    .map(([group, data]) => ({
      group,
      label: PSC_GROUP_LABELS[group] ?? group,
      amount: data.amount,
      codes: data.codes.sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => b.amount - a.amount);
}

async function getPscData(config: ObjectClassConfig, fy: number) {
  const { start, end } = fyDateRange(fy);
  const data = await postUSASpending<SpendingByCategoryResponse>(
    "/search/spending_by_category/psc/",
    {
      filters: {
        agencies: [{ type: "awarding", tier: "toptier", name: "Department of Defense" }],
        time_period: [{ start_date: start, end_date: end }],
        psc_codes: buildPscFilter(config),
      },
      limit: 100,
      page: 1,
    },
    14400
  );
  return data;
}

export default async function CategoryDrillDownPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fy?: string }>;
}) {
  const { slug } = await params;
  const { fy: fyParam } = await searchParams;
  const fy = parseFY(fyParam);
  const config = getConfig(slug);

  if (!config) notFound();

  if (!config.drillable) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/categories" className="text-sm text-muted-foreground hover:underline">
            ← Spending Categories
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-2">{config.label}</h1>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle className="text-base">No PSC Drill-Down Available</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{config.explanation}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = await getPscData(config, fy);
  const groups = groupByPscGroup(data.results);
  const grandTotal = groups.reduce((s, g) => s + g.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/categories?fy=${fy}`} className="text-sm text-muted-foreground hover:underline">
          ← Spending Categories
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-2">{config.label}</h1>
        <p className="text-muted-foreground mt-1">
          FY{fy} · {formatCurrency(grandTotal, true)} across {data.results.length} PSC codes ·{" "}
          {config.pscType} contracts
        </p>
      </div>

      {/* PSC Group summary */}
      <Card>
        <CardHeader>
          <CardTitle>By PSC Group</CardTitle>
          <CardDescription>
            PSC codes are grouped by their 2-character category prefix. Click a group to expand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PSC Group</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Obligations</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead className="text-right"># Codes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((g) => (
                <TableRow key={g.group}>
                  <TableCell className="font-medium">{g.label}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {g.group}xx
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(g.amount, true)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {((g.amount / grandTotal) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {g.codes.length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Individual PSC codes per group */}
      {groups.map((g) => (
        <Card key={g.group}>
          <CardHeader>
            <CardTitle className="text-base">
              {g.label}{" "}
              <Badge variant="outline" className="font-mono ml-2">
                {g.group}xx
              </Badge>
            </CardTitle>
            <CardDescription>
              {formatCurrency(g.amount, true)} total · {g.codes.length} PSC codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PSC Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Obligations</TableHead>
                  <TableHead className="text-right">Share of Group</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {g.codes.map((code) => (
                  <TableRow key={code.code}>
                    <TableCell>
                      <Link href={`/categories/${slug}/${code.code.toLowerCase()}?fy=${fy}`}>
                        <Badge variant="secondary" className="font-mono hover:bg-blue-100 cursor-pointer">
                          {code.code}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/categories/${slug}/${code.code.toLowerCase()}?fy=${fy}`}
                        className="hover:underline hover:text-blue-600"
                      >
                        {code.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(code.amount, true)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {((code.amount / g.amount) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
