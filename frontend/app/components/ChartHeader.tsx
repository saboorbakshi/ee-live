"use client"

interface ChartHeaderProps {
  title: string
  value: number
  subtitle?: string
}

export default function ChartHeader({ title, value, subtitle }: ChartHeaderProps) {
  return (
    <div className="mb-6">
      <p className="text-lg">{title}</p>
      <p className="text-5xl">{value.toLocaleString()}</p>
      {subtitle && <p className="text-foreground2 mt-1">{subtitle}</p>}
    </div>
  )
}
