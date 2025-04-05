import type { Metadata } from "next"
import DashboardPage from "@/components/dashboard-page"

export const metadata: Metadata = {
  title: "Twitter Analytics Dashboard",
  description: "Real-time Twitter data analytics dashboard",
}

export default function Home() {
  return <DashboardPage />
}

