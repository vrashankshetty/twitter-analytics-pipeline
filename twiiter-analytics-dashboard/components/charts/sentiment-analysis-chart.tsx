"use client"

import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

interface SentimentAnalysisChartProps {
  data: any[]
}

export default function SentimentAnalysisChart({ data }: SentimentAnalysisChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: item.sentiment,
    value: item.count,
  }))

  const COLORS = {
    positive: "#4ade80",
    negative: "#f87171",
    neutral: "#94a3b8",
  }

  return (
    <ChartContainer className="h-[300px]">
      <Chart className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#94a3b8"} />
              ))}
            </Pie>
            <ChartTooltip  className="bg-background border-border"/>
          </PieChart>
        </ResponsiveContainer>
      </Chart>
    </ChartContainer>
  )
}

