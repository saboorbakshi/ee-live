"use client"

interface ChartTooltipProps {
  content: React.ReactNode
}

export default function ChartTooltip({ content }: ChartTooltipProps) {
  return (
    <div className="bg-background border border-border rounded-lg text-sm px-2.5 py-1.5">
      {content}
    </div>
  )
}
