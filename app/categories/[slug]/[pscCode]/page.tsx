import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { postUSASpending } from "@/lib/usaspending/client";
import { formatCurrency } from "@/lib/usaspending/formatters";
import { getConfig, pscFilterPath, PSC_GROUP_LABELS } from "@/lib/categories/config";
import { parseFY, fyDateRange } from "@/lib/fiscal-year";

const PAGE_SIZE = 25;

interface ContractResult {
  internal_id: number;
  generated_internal_id: string;
  "Award ID": string;
  "Recipient Name": string;
  "Award Amount": number;
  "Start Date": string;
  "End Date": string;
  "Awarding Sub Agency": string;
  Description: string;
  "Place of Performance State Code": string | null;
}

interface ContractResponse {
  results: ContractResult[];
  page_metadata: {
    page: number;
    hasNext: boolean;
    last_record_unique_id?: number;
    last_record_sort_value?: string;
  };
}

export default async function PscContractsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; pscCode: string }>;
  searchParams: Promise<{ page?: string; fy?: string }>;
}) {
  const { slug, pscCode } = await params;
  const { page: pageStr, fy: fyParam } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const fy = parseFY(fyParam);

  const config = getConfig(slug);
  if (!config || !config.drillable) notFound();

  const upperCode = pscCode.toUpperCase();
  const filterPath = pscFilterPath(upperCode);
  const groupCode = upperCode.length >= 2 ? upperCode.slice(0, filterPath[1].length) : upperCode;
  const groupLabel = PSC_GROUP_LABELS[groupCode] ?? groupCode;

  let data: ContractResponse;
  let apiError: string | null = null;
  try {
    data = await postUSASpending<ContractResponse>(
      "/search/spending_by_award/",
      {
        filters: {
          agencies: [{ type: "awarding", tier: "toptier", name: "Department of Defense" }],
          time_period: [fyDateRange(fy)],
          psc_codes: { require: [filterPath] },
          award_type_codes: ["A", "B", "C", "D"],
        },
        fields: [
          "Award ID",
          "Recipient Name",
          "Award Amount",
          "Start Date",
          "End Date",
          "Awarding Sub Agency",
          "Description",
          "Place of Performance State Code",
        ],
        sort: "Award Amount",
        order: "desc",
        limit: PAGE_SIZE,
        page,
      },
      3600
    );
  } catch (e) {
    apiError = e instanceof Error ? e.message : "Unknown error";
    data = { results: [], page_metadata: { page, hasNext: false } };
  }

  const contracts = data.results;
  const hasNext = data.page_metadata.hasNext;

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>API error:</strong> {apiError}
        </div>
      )}
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
        <Link href={`/categories?fy=${fy}`} className="hover:underline">Spending Categories</Link>
        <span>›</span>
        <Link href={`/categories/${slug}?fy=${fy}`} className="hover:underline">{config.label}</Link>
        <span>›</span>
        <span className="font-mono text-foreground">{upperCode}</span>
      </div>

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight font-mono">{upperCode}</h1>
          <Badge variant="outline" className="text-sm">{groupLabel}</Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          FY{fy} contracts · sorted by award amount · DoD only
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>
            Showing page {page} · {PAGE_SIZE} per page
            {hasNext ? "" : " (last page)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No contracts found for this PSC code in FY{fy}.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Award ID</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sub-Agency</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((c) => (
                  <TableRow key={c.internal_id}>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {c["Award ID"]}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium max-w-[160px]">
                      <span className="line-clamp-2" title={c["Recipient Name"]}>{c["Recipient Name"]}</span>
                    </TableCell>
                    <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                      <span className="line-clamp-2" title={c.Description?.replace(/IGF::[A-Z]+::[A-Z]+\s*/g, "") || undefined}>
                        {c.Description?.replace(/IGF::[A-Z]+::[A-Z]+\s*/g, "") || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm max-w-[140px]">
                      <span className="line-clamp-2" title={c["Awarding Sub Agency"]}>{c["Awarding Sub Agency"]}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {c["Place of Performance State Code"] ? (
                        <Badge variant="outline" className="text-xs">{c["Place of Performance State Code"]}</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono whitespace-nowrap">
                      {formatCurrency(c["Award Amount"], true)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {c["Start Date"]?.slice(0, 7)} –<br />{c["End Date"]?.slice(0, 7)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {(page > 1 || hasNext) && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div>
                {page > 1 && (
                  <Link
                    href={`/categories/${slug}/${pscCode}?page=${page - 1}&fy=${fy}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ← Previous
                  </Link>
                )}
              </div>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <div>
                {hasNext && (
                  <Link
                    href={`/categories/${slug}/${pscCode}?page=${page + 1}&fy=${fy}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
