"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  LineChart,
  Line,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { DrawDataPoint } from "../types"
import ChartHeader from "./ChartHeader"
import ChartTooltipComponent from "./ChartTooltip"
import { calculateDomain } from "../utils"
import { CHART_ASPECT_RATIO } from "../constants"

interface DrawChartProps {
  data: DrawDataPoint[]
}

function ChartTooltip({
  active,
  payload,
  onActiveChange,
  fallback,
}: {
  active?: boolean
  payload?: { payload: DrawDataPoint }[]
  onActiveChange: (point: DrawDataPoint) => void
  fallback: DrawDataPoint
}) {
  const point = active && payload?.[0]
    ? (payload[0].payload as DrawDataPoint)
    : null

  const prevRef = useRef<DrawDataPoint | null>(null)
  useEffect(() => {
    if (prevRef.current !== point) {
      prevRef.current = point
      onActiveChange(point ?? fallback)
    }
  })

  if (!point) return null

  return (
    <ChartTooltipComponent
      content={
        <div className="flex flex-col text-foreground2">
          <span><span className="text-foreground">{point.score}</span> CRS score</span>
          <span><span className="text-foreground">{point.invitations.toLocaleString()}</span> invitations</span>
          <span>{point.dateFull}</span>
        </div>
      }
    />
  )
}

export default function DrawChart({ data }: DrawChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full py-[64px] border border-border rounded-md">
        <div style={{ aspectRatio: CHART_ASPECT_RATIO }}
          className="flex items-center justify-center text-foreground2 text-sm sm:text-base">
          <p>No data available for this time period.</p>
        </div>
      </div>

    )
  }

  const fallback = data[data.length - 1]
  const [active, setActive] = useState<DrawDataPoint>(fallback)

  const domain = useMemo(() => calculateDomain(data), [data])

  useEffect(() => {
    setActive(fallback)
  }, [fallback])

  return (
    <div>
      <ChartHeader
        title="Lowest CRS Score"
        value={active.score}
        subtitle={active.dateFull}
      />

      <ResponsiveContainer width="100%" aspect={CHART_ASPECT_RATIO}>
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
          <CartesianGrid vertical={false} stroke="var(--border2)" strokeDasharray="1 2" />
          <Tooltip
            animationDuration={200}
            animationEasing="ease-out"
            cursor={{ stroke: "var(--border2)", strokeDasharray: "1 2" }}
            content={<ChartTooltip onActiveChange={setActive} fallback={fallback} />}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, fill: "var(--primary)" }}
            animationDuration={400}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div >
  )
}