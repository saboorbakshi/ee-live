"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ChartDataPoint {
  index: number;
  drawCRS: number;
  drawNumber: string;
  drawDateFull: string;
  drawText2: string;
}

interface CRSChartProps {
  data: ChartDataPoint[];
}

export default function CRSChart({ data }: CRSChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis
          dataKey="index"
          tick={{ fontSize: 12, fill: "#707070" }}
          tickLine={{ stroke: "#e5e5e5" }}
          axisLine={{ stroke: "#e5e5e5" }}
        />
        <YAxis
          domain={["dataMin - 20", "dataMax + 20"]}
          tick={{ fontSize: 12, fill: "#707070" }}
          tickLine={{ stroke: "#e5e5e5" }}
          axisLine={{ stroke: "#e5e5e5" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            fontSize: 13,
          }}
          formatter={(value: number | undefined) => [value ?? 0, "CRS Score"]}
          labelFormatter={(label: unknown) => {
            const idx = typeof label === "number" ? label : Number(label);
            const point = data.find((d) => d.index === idx);
            if (!point) return `#${idx}`;
            return `#${point.drawNumber} — ${point.drawDateFull} (${point.drawText2})`;
          }}
        />
        <Line
          type="monotone"
          dataKey="drawCRS"
          stroke="#d52b1e"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#d52b1e" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
