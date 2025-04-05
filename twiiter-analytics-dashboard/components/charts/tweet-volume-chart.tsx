"use client"
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface TweetVolumeChartProps {
  data: any[]
}

export default function TweetVolumeChart({ data }: TweetVolumeChartProps) {
  // Group tweets by hour
  const hourlyData = data.reduce((acc: any[], tweet) => {
    const date = new Date(tweet.created_at)
    const hour = date.toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    })

    const existingHour = acc.find((item) => item.hour === hour)

    if (existingHour) {
      existingHour.count += 1
    } else {
      acc.push({ hour, count: 1 })
    }

    return acc
  }, [])

  // Sort by time
  hourlyData.sort((a, b) => {
    return new Date(a.hour).getTime() - new Date(b.hour).getTime()
  })

  // Take the last 24 hours of data
  const last24Hours = hourlyData.slice(-24)

  return (
    <ChartContainer className="h-[200px]">
      <Chart>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last24Hours}>
            <defs>
              <linearGradient id="tweetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.split(",")[0]}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              content={<ChartTooltipContent className="bg-background border-border" valueSuffix=" tweets" />}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#tweetGradient)"
              name="Tweet Volume"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Chart>
    </ChartContainer>
  )
}

