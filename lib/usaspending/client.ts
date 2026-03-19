const USA_SPENDING_BASE = "https://api.usaspending.gov/api/v2";
const DOD_AGENCY_CODE = "097";

export async function getUSASpending<T>(
  path: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const { revalidate = 3600, ...fetchOptions } = options ?? {};
  const url = `${USA_SPENDING_BASE}${path}`;

  const res = await fetch(url, {
    ...fetchOptions,
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`USASpending API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function postUSASpending<T>(
  path: string,
  body: unknown,
  revalidate = 3600
): Promise<T> {
  const url = `${USA_SPENDING_BASE}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`USASpending API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export { DOD_AGENCY_CODE };
