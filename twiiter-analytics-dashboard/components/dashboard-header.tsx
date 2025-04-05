"use client"

import { RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import ResetDatabaseButton from "@/components/reset-database-button"

export default function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Twitter Analytics Dashboard</h1>
        <p className="text-muted-foreground">Real-time analytics from Twitter data processed through Kafka and Spark</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live Data</span>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <ResetDatabaseButton />
      </div>
    </div>
  )
}

