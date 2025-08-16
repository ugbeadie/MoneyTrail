"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryStats } from "@/lib/actions";

interface StatsChartProps {
  data: CategoryStats[];
  type: "income" | "expense";
}

// Color palette matching the image
const COLORS = [
  "#ef4444", // red - Food
  "#f97316", // orange - Transport
  "#eab308", // yellow - Other
  "#facc15", // yellow - Beauty
  "#22c55e", // green - Health
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function StatsChart({ data, type }: StatsChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    displayCategory: item.category,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.displayCategory}</p>
          <p className="text-sm text-muted-foreground">
            ₦{data.amount.toLocaleString()} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    // Only show labels for segments 2% and above
    if (percent < 0.02) return null;

    const RADIAN = Math.PI / 180;

    // Reduced threshold - more categories will appear inside the chart
    const isSmallSegment = percent < 0.04; // Reduced from 0.08 to 0.04 (4% threshold)

    if (isSmallSegment) {
      // Position for small segments - outside the chart with connecting line
      const innerRadius2 = outerRadius + 5;
      const outerRadius2 = outerRadius + 40;

      const innerPoint = {
        x: cx + innerRadius2 * Math.cos(-midAngle * RADIAN),
        y: cy + innerRadius2 * Math.sin(-midAngle * RADIAN),
      };

      const outerPoint = {
        x: cx + outerRadius2 * Math.cos(-midAngle * RADIAN),
        y: cy + outerRadius2 * Math.sin(-midAngle * RADIAN),
      };

      // Adjust label position based on which side of the chart
      const isRightSide = outerPoint.x > cx;
      const labelX = isRightSide ? outerPoint.x + 5 : outerPoint.x - 5;
      const labelY = outerPoint.y;

      // Get category name with emoji preserved
      const categoryName = chartData[index]?.displayCategory || "";

      return (
        <g key={`external-label-${index}`}>
          {/* Connecting line */}
          <polyline
            points={`${innerPoint.x},${innerPoint.y} ${outerPoint.x},${outerPoint.y} ${labelX},${labelY}`}
            stroke="hsl(var(--foreground))"
            strokeWidth={1.5}
            fill="none"
            opacity={0.6}
          />
          {/* Label text */}
          <text
            x={labelX}
            y={labelY}
            fill="hsl(var(--foreground))"
            textAnchor={isRightSide ? "start" : "end"}
            dominantBaseline="central"
            fontSize={11}
            fontWeight="bold"
          >
            <tspan x={labelX} dy="-6">
              {categoryName}
            </tspan>
            <tspan x={labelX} dy="12">{`${(percent * 100).toFixed(0)}%`}</tspan>
          </text>
        </g>
      );
    } else {
      // Position for large segments - inside the chart
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      // Get category name with emoji preserved
      const categoryName = chartData[index]?.displayCategory || "";

      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
        >
          <tspan x={x} dy="-6">
            {categoryName}
          </tspan>
          <tspan x={x} dy="12">{`${(percent * 100).toFixed(0)}%`}</tspan>
        </text>
      );
    }
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 30, right: 100, bottom: 30, left: 100 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={140}
            fill="#8884d8"
            dataKey="amount"
            stroke="transparent"
            strokeWidth={0}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                strokeWidth={0}
                style={{ outline: "none" }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Enhanced CSS to completely remove focus outline and borders */}
      <style jsx global>{`
        .recharts-pie-sector {
          outline: none !important;
          stroke: transparent !important;
          stroke-width: 0 !important;
        }
        .recharts-pie-sector:focus {
          outline: none !important;
          stroke: transparent !important;
          stroke-width: 0 !important;
        }
        .recharts-pie-sector:focus-visible {
          outline: none !important;
          stroke: transparent !important;
          stroke-width: 0 !important;
        }
        .recharts-pie-sector:active {
          outline: none !important;
          stroke: transparent !important;
          stroke-width: 0 !important;
        }
        .recharts-pie {
          outline: none !important;
        }
        .recharts-pie path {
          outline: none !important;
          stroke: transparent !important;
          stroke-width: 0 !important;
        }
        .recharts-pie path:focus {
          outline: none !important;
          stroke: transparent !important;
          stroke-width: 0 !important;
        }
      `}</style>
    </div>
  );
}
