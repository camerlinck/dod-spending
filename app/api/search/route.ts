import { NextRequest, NextResponse } from "next/server";
import { parseFY, fyDateRange } from "@/lib/fiscal-year";

const USA_SPENDING_BASE = "https://api.usaspending.gov/api/v2";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const sort = searchParams.get("sort") ?? "Award Amount";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";
  const fy = parseFY(searchParams.get("fy") ?? undefined);
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], page_metadata: { hasNext: false } });
  }

  const body = {
    filters: {
      agencies: [{ type: "awarding", tier: "toptier", name: "Department of Defense" }],
      time_period: [fyDateRange(fy)],
      award_type_codes: ["A", "B", "C", "D"],
      keywords: [q],
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
      "Contract Award Type",
    ],
    sort,
    order,
    limit: 25,
    page,
  };

  try {
    const res = await fetch(`${USA_SPENDING_BASE}/search/spending_by_award/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
