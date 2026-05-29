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
const COLORS = ["#3A5A40", "#C25946", "#D4A373", "#588157", "#E76F51", "#344E41", "#E9C46A"];

export function AnalyticsChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="h-[200px] w-full animate-pulse bg-secondary rounded-2xl" />;

  const isDark = resolvedTheme === "dark";
  const textColor  = isDark ? "#95918B" : "#797672";
  const gridColor  = isDark ? "#33302E" : "#E6E2D8";
  const tooltipBg  = isDark ? "#252322" : "#ffffff";
  const tooltipBdr = isDark ? "#33302E" : "#E6E2D8";

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
              color: isDark ? "#EFECE6" : "#2D2B2A",
              fontSize: 12,
            }}
            itemStyle={{ color: isDark ? "#EFECE6" : "#2D2B2A" }}
            cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
          />
          {/* Expected – muted tint */}
          <Bar dataKey="expected" name="Expected" radius={[8, 8, 4, 4]} fill={isDark ? "#33302E" : "#E6E2D8"} />
          {/* Collected – vibrant cycling colors */}
          <Bar dataKey="collected" name="Collected" radius={[8, 8, 4, 4]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
