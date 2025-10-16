"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ForeonHeader } from "@/components/foreon-header"

// Mock data for leaderboard
const mockLeaderboard = [
  { rank: 1, address: "addr123...1dd0", amount: "368,257,212.12 USDM", medal: "gold" },
  { rank: 2, address: "addr123...1dd0", amount: "368,257,212.12 USDM", medal: "silver" },
  { rank: 3, address: "addr123...1dd0", amount: "368,257,212.12 USDM", medal: "bronze" },
  { rank: 4, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 5, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 6, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 7, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 8, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 9, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 10, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 11, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 12, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 13, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 14, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 15, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 16, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 17, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 18, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 19, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 20, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 21, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 22, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
  { rank: 23, address: "addr123...1dd0", amount: "368,257,212.12 USDM" },
]

export default function RankPage() {
  const [showEmptyState, setShowEmptyState] = useState(false)

  if (showEmptyState) {
    return (
      <div className="min-h-screen bg-background">
        <ForeonHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Rank</h1>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-8">
              <img src="/megaphone-announcement-illustration.jpg" alt="Coming Soon" className="w-48 h-48 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Coming Soon</h2>
            <p className="text-muted-foreground text-lg">We cooking something good. Stay tuned</p>
          </div>
        </div>
      </div>
    )
  }

  const topThree = mockLeaderboard.slice(0, 3)
  const remaining = mockLeaderboard.slice(3)

  return (
    <div className="min-h-screen bg-background">
      <ForeonHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Rank</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                By Profit
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>By Profit</DropdownMenuItem>
              <DropdownMenuItem>By Volume</DropdownMenuItem>
              <DropdownMenuItem>By Accuracy</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Top 3 Medal Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {topThree.map((user) => (
            <div
              key={user.rank}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 text-center border border-yellow-200 dark:border-yellow-800"
            >
              <div className="mb-4">
                {user.medal === "gold" && (
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🥇</span>
                  </div>
                )}
                {user.medal === "silver" && (
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🥈</span>
                  </div>
                )}
                {user.medal === "bronze" && (
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🥉</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{user.address}</h3>
              <p className="text-sm text-muted-foreground">{user.amount}</p>
            </div>
          ))}
        </div>

        {/* Remaining Rankings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {remaining.map((user) => (
            <div
              key={user.rank}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {user.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{user.address}</p>
              </div>
              <div className="text-sm text-muted-foreground">{user.amount}</div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">26</span>
            <span className="text-sm text-muted-foreground">/page</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>10 per page</DropdownMenuItem>
                <DropdownMenuItem>26 per page</DropdownMenuItem>
                <DropdownMenuItem>50 per page</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="ghost" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="ghost" size="sm">
              2
            </Button>
            <Button variant="ghost" size="sm">
              3
            </Button>
            <Button variant="ghost" size="sm">
              4
            </Button>
            <span className="text-muted-foreground">...</span>
            <Button variant="ghost" size="sm">
              24
            </Button>
            <Button variant="primary" size="sm">
              Next
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Current page - <span className="font-medium">Page 1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
