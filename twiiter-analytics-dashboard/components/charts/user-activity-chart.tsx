"use client"

import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface UserActivityChartProps {
  data: any[]
}

export default function UserActivityChart({ data }: UserActivityChartProps) {
  // Sort data by tweet count in descending order
  const sortedData = [...data]
    .sort((a, b) => b.tweet_count - a.tweet_count)
    .slice(0, 10)
    .map((user) => ({
      username: user.username,
      tweet_count: user.tweet_count,
    }))

  return (
    <ChartContainer className="h-[200px]">
      <Chart>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} layout="vertical">
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="username"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={100}
              tickFormatter={(value) => `@${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-background border-border"
                  labelFormatter={(label) => `@${label}`}
                  valueSuffix=" tweets"
                />
              }
            />
            <Bar dataKey="tweet_count" fill="#10b981" radius={[0, 4, 4, 0]} name="Tweets" />
          </BarChart>
        </ResponsiveContainer>
      </Chart>
    </ChartContainer>
  )
}

