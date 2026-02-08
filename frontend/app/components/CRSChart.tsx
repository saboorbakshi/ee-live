"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  LineChart,
  Line,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
interface ChartDataPoint {
  index: number;
  drawDate: string;
  drawCRS: number;
  drawSize: string;
  drawDateFull: string;
  drawCategory: string;
}

interface CRSChartProps {
  data: ChartDataPoint[];
}

function ChartTooltip({
  active,
  payload,
  onActiveChange,
  fallback,
}: {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
  onActiveChange: (point: ChartDataPoint) => void;
  fallback: ChartDataPoint;
}) {
  const point = active && payload?.[0]
    ? (payload[0].payload as ChartDataPoint)
    : null;

  const prevRef = useRef<ChartDataPoint | null>(null);
  useEffect(() => {
    if (prevRef.current !== point) {
      prevRef.current = point;
      onActiveChange(point ?? fallback);
    }
  });

  if (!point) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        fontSize: 14,
        color: "var(--foreground)",
        padding: "6px 10px",
      }}
    >
      <div className="flex flex-col text-foreground2">
        <span><span className="text-foreground">{point.drawCRS}</span> CRS score</span>
        <span><span className="text-foreground">{point.drawSize}</span> invitations</span>
        <span>{point.drawDateFull}</span>
      </div>
    </div>
  );
}

export default function CRSChart({ data }: CRSChartProps) {
  const fallback = useMemo(() => data[data.length - 1], [data]);
  const [active, setActive] = useState(fallback);

  // Calculate dynamic domain based on data range
  const domain = useMemo(() => {
    const vals = data.map(d => d.drawCRS);
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    const range = max - min || 1;
    const mag = 10 ** Math.floor(Math.log10(range));

    // Add padding first (1% of range, minimum 1)
    const padding = Math.max(1, Math.ceil(range * 0.01));
    const paddedMin = min - padding;
    const paddedMax = max + padding;

    // Round to magnitude boundaries for even numbers
    const lowerBound = Math.floor(paddedMin / mag) * mag;
    const upperBound = Math.ceil(paddedMax / mag) * mag;

    // Ensure integers
    return [
      Math.floor(lowerBound),
      Math.ceil(upperBound),
    ];
  }, [data]);

  useEffect(() => {
    setActive(fallback);
  }, [fallback]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-lg">Lowest CRS Score</p>
        <p className="text-5xl">{active.drawCRS}</p>
        <p className="text-foreground2 mt-1">{active.drawDateFull}</p>
      </div>

      <div className="h-48 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 0, right: 0, bottom: 0, left: 4 }}
          >
            <YAxis
              orientation="right"
              width={32}
              domain={domain}
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "var(--foreground2)" }}
              tickLine={false}
              axisLine={false}
            />
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <Tooltip
              animationDuration={200}
              animationEasing="ease-out"
              cursor={{ stroke: "var(--border2)", strokeDasharray: "1 2" }}
              content={<ChartTooltip onActiveChange={setActive} fallback={fallback} />}
            />
            <Line
              type="monotone"
              dataKey="drawCRS"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "var(--primary)" }}
              animationDuration={400}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}