import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUSASpending, DOD_AGENCY_CODE } from "@/lib/usaspending/client";
import { FederalAccountResponse } from "@/lib/usaspending/types";
import { formatCurrency } from "@/lib/usaspending/formatters";
import { parseFY } from "@/lib/fiscal-year";

export default async function AccountsPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
  const { fy: fyParam } = await searchParams;
  const fy = parseFY(fyParam);

  const data = await getUSASpending<FederalAccountResponse>(
    `/agency/${DOD_AGENCY_CODE}/federal_account/?fiscal_year=${fy}&limit=50&page=1`,
    { revalidate: 14400 }
  );

  const accounts = data.results.sort((a, b) => b.obligated_amount - a.obligated_amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Federal Accounts</h1>
        <p className="text-muted-foreground mt-1">
          FY{fy} DoD appropriation accounts — top 50 by obligations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appropriation Accounts</CardTitle>
          <CardDescription>
            {data.count} total accounts · showing top {accounts.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Number</TableHead>
                <TableHead className="text-right">Obligated</TableHead>
                <TableHead className="text-right">Outlays</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((acct) => (
                <TableRow key={acct.id}>
                  <TableCell className="font-medium max-w-xs">
                    <span className="line-clamp-2" title={acct.name}>{acct.name}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {acct.account_number}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(acct.obligated_amount, true)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {formatCurrency(acct.gross_outlay_amount, true)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
