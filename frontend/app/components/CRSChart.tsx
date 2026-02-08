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

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 4 }}
        >
          <YAxis
            orientation="right"
            width={32}
            domain={["dataMin - 20", "dataMax + 20"]}
            tick={{ fontSize: 12, fill: "var(--foreground2)" }}
            tickLine={false}
            axisLine={false}
          />
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <Tooltip
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
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
