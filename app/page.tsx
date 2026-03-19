import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { AgencyTreemap } from "@/components/charts/AgencyTreemap";
import { ObjectClassDonut } from "@/components/charts/ObjectClassDonut";
import { getUSASpending, DOD_AGENCY_CODE } from "@/lib/usaspending/client";
import type { AgencyBudgetaryResourcesResponse, SubAgencyResponse, ObjectClassResponse } from "@/lib/usaspending/types";
import { deltaPercent } from "@/lib/usaspending/formatters";
import { parseFY } from "@/lib/fiscal-year";
import { OBJECT_CLASS_CONFIGS } from "@/lib/categories/config";

async function DashboardStats({ fy }: { fy: number }) {
  const data = await getUSASpending<AgencyBudgetaryResourcesResponse>(
    `/agency/${DOD_AGENCY_CODE}/budgetary_resources/?fiscal_year=${fy}`,
    { revalidate: 86400 }
  );
  const current = data.agency_data_by_year.find((d) => d.fiscal_year === fy);
  const previous = data.agency_data_by_year.find((d) => d.fiscal_year === fy - 1);
  if (!current) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title={`FY${fy} Budget Resources`} amount={current.total_budgetary_resources} delta={previous ? deltaPercent(current.total_budgetary_resources, previous.total_budgetary_resources) : undefined} subtitle="Total budgetary resources" />
      <StatCard title={`FY${fy} DoD Budget Auth`} amount={current.agency_budgetary_resources} delta={previous ? deltaPercent(current.agency_budgetary_resources, previous.agency_budgetary_resources) : undefined} subtitle="DoD-specific budget authority" />
      <StatCard title={`FY${fy} Obligations`} amount={current.agency_total_obligated} delta={previous ? deltaPercent(current.agency_total_obligated, previous.agency_total_obligated) : undefined} subtitle="Funds committed" />
      <StatCard title={`FY${fy} Outlays`} amount={current.agency_total_outlayed} delta={previous ? deltaPercent(current.agency_total_outlayed, previous.agency_total_outlayed) : undefined} subtitle="Funds disbursed" />
    </div>
  );
}

async function TrendSection({ fy }: { fy: number }) {
  const data = await getUSASpending<AgencyBudgetaryResourcesResponse>(
    `/agency/${DOD_AGENCY_CODE}/budgetary_resources/?fiscal_year=${fy}`,
    { revalidate: 86400 }
  );
  const chartData = data.agency_data_by_year
    .filter((d) => d.fiscal_year >= 2017)
    .sort((a, b) => a.fiscal_year - b.fiscal_year)
    .map((d) => ({ year: `FY${d.fiscal_year}`, obligations: d.agency_total_obligated, outlays: d.agency_total_outlayed, budget_authority: d.agency_budgetary_resources }));
  return <SpendingTrendChart data={chartData} />;
}

async function AgencySection({ fy }: { fy: number }) {
  const data = await getUSASpending<SubAgencyResponse>(
    `/agency/${DOD_AGENCY_CODE}/sub_agency/?fiscal_year=${fy}&limit=15`,
    { revalidate: 14400 }
  );
  const treemapData = data.results.filter((a) => a.total_obligations > 0).map((a) => ({ name: a.name, value: a.total_obligations }));
  return <AgencyTreemap data={treemapData} />;
}

async function ObjectClassSection({ fy }: { fy: number }) {
  const data = await getUSASpending<ObjectClassResponse>(
    `/agency/${DOD_AGENCY_CODE}/object_class/?fiscal_year=${fy}`,
    { revalidate: 14400 }
  );
  const donutData = data.results
    .filter((o) => o.obligated_amount > 0)
    .sort((a, b) => b.obligated_amount - a.obligated_amount)
    .slice(0, 8)
    .map((o) => {
      const config = OBJECT_CLASS_CONFIGS.find((c) => c.label.toLowerCase() === o.name.toLowerCase());
      return { name: o.name, value: o.obligated_amount, slug: config?.drillable ? config.slug : undefined };
    });
  return <ObjectClassDonut data={donutData} layout="stacked" />;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ fy?: string }> }) {
  const { fy: fyParam } = await searchParams;
  const fy = parseFY(fyParam);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Department of Defense Spending</h1>
        <p className="text-muted-foreground mt-1">Explore DoD budget, obligations, and contracts. Data from USASpending.gov.</p>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}</div>}>
        <DashboardStats fy={fy} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending Over Time</CardTitle>
            <CardDescription>DoD budget authority, obligations, and outlays FY2017–{fy}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
              <TrendSection fy={fy} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Spending Category</CardTitle>
            <CardDescription>FY{fy} obligations by spending category</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
              <ObjectClassSection fy={fy} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending by Sub-Agency</CardTitle>
          <CardDescription>FY{fy} obligations by Army, Navy, Air Force, and other DoD components</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <AgencySection fy={fy} />
          </Suspense>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Data sourced from USASpending.gov · Department of Defense (Agency Code 097) · FY{fy}
      </div>
    </div>
  );
}
