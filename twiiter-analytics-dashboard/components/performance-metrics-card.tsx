"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PerformanceMetricsCardProps {
  data: any[]
}

export default function PerformanceMetricsCard({ data }: PerformanceMetricsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!data || data.length === 0) {
    return <div className="text-center p-4">No performance data available</div>
  }

  // Get the current metrics to display
  const currentMetrics = data[currentIndex]

  // Calculate total number of pages
  const totalPages = data.length

  // Handle navigation
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : prev))
  }

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {typeof currentMetrics.processing_time === "number"
                ? currentMetrics.processing_time.toFixed(3)
                : Number.parseFloat(currentMetrics.processing_time).toFixed(3)}
              s
            </div>
            <div className="text-sm text-muted-foreground">Processing Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {typeof currentMetrics.records_per_second === "number"
                ? currentMetrics.records_per_second.toFixed(2)
                : Number.parseFloat(currentMetrics.records_per_second).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Records Per Second</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{currentMetrics.accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{currentMetrics.execution_type}</div>
            <div className="text-sm text-muted-foreground">Execution Type</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing metrics {currentIndex + 1} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPrevious} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext} disabled={currentIndex === totalPages - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table View of All Metrics */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Processing Time</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Records/Sec</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Execution Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((metric, index) => (
                <TableRow key={index} className={index === currentIndex ? "bg-muted/50" : ""}>
                  <TableCell>{metric.id}</TableCell>
                  <TableCell>
                    {typeof metric.processing_time === "number"
                      ? metric.processing_time.toFixed(3)
                      : Number.parseFloat(metric.processing_time).toFixed(3)}
                    s
                  </TableCell>
                  <TableCell>{metric.records_processed}</TableCell>
                  <TableCell>
                    {typeof metric.records_per_second === "number"
                      ? metric.records_per_second.toFixed(2)
                      : Number.parseFloat(metric.records_per_second).toFixed(2)}
                  </TableCell>
                  <TableCell>{metric.accuracy}%</TableCell>
                  <TableCell>{metric.execution_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

