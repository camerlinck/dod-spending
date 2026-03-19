"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/usaspending/formatters";

interface AgencyData {
  name: string;
  value: number;
  color?: string;
  [key: string]: unknown;
}

const COLORS = [
  "#1d4ed8", "#1e40af", "#1e3a8a",
  "#0e7490", "#0369a1", "#075985",
  "#4f46e5", "#4338ca", "#3730a3",
  "#7c3aed", "#6d28d9", "#5b21b6",
];

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, index = 0, name, value }: CustomContentProps) {
  const color = COLORS[index % COLORS.length];
  const showLabel = width > 60 && height > 30;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill: color, stroke: "#fff", strokeWidth: 2 }}
        rx={3}
      />
      {showLabel && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
            {name?.length ?? 0 > 20 ? name?.slice(0, 18) + "…" : name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#e2e8f0" fontSize={10}>
            {formatCurrency(value ?? 0, true)}
          </text>
        </>
      )}
    </g>
  );
}

export function AgencyTreemap({ data }: { data: AgencyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <Treemap
        data={data}
        dataKey="value"
        content={<CustomContent />}
      >
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value ?? 0), true), "Obligations"]}
          contentStyle={{ fontSize: 13 }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
