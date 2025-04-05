"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("dark:bg-neutral-950 rounded-md border bg-card text-card-foreground shadow-sm", className)}
      ref={ref}
      {...props}
    />
  )
})
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("w-full", className)} ref={ref} {...props} />
  },
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn(className)} ref={ref} {...props} />
  },
)
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  value?: number
  labelFormatter?: (label: string | number | undefined) => string
  valueFormatter?: (value: string | number | undefined) => string
  valueSuffix?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ className, label, value, labelFormatter, valueFormatter, valueSuffix, ...props }, ref) => {
    return (
      <div className={cn("p-2", className)} ref={ref} {...props}>
        {label && <div className="text-sm text-muted-foreground">{labelFormatter ? labelFormatter(label) : label}</div>}
        {value && (
          <div className="font-medium">{(valueFormatter ? valueFormatter(value) : value) + (valueSuffix || "")}</div>
        )}
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent }

