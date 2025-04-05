"use client"

import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface TopHashtagsChartProps {
  data: any[]
}

export default function TopHashtagsChart({ data }: TopHashtagsChartProps) {
  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <ChartContainer className="h-[200px]">
      <Chart>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} layout="vertical">
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="hashtag"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={100}
              tickFormatter={(value) => `#${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  labelFormatter={(label) => `#${label}`}
                  valueSuffix=" mentions"
                />
              }
            />
            <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} name="Mentions" />
          </BarChart>
        </ResponsiveContainer>
      </Chart>
    </ChartContainer>
  )
}

