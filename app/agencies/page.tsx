import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUSASpending, DOD_AGENCY_CODE } from "@/lib/usaspending/client";
import { SubAgencyResponse } from "@/lib/usaspending/types";
import { formatCurrency, formatNumber } from "@/lib/usaspending/formatters";
import { parseFY } from "@/lib/fiscal-year";

export default async function AgenciesPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
  const { fy: fyParam } = await searchParams;
  const fy = parseFY(fyParam);

  const data = await getUSASpending<SubAgencyResponse>(
    `/agency/${DOD_AGENCY_CODE}/sub_agency/?fiscal_year=${fy}&limit=50`,
    { revalidate: 14400 }
  );

  const agencies = data.results.sort((a, b) => b.total_obligations - a.total_obligations);
  const total = agencies.reduce((s, a) => s + a.total_obligations, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">DoD Sub-Agencies</h1>
        <p className="text-muted-foreground mt-1">FY{fy} obligations by Department of Defense component</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sub-Agency Obligations</CardTitle>
          <CardDescription>{agencies.length} components · {formatCurrency(total, true)} total obligations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead className="text-right">Obligations</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead className="text-right">New Awards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencies.map((agency) => (
                <TableRow key={agency.name}>
                  <TableCell>
                    <div className="font-medium">{agency.name}</div>
                    {agency.abbreviation && <div className="text-xs text-muted-foreground">{agency.abbreviation}</div>}
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(agency.total_obligations, true)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono text-xs">{((agency.total_obligations / total) * 100).toFixed(1)}%</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatNumber(agency.new_award_count)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
