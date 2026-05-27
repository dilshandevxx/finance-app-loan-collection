"use client";

import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";

const data = [
  { name: "Mon", expected: 400, collected: 240 },
  { name: "Tue", expected: 300, collected: 139 },
  { name: "Wed", expected: 200, collected: 980 },
  { name: "Thu", expected: 278, collected: 390 },
  { name: "Fri", expected: 189, collected: 480 },
  { name: "Sat", expected: 239, collected: 380 },
  { name: "Sun", expected: 349, collected: 430 },
];

export function AnalyticsChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[250px] w-full animate-pulse bg-gray-100 dark:bg-[#111] rounded-xl"></div>;

  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#222222" : "#f0f0f0";
  const textColor = isDark ? "rgba(255,255,255,0.5)" : "#6b7280";

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isDark ? "#ffffff" : "#000000"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isDark ? "#ffffff" : "#000000"} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#111' : '#fff',
              borderRadius: '12px',
              border: isDark ? '1px solid #333' : '1px solid #eaeaea',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              color: isDark ? '#fff' : '#000'
            }}
            itemStyle={{ color: isDark ? '#fff' : '#000' }}
          />
          <Area 
            type="monotone" 
            dataKey="expected" 
            stroke="#8884d8" 
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorExpected)" 
            name="Expected"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="collected" 
            stroke={isDark ? "#ffffff" : "#000000"} 
            fillOpacity={1} 
            fill="url(#colorCollected)" 
            name="Collected"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
