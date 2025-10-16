"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ForeonHeader } from "@/components/foreon-header"

// Mock data for activity feed
const mockActivities = [
  {
    id: 1,
    user: "addr123...1dd0",
    market: "Import duty to increase in Q2 market, 2024",
    action: "bought",
    outcome: "203 Yes",
    price: "15USDM (2,345 USDM)",
    timestamp: "22m ago",
    icon: "/import-duty-market-icon.jpg",
  },
  {
    id: 2,
    user: "addr123...1dd0",
    market: "Who will win the 2024/2025 EPL season?",
    action: "bought",
    outcome: "203 Yes for Liverpool",
    price: "15USDM (2,345 USDM)",
    timestamp: "22m ago",
    icon: "/epl-football-icon.jpg",
  },
  {
    id: 3,
    user: "addr123...1dd0",
    market: "Democratic presidential Nominee for 2024",
    action: "bought",
    outcome: "203 No for Donald Trump",
    price: "15USDM (2,345 USDM)",
    timestamp: "22m ago",
    icon: "/us-election-icon.jpg",
  },
  {
    id: 4,
    user: "addr123...1dd0",
    market: "Who will win the 2024/2025 EPL season?",
    action: "bought",
    outcome: "203 Yes for Liverpool",
    price: "15USDM (2,345 USDM)",
    timestamp: "22m ago",
    icon: "/epl-football-icon.jpg",
  },
  {
    id: 5,
    user: "addr123...1dd0",
    market: "Democratic presidential Nominee for 2024",
    action: "bought",
    outcome: "203 No for Donald Trump",
    price: "15USDM (2,345 USDM)",
    timestamp: "22m ago",
    icon: "/us-election-icon.jpg",
  },
  {
    id: 6,
    user: "addr123...1dd0",
    market: "Who will win the 2024/2025 EPL season?",
    action: "bought",
    outcome: "203 Yes for Liverpool",
    price: "15USDM (2,345 USDM)",
    timestamp: "22m ago",
    icon: "/epl-football-icon.jpg",
  },
  {
    id: 7,
    user: "addr123...1dd0",
    market: "Who will win the 2024/2025 EPL season?",
    action: "bought",
    outcome: "203 No for Arsenal",
    price: "15USDM (2,345 USDM)",
    timestamp: "22m ago",
    icon: "/epl-football-icon.jpg",
  },
]

export default function ActivityPage() {
  const [showEmptyState, setShowEmptyState] = useState(false)

  if (showEmptyState) {
    return (
      <div className="min-h-screen bg-background">
        <ForeonHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Activity</h1>
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

  return (
    <div className="min-h-screen bg-background">
      <ForeonHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Activity</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                Sort By
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Most Recent</DropdownMenuItem>
              <DropdownMenuItem>Oldest First</DropdownMenuItem>
              <DropdownMenuItem>Highest Value</DropdownMenuItem>
              <DropdownMenuItem>Lowest Value</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <img
                src={activity.icon || "/placeholder.svg"}
                alt={activity.market}
                className="w-12 h-12 rounded-lg object-cover"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">{activity.user}</span>
                  <span className="text-sm text-muted-foreground">{activity.action}</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {activity.outcome}
                  </span>
                  <span className="text-sm text-muted-foreground">at {activity.price}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{activity.market}</p>
              </div>

              <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">9</span>
            <span className="text-sm text-muted-foreground">/page</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>5 per page</DropdownMenuItem>
                <DropdownMenuItem>9 per page</DropdownMenuItem>
                <DropdownMenuItem>20 per page</DropdownMenuItem>
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
