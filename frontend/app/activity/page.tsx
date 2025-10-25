"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { ForeonHeader } from "@/components/foreon-header"

export default function ActivityPage() {
  const [showEmptyState, setShowEmptyState] = useState(false)
  const [criteria, setCriteria] = useState("all")
  const [createdBy, setCreatedBy] = useState("all")
  const [dateRange, setDateRange] = useState("")

  const mockActivities = [ { id: 1, user: "addr123...1dd0", market: "Import duty to increase in Q2 market, 2024", action: "bought", outcome: "203 Yes", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/import-duty-market-icon.jpg", }, { id: 2, user: "addr123...1dd0", market: "Who will win the 2024/2025 EPL season?", action: "bought", outcome: "203 Yes for Liverpool", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/epl-football-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, { id: 3, user: "addr123...1dd0", market: "Democratic presidential Nominee for 2024", action: "bought", outcome: "203 No for Donald Trump", price: "15USDM (2,345 USDM)", timestamp: "22m ago", icon: "/us-election-icon.jpg", }, ]

  if (showEmptyState) {
    return (
      <div className="min-h-screen bg-background">
        <ForeonHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Coming Soon</h2>
          <p className="text-muted-foreground text-lg">
            We’re cooking something good. Stay tuned.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <ForeonHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Sticky Activity header */}
        <div className="sticky top-[64px] z-30 bg-background pb-4 pt-2 border-b border-border flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Activity</h1>

          {/* Replace Dropdown with Filter Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Filter
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[350px] rounded-2xl p-6 space-y-6">
              <DialogHeader>
                <DialogTitle>Filter Options</DialogTitle>
              </DialogHeader>

              {/* Criteria */}
              <div>
                <Label className="mb-2 block">Criteria</Label>
                <RadioGroup
                  value={criteria}
                  onValueChange={setCriteria}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="criteria-all" />
                    <Label htmlFor="criteria-all">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="criteria-yes" />
                    <Label htmlFor="criteria-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="criteria-no" />
                    <Label htmlFor="criteria-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Created By */}
              <div>
                <Label className="mb-2 block">Created By</Label>
                <RadioGroup
                  value={createdBy}
                  onValueChange={setCreatedBy}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="created-all" />
                    <Label htmlFor="created-all">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="me" id="created-me" />
                    <Label htmlFor="created-me">Me</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Date */}
              <div>
                <Label className="mb-2 block">Date</Label>
                <Input
                  type="text"
                  placeholder="From – To"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/*Activity list stays same */}
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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
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
      </div>
    </div>
  )
}
