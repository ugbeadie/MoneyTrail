"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryStats } from "@/lib/actions";
import { useEffect, useState } from "react";

interface StatsChartProps {
  data: CategoryStats[];
  onCategoryClick?: (category: string) => void;
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

export function TransactionChart({ data, onCategoryClick }: StatsChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector(".chart-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const chartData = data.map((item, index) => ({
    ...item,
    displayCategory: item.category,
    color: COLORS[index % COLORS.length],
  }));

  // Calculate cumulative angles for proper line alignment
  let cumulativeAngle = 0;
  const segmentData = chartData.map((item) => {
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + (item.percentage / 100) * 360;
    const midAngle = (startAngle + endAngle) / 2;
    cumulativeAngle = endAngle;

    return {
      ...item,
      startAngle,
      endAngle,
      midAngle,
    };
  });

  const chartSettings = {
    mobile: {
      outerRadius: Math.min(containerDimensions.width * 0.25, 80),
      margin: { top: 20, right: 60, bottom: 20, left: 60 },
      fontSize: { internal: 10, external: 9 },
      threshold: 0.1,
      labelSpacing: 25,
    },
    desktop: {
      outerRadius: Math.min(containerDimensions.width * 0.3, 140),
      margin: { top: 30, right: 120, bottom: 30, left: 120 },
      fontSize: { internal: 12, external: 11 },
      threshold: 0.1,
      labelSpacing: 35,
    },
  };

  const settings = isMobile ? chartSettings.mobile : chartSettings.desktop;

  interface TooltipProps {
    active?: boolean;
    payload?: {
      payload: {
        displayCategory: string;
        amount: number;
        percentage: number;
      };
    }[];
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
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

  const calculateExternalLabelPositions = (
    segments: any[],
    actualCx: number,
    actualCy: number
  ) => {
    const externalSegments = segments.filter(
      (seg) => seg.percentage / 100 < settings.threshold
    );
    const positions: any[] = [];

    // Separate left and right side segments
    const leftSide: any[] = [];
    const rightSide: any[] = [];

    externalSegments.forEach((seg) => {
      const RADIAN = Math.PI / 180;
      const midAngle = seg.midAngle;
      const bendRadius = settings.outerRadius + (isMobile ? 15 : 25);
      const bendPoint = {
        x: actualCx + bendRadius * Math.cos(-midAngle * RADIAN),
        y: actualCy + bendRadius * Math.sin(-midAngle * RADIAN),
      };

      if (bendPoint.x > actualCx) {
        rightSide.push({ ...seg, bendPoint });
      } else {
        leftSide.push({ ...seg, bendPoint });
      }
    });

    // Sort by y position to stack them properly
    leftSide.sort((a, b) => a.bendPoint.y - b.bendPoint.y);
    rightSide.sort((a, b) => a.bendPoint.y - b.bendPoint.y);

    // Calculate positions with proper spacing
    const calculateSidePositions = (
      sideSegments: any[],
      isRightSide: boolean
    ) => {
      return sideSegments.map((seg, i) => {
        const baseY = seg.bendPoint.y;
        const adjustedY =
          i === 0
            ? baseY
            : Math.max(
                baseY,
                positions[positions.length - 1]?.labelY +
                  settings.labelSpacing || baseY
              );

        const horizontalLength = isMobile ? 25 : 35;
        const horizontalEndX = isRightSide
          ? seg.bendPoint.x + horizontalLength
          : seg.bendPoint.x - horizontalLength;

        const labelX = isRightSide ? horizontalEndX + 5 : horizontalEndX - 5;

        const position = {
          ...seg,
          labelX,
          labelY: adjustedY,
          horizontalEndX,
          isRightSide,
        };

        positions.push(position);
        return position;
      });
    };

    // Calculate positions for both sides
    const leftPositions = calculateSidePositions(leftSide, false);
    const rightPositions = calculateSidePositions(rightSide, true);

    return [...leftPositions, ...rightPositions];
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
    // Only show labels for segments 0.5% and above
    if (percent < 0.005) return null;

    const RADIAN = Math.PI / 180;
    const isSmallSegment = percent < settings.threshold;

    if (isSmallSegment) {
      // For small segments, we'll handle positioning in a separate pass
      return null;
    } else {
      // Position for large segments (10% and above) - inside the chart
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
          fontSize={settings.fontSize.internal}
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

  const ExternalLabels = ({ cx, cy }: { cx: number; cy: number }) => {
    const RADIAN = Math.PI / 180;
    const externalPositions = calculateExternalLabelPositions(
      segmentData,
      cx,
      cy
    );

    return (
      <g>
        {externalPositions.map((pos) => {
          const innerRadius2 = settings.outerRadius + (isMobile ? 3 : 5);
          const innerPoint = {
            x: cx + innerRadius2 * Math.cos(-pos.midAngle * RADIAN),
            y: cy + innerRadius2 * Math.sin(-pos.midAngle * RADIAN),
          };

          const categoryName = pos.displayCategory || "";

          return (
            <g key={`external-label-${pos.category}`}>
              {/* First line segment: from chart to bend point */}
              <line
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={pos.bendPoint.x}
                y2={pos.bendPoint.y}
                stroke="#666666"
                strokeWidth={isMobile ? 1.5 : 2}
                opacity={0.8}
              />

              {/* Second line segment: from bend point to adjusted label position */}
              <line
                x1={pos.bendPoint.x}
                y1={pos.bendPoint.y}
                x2={pos.horizontalEndX}
                y2={pos.labelY}
                stroke="#666666"
                strokeWidth={isMobile ? 1.5 : 2}
                opacity={0.8}
              />

              {/* Label text */}
              <text
                x={pos.labelX}
                y={pos.labelY}
                fill="currentColor"
                textAnchor={pos.isRightSide ? "start" : "end"}
                dominantBaseline="central"
                fontSize={settings.fontSize.external}
                fontWeight="bold"
                className="fill-foreground cursor-pointer"
                onClick={() => onCategoryClick?.(pos.category)}
              >
                <tspan x={pos.labelX} dy="-6">
                  {categoryName}
                </tspan>
                <tspan x={pos.labelX} dy="12">{`${pos.percentage.toFixed(
                  0
                )}%`}</tspan>
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const handlePieClick = (data: any) => {
    onCategoryClick?.(data.category);
  };

  return (
    <div className="w-full h-64 md:h-96 chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={settings.margin}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={settings.outerRadius}
            fill="#8884d8"
            dataKey="amount"
            stroke="transparent"
            strokeWidth={0}
            onClick={handlePieClick}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                strokeWidth={0}
                style={{ outline: "none", cursor: "pointer" }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <ExternalLabels
            cx={containerDimensions.width * 0.5}
            cy={containerDimensions.height * 0.5}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Enhanced CSS to completely remove focus outline and borders */}
      <style jsx global>{`
        .recharts-pie-sector {
          outline: none !important;
          stroke: transparent !important;
          stroke-width: 0 !important;
          cursor: pointer !important;
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
