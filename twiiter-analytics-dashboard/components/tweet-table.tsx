"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search } from "lucide-react"

interface TweetTableProps {
  tweets: any[]
}

export default function TweetTable({ tweets }: TweetTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredTweets = tweets.filter(
    (tweet) =>
      tweet.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tweet.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tweet.month?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedTweets = [...filteredTweets].sort((a, b) => {
    if (sortBy === "created_at") {
      return sortOrder === "asc"
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }

    if (sortBy === "user_id") {
      return sortOrder === "asc" ? a.user_id.localeCompare(b.user_id) : b.user_id.localeCompare(a.user_id)
    }

    if (sortBy === "month") {
      return sortOrder === "asc" ? a.month.localeCompare(b.month) : b.month.localeCompare(a.month)
    }

    return 0
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tweets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              Sort By
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort("created_at")}>
              Date {sortBy === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("user_id")}>
              User {sortBy === "user_id" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("month")}>
              Month {sortBy === "month" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead className="w-[50%]">Tweet</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTweets.length > 0 ? (
              sortedTweets.map((tweet, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{tweet.user_id}</TableCell>
                  <TableCell>{tweet.text}</TableCell>
                  <TableCell>{tweet.month}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(tweet.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No tweets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

