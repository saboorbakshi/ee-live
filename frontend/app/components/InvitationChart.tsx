"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Round {
  drawDate: string;
  drawDateFull: string;
  drawSize: string;
  drawCategory: string;
}

interface InvitationChartProps {
  data: Round[];
  year: string;
}

interface ChartDataPoint {
  month: string;
  invitations: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function aggregateByMonth(data: Round[], year: string) {
  const monthlyTotals: Record<string, number> = {};
  for (const month of MONTHS) {
    monthlyTotals[month] = 0;
  }

  for (const r of data) {
    if (!r.drawDate.startsWith(year)) continue;
    // drawDateFull format: "Month Day, Year" e.g. "January 15, 2025"
    const monthStr = r.drawDateFull.split(" ")[0].slice(0, 3);
    const size = parseInt(r.drawSize.replace(/,/g, ""), 10) || 0;
    if (MONTHS.includes(monthStr)) {
      monthlyTotals[monthStr] += size;
    }
  }

  return MONTHS.map((month) => ({
    month,
    invitations: monthlyTotals[month],
  }));
}

function ChartTooltip({
  active,
  payload,
  year,
}: {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
  year: string;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;

  const fullMonth = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
  }[point.month] || point.month;

  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        fontSize: 14,
        padding: "6px 10px",
      }}
    >
      <div className="flex flex-col text-foreground2">
        <span><span className="text-foreground">{point.invitations.toLocaleString()}</span> invitations</span>
        <span>{fullMonth} {year}</span>
      </div>
    </div>
  );
}

export default function InvitationChart({ data, year }: InvitationChartProps) {
  const chartData = useMemo(() => aggregateByMonth(data, year), [data, year]);
  const total = useMemo(
    () => chartData.reduce((sum, d) => sum + d.invitations, 0),
    [chartData]
  );

  return (
    <div>
      <div className="mb-6">
        <p className="text-lg">Total Invitations</p>
        <p className="text-5xl">{total.toLocaleString()}</p>
      </div>

      <ResponsiveContainer width="100%" aspect={1.84}>
        <BarChart
          barCategoryGap={5}
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--foreground2)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            orientation="right"
            width={30}
            tick={{ fontSize: 12, fill: "var(--foreground2)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
          />
          <Tooltip
            animationDuration={200}
            animationEasing="ease-out"
            cursor={{ fill: "var(--background2)" }}
            content={<ChartTooltip year={year} />}
          />
          <Bar
            maxBarSize={20}
            dataKey="invitations"
            fill="var(--primary)"
            radius={[2, 2, 2, 2]}
            animationDuration={400}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
