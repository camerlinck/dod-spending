"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DEFAULT_FISCAL_YEAR } from "@/lib/fiscal-year";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/usaspending/formatters";


interface ContractResult {
  internal_id: number;
  "Award ID": string;
  "Recipient Name": string;
  "Award Amount": number;
  "Start Date": string;
  "End Date": string;
  "Awarding Sub Agency": string;
  Description: string | null;
  "Place of Performance State Code": string | null;
  "Contract Award Type": string | null;
}

type SortField = "Award Amount" | "Start Date" | "End Date";

function ResultsSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function SortHeader({
  label,
  field,
  current,
  order,
  onSort,
}: {
  label: string;
  field: SortField;
  current: SortField;
  order: "asc" | "desc";
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1 justify-end">
        {label}
        {active ? (order === "desc" ? " ↓" : " ↑") : " ↕"}
      </span>
    </TableHead>
  );
}

function SearchPageInner() {
  const urlSearchParams = useSearchParams();
  const fy = parseInt(urlSearchParams.get("fy") ?? String(DEFAULT_FISCAL_YEAR), 10);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>("Award Amount");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [results, setResults] = useState<ContractResult[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const fetchResults = useCallback(async () => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: debouncedQuery,
        page: String(page),
        sort,
        order,
        fy: String(fy),
      });
      const res = await fetch(`/api/search?${params}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results ?? []);
      setHasNext(data.page_metadata?.hasNext ?? false);
      setSearched(true);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError("Search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, sort, order]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function handleSort(field: SortField) {
    if (field === sort) {
      setOrder((o) => (o === "desc" ? "asc" : "desc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contract Search</h1>
        <p className="text-muted-foreground mt-1">
          Search FY{fy} DoD contracts by keyword, contractor name, or description.
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "F-35", "Lockheed Martin", "cybersecurity", "ammunition"'
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            Searching…
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {searched && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {results.length === 0
                ? `No contracts found for "${debouncedQuery}"`
                : `Showing page ${page} for "${debouncedQuery}" · sorted by ${sort} ${order === "desc" ? "↓" : "↑"}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ResultsSkeleton />
            ) : results.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                Try a different keyword — search matches contract descriptions and recipient names.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Award ID</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Sub-Agency</TableHead>
                      <TableHead>State</TableHead>
                      <SortHeader label="Amount" field="Award Amount" current={sort} order={order} onSort={handleSort} />
                      <SortHeader label="Start" field="Start Date" current={sort} order={order} onSort={handleSort} />
                      <SortHeader label="End" field="End Date" current={sort} order={order} onSort={handleSort} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((c) => (
                      <TableRow key={c.internal_id}>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {c["Award ID"]}
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px]">
                          <span className="line-clamp-2" title={c["Recipient Name"]}>{c["Recipient Name"]}</span>
                        </TableCell>
                        <TableCell className="max-w-[240px] text-sm text-muted-foreground">
                          <span className="line-clamp-2" title={c.Description?.replace(/IGF::[A-Z]+::[A-Z]+\s*/g, "") || undefined}>
                            {c.Description?.replace(/IGF::[A-Z]+::[A-Z]+\s*/g, "") || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm max-w-[140px]">
                          <span className="line-clamp-2" title={c["Awarding Sub Agency"]}>{c["Awarding Sub Agency"]}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {c["Place of Performance State Code"] ? (
                            <Badge variant="outline" className="text-xs">
                              {c["Place of Performance State Code"]}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono whitespace-nowrap">
                          {formatCurrency(c["Award Amount"], true)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {c["Start Date"]?.slice(0, 7) ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {c["End Date"]?.slice(0, 7) ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-sm text-blue-600 hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-muted-foreground">Page {page}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNext}
                    className="text-sm text-blue-600 hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!searched && !loading && (
        <div className="text-sm text-muted-foreground space-y-1 pt-2">
          <p className="font-medium text-foreground">Try searching for:</p>
          {["F-35", "Lockheed Martin", "cybersecurity", "ammunition", "TRICARE", "submarine", "drone"].map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="mr-2 mb-1 inline-block px-2 py-1 rounded bg-muted hover:bg-muted/80 text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
