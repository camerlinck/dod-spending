"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/usaspending/formatters";

interface DataPoint {
  year: string;
  obligations: number;
  outlays: number;
  budget_authority: number;
}

interface SpendingTrendChartProps {
  data: DataPoint[];
}

function formatYAxis(value: number) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  return `$${value}`;
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
        <defs>
          <linearGradient id="obligations" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="outlays" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} width={70} />
        <Tooltip
          formatter={(value, name) => {
            const label = name === "obligations" ? "Obligations" : name === "outlays" ? "Outlays" : "Budget Authority";
            return [formatCurrency(Number(value ?? 0), true), label];
          }}
          contentStyle={{ fontSize: 13 }}
        />
        <Legend formatter={(value) => value === "obligations" ? "Obligations" : value === "outlays" ? "Outlays" : "Budget Authority"} />
        <Area type="monotone" dataKey="budget_authority" stroke="#94a3b8" fill="none" strokeDasharray="4 2" dot={false} />
        <Area type="monotone" dataKey="obligations" stroke="#3b82f6" fill="url(#obligations)" dot={false} />
        <Area type="monotone" dataKey="outlays" stroke="#10b981" fill="url(#outlays)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
