import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Twitter Analytics Dashboard",
  description: "Real-time Twitter data analytics dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={
      {
        colorScheme: "dark",
      }
    }>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen">
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'