"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import DashboardHeader from "@/components/dashboard-header"
import MonthlyTweetChart from "@/components/charts/monthly-tweet-chart"
import LanguageDistributionChart from "@/components/charts/language-distribution-chart"
import SentimentAnalysisChart from "@/components/charts/sentiment-analysis-chart"
import PerformanceMetricsCard from "@/components/performance-metrics-card"
import TweetTable from "@/components/tweet-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [monthData, setMonthData] = useState<any[]>([])
  const [languageData, setLanguageData] = useState<any[]>([])
  const [sentimentData, setSentimentData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [tweets, setTweets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState(createClient())

  // Refresh Supabase client when component mounts
  useEffect(() => {
    setSupabase(createClient())
  }, [])

  // Initial data fetch and real-time subscriptions
  useEffect(() => {
    if (!supabase) return

    // Define the initial data fetch function
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch month data
        const { data: monthData, error: monthError } = await supabase
          .from("month_summary")
          .select("*")
          .order("month", { ascending: true })
        
        if (monthError) throw new Error(`Error fetching month data: ${monthError.message}`)
        setMonthData(monthData || [])
        
        // Fetch language data
        const { data: languageData, error: languageError } = await supabase
          .from("language_summary")
          .select("*")
          .order("count", { ascending: false })
        
        if (languageError) throw new Error(`Error fetching language data: ${languageError.message}`)
        setLanguageData(languageData || [])
        
        // Fetch sentiment data
        const { data: sentimentData, error: sentimentError } = await supabase
          .from("sentiment_summary")
          .select("*")
        
        if (sentimentError) throw new Error(`Error fetching sentiment data: ${sentimentError.message}`)
        setSentimentData(sentimentData || [])
        
        // Fetch performance data
        const { data: performanceData, error: performanceError } = await supabase
          .from("performance")
          .select("*")
          .order("id", { ascending: true })
        
        if (performanceError) throw new Error(`Error fetching performance data: ${performanceError.message}`)
        setPerformanceData(performanceData || [])
        
        // Fetch tweets data
        const { data: tweetsData, error: tweetsError } = await supabase
          .from("tweets")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20)
        
        if (tweetsError) throw new Error(`Error fetching tweets data: ${tweetsError.message}`)
        setTweets(tweetsData || [])
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
        setIsLoading(false)
      }
    }

    // Call the fetch function
    fetchInitialData()

    // Set up real-time subscriptions
    const monthChannel = supabase.channel('month-changes')
    const languageChannel = supabase.channel('language-changes')
    const sentimentChannel = supabase.channel('sentiment-changes')
    const performanceChannel = supabase.channel('performance-changes')
    const tweetsChannel = supabase.channel('tweets-changes')

    // Month summary subscription
    monthChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'month_summary',
        },
        async (payload: any) => {
          console.log('Month data changed:', payload)
          const { data } = await supabase
            .from("month_summary")
            .select("*")
            .order("month", { ascending: true })
          
          if (data) setMonthData(data)
        }
      )
      .subscribe((status) => {
        console.log('Month subscription status:', status)
      })

    // Language summary subscription
    languageChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'language_summary',
        },
        async (payload: any) => {
          console.log('Language data changed:', payload)
          const { data } = await supabase
            .from("language_summary")
            .select("*")
            .order("count", { ascending: false })
          
          if (data) setLanguageData(data)
        }
      )
      .subscribe((status) => {
        console.log('Language subscription status:', status)
      })

    // Sentiment summary subscription
    sentimentChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sentiment_summary',
        },
        async (payload: any) => {
          console.log('Sentiment data changed:', payload)
          const { data } = await supabase
            .from("sentiment_summary")
            .select("*")
          
          if (data) setSentimentData(data)
        }
      )
      .subscribe((status) => {
        console.log('Sentiment subscription status:', status)
      })

    // Performance metrics subscription
    performanceChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'performance',
        },
        async (payload: any) => {
          console.log('Performance data changed:', payload)
          const { data } = await supabase
            .from("performance")
            .select("*")
            .order("id", { ascending: true })
          
          if (data) setPerformanceData(data)
        }
      )
      .subscribe((status) => {
        console.log('Performance subscription status:', status)
      })

    // Tweets subscription
    tweetsChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tweets',
        },
        async (payload: { new: any }) => {
          console.log('New tweet received:', payload)
          setTweets((prevTweets) => [payload.new, ...prevTweets.slice(0, 19)])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tweets',
        },
        async (payload: { new: any }) => {
          console.log('Tweet updated:', payload)
          setTweets((prevTweets) => 
            prevTweets.map(tweet => 
              tweet.id === payload.new.id ? payload.new : tweet
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tweets',
        },
        async (payload: { old: any }) => {
          console.log('Tweet deleted:', payload)
          setTweets((prevTweets) => 
            prevTweets.filter(tweet => tweet.id !== payload.old.id)
          )
        }
      )
      .subscribe((status) => {
        console.log('Tweets subscription status:', status)
      })

    // Cleanup function
    return () => {
      supabase.removeChannel(monthChannel)
      supabase.removeChannel(languageChannel)
      supabase.removeChannel(sentimentChannel)
      supabase.removeChannel(performanceChannel)
      supabase.removeChannel(tweetsChannel)
    }
  }, [supabase]) // Only run when supabase client is available

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Tweet Count</CardTitle>
            <CardDescription>Number of tweets per month</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[200px] w-full" /> : <MonthlyTweetChart data={monthData} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>Tweets by language</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[200px] w-full" /> : <LanguageDistributionChart data={languageData} />}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>Distribution of tweet sentiments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[200px] w-full" /> : <SentimentAnalysisChart data={sentimentData} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Processing performance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[200px] w-full" /> : <PerformanceMetricsCard data={performanceData} />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tweets</CardTitle>
          <CardDescription>Latest tweets from the dataset</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <TweetTable tweets={tweets} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}