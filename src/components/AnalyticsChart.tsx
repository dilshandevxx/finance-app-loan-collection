"use client";

import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";

const data = [
  { name: "Mon", collected: 240, expected: 400 },
  { name: "Tue", collected: 139, expected: 300 },
  { name: "Wed", collected: 380, expected: 200 },
  { name: "Thu", collected: 390, expected: 278 },
  { name: "Fri", collected: 480, expected: 189 },
  { name: "Sat", collected: 380, expected: 239 },
  { name: "Sun", collected: 430, expected: 349 },
];

// Vibrant bar colors cycling through the vibe palette
const COLORS = ["#7c6dbf", "#e05470", "#6ab4e8", "#e8849a", "#7c6dbf", "#e05470", "#6ab4e8"];

export function AnalyticsChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="h-[200px] w-full animate-pulse bg-secondary rounded-2xl" />;

  const isDark = resolvedTheme === "dark";
  const textColor  = isDark ? "#9e99c8" : "#6b6899";
  const gridColor  = isDark ? "#2e2a4a" : "#e2dff5";
  const tooltipBg  = isDark ? "#1e1a36" : "#ffffff";
  const tooltipBdr = isDark ? "#2e2a4a" : "#e2dff5";

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }} barSize={18} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 11 }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 11 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              borderRadius: "16px",
              border: `1px solid ${tooltipBdr}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              color: isDark ? "#f0eeff" : "#13102a",
              fontSize: 12,
            }}
            itemStyle={{ color: isDark ? "#f0eeff" : "#13102a" }}
            cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
          />
          {/* Expected – muted tint */}
          <Bar dataKey="expected" name="Expected" radius={[8, 8, 4, 4]} fill={isDark ? "#2a2548" : "#ede9fc"} />
          {/* Collected – vibrant cycling colors */}
          <Bar dataKey="collected" name="Collected" radius={[8, 8, 4, 4]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
