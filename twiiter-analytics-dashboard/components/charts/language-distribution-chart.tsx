"use client"

import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

interface LanguageDistributionChartProps {
  data: any[]
}

export default function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: item.lang,
    value: item.count,
  }))

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]


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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          
          </PieChart>
        </ResponsiveContainer>
      </Chart>
    </ChartContainer>
  )
}

