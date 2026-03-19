"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/usaspending/formatters";

interface ObjectClassData {
  name: string;
  value: number;
  slug?: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#6366f1"];

interface Props {
  data: ObjectClassData[];
  layout?: "stacked" | "side";
}

export function ObjectClassDonut({ data, layout = "side" }: Props) {
  const router = useRouter();
  const total = data.reduce((s, d) => s + d.value, 0);

  function handleClick(entry: ObjectClassData) {
    if (entry.slug) router.push(`/categories/${entry.slug}`);
  }

  const pie = (
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={layout === "stacked" ? 55 : 81}
      outerRadius={layout === "stacked" ? 90 : 127}
      dataKey="value"
      paddingAngle={2}
      onClick={(entry) => handleClick(entry as ObjectClassData)}
    >
      {data.map((entry, i) => (
        <Cell
          key={i}
          fill={COLORS[i % COLORS.length]}
          style={{ cursor: entry.slug ? "pointer" : "default" }}
          opacity={entry.slug ? 1 : 0.6}
        />
      ))}
    </Pie>
  );

  const tooltip = (
    <Tooltip
      formatter={(value, name) => {
        const v = Number(value ?? 0);
        return [`${formatCurrency(v, true)} (${((v / total) * 100).toFixed(1)}%)`, name];
      }}
      contentStyle={{ fontSize: 12 }}
    />
  );

  if (layout === "stacked") {
    return (
      <div className="flex flex-col gap-3">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>{pie}{tooltip}</PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {data.map((entry, i) => (
            <button
              key={entry.name}
              onClick={() => handleClick(entry)}
              disabled={!entry.slug}
              className="flex items-center gap-1.5 text-left disabled:cursor-default group"
            >
              <span
                className="shrink-0 w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: COLORS[i % COLORS.length], opacity: entry.slug ? 1 : 0.6 }}
              />
              <span className={`text-xs font-bold leading-tight ${entry.slug ? "group-hover:underline" : "opacity-60"}`}>
                {entry.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // side layout (original)
  return (
    <ResponsiveContainer width="100%" height={345}>
      <PieChart>
        {pie}
        {tooltip}
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value: string, entry) => {
            const item = data.find((d) => d.name === value);
            return (
              <span style={{ fontSize: 21, fontWeight: 700, opacity: item?.slug ? 1 : 0.6 }}>
                {value}{item?.slug ? " →" : ""}
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
