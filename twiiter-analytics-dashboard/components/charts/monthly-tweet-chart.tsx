"use client"

import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface MonthlyTweetChartProps {
  data: any[]
}

export default function MonthlyTweetChart({ data }: MonthlyTweetChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    month: item.month,
    count: item.count,
  }))

  return (
    <ChartContainer className="h-[300px]">
      <Chart className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip  className="bg-background border-border"  />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tweet Count" />
          </BarChart>
        </ResponsiveContainer>
      </Chart>
    </ChartContainer>
  )
}

