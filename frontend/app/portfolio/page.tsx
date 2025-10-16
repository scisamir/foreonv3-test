"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Search, Filter, Clock, ExternalLink } from "lucide-react"
import { ClaimRewardModal } from "@/components/claim-reward-modal"
import { CancelOrderModal } from "@/components/cancel-order-modal"
import { ForeonHeader } from "@/components/foreon-header"

// Mock data - replace with real data from your API
const mockPositions = [
  {
    id: 1,
    market: "BTC to get to $70,000 by the end of October",
    outcome: "Yes",
    shares: 23,
    potentialReturn: "700 USDM",
    result: "Won",
  },
  {
    id: 2,
    market: "Democratic presidential Nominee for 2024",
    outcome: "Yes on Kamala Harris",
    shares: 23,
    potentialReturn: "700 USDM",
    result: "--",
  },
  {
    id: 3,
    market: "Who will win the 2024/2025 EPL season?",
    outcome: "No on Arsenal",
    shares: 23,
    potentialReturn: "700 USDM",
    result: "--",
  },
]

const mockClaimed = [
  {
    id: 1,
    market: "BTC to get to $70,000 by the end of October",
    outcome: "Yes",
    shares: 23,
    potentialReturn: "700 USDM",
  },
  {
    id: 2,
    market: "Democratic presidential Nominee for 2024",
    outcome: "Yes on Kamala Harris",
    shares: 23,
    potentialReturn: "700 USDM",
  },
]

const mockOrders = [
  {
    id: 1,
    market: "BTC to get to $70,000 by the end of October",
    outcome: "Yes",
    action: "Buy",
    price: "25 USDM",
    shares: 23,
    total: "70 USDM",
    matched: "30 USDM",
    remaining: "40 USDM",
    payback: "2 USDM/2 Shares",
    orderCreatedTime: "22 Dec. 2024, 12:59",
    status: "Open",
  },
]

const mockHistory = [
  {
    id: 1,
    market: "BTC to get to $70,000 by the end of October",
    outcome: "Yes",
    action: "Buy",
    method: "Mint",
    price: "25 USDM",
    shares: 23,
    total: "70 USDM",
    transactionTime: "22 Dec. 2024, 12:59",
  },
  {
    id: 2,
    market: "Democratic presidential Nominee for 2024",
    outcome: "Yes on Kamala Harris",
    action: "Buy",
    method: "Merge",
    price: "25 USDM",
    shares: 23,
    total: "70 USDM",
    transactionTime: "22 Dec. 2024, 12:59",
  },
]

export default function PortfolioPage() {
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedClaimAmount, setSelectedClaimAmount] = useState("10")

  return (
    <div className="min-h-screen bg-background">
      <ForeonHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-900 to-purple-700 text-white p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm opacity-90">Total Volume</span>
              <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
                <span className="text-xs">?</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold">150,361,056 USDM</h1>
          </Card>

          <div className="mt-6 bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg">addr2...8876</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Ensure to keep your wallet address safe at all times to protect your assets
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="position" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="claimed">Claimed</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Position Tab */}
          <TabsContent value="position" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Position</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search Market" className="pl-10 w-64" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Sort By <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Result <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                <div>Market</div>
                <div>Outcome</div>
                <div>Shares</div>
                <div>Potential Return</div>
                <div>Result</div>
              </div>
              {mockPositions.map((position) => (
                <div key={position.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center">
                  <div className="font-medium">{position.market}</div>
                  <div>{position.outcome}</div>
                  <div>{position.shares}</div>
                  <div>{position.potentialReturn}</div>
                  <div className="flex items-center gap-2">
                    {position.result === "Won" ? (
                      <>
                        <span className="text-green-600 font-medium">Won</span>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => setClaimModalOpen(true)}
                        >
                          Claim
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">9 /page</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button size="sm">2</Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  4
                </Button>
                <span className="text-muted-foreground">...</span>
                <Button variant="outline" size="sm">
                  24
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Current page - <span className="font-medium">Page 1</span>
              </div>
            </div>
          </TabsContent>

          {/* Claimed Tab */}
          <TabsContent value="claimed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Claimed</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search Market" className="pl-10 w-64" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Sort By <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                <div>Market</div>
                <div>Outcome</div>
                <div>Shares</div>
                <div>Potential Return Claimed</div>
              </div>
              {mockClaimed.map((claim) => (
                <div key={claim.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0">
                  <div className="font-medium">{claim.market}</div>
                  <div>{claim.outcome}</div>
                  <div>{claim.shares}</div>
                  <div>{claim.potentialReturn}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Orders</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search Market" className="pl-10 w-64" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Sort By <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Action <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Order Time <Clock className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="grid grid-cols-11 gap-2 p-4 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                <div>Market</div>
                <div>Outcome</div>
                <div>Action</div>
                <div>Price</div>
                <div>Shares</div>
                <div>Total</div>
                <div>Matched</div>
                <div>Remaining</div>
                <div>Payback</div>
                <div>Order Created Time</div>
                <div>Status</div>
              </div>
              {mockOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-11 gap-2 p-4 border-b last:border-b-0 items-center text-sm"
                >
                  <div className="font-medium">{order.market}</div>
                  <div>{order.outcome}</div>
                  <div>{order.action}</div>
                  <div>{order.price}</div>
                  <div>{order.shares}</div>
                  <div>{order.total}</div>
                  <div>{order.matched}</div>
                  <div>{order.remaining}</div>
                  <div>{order.payback}</div>
                  <div className="flex items-center gap-1">
                    {order.orderCreatedTime}
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{order.status}</span>
                    <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(true)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">History</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search Market" className="pl-10 w-64" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Sort By <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Transaction Time <Clock className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                <div>Market</div>
                <div>Outcome</div>
                <div>Action</div>
                <div>Method</div>
                <div>Price</div>
                <div>Shares</div>
                <div>Total</div>
                <div>Transaction Time</div>
              </div>
              {mockHistory.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-8 gap-4 p-4 border-b last:border-b-0 items-center">
                  <div className="font-medium">{transaction.market}</div>
                  <div>{transaction.outcome}</div>
                  <div>{transaction.action}</div>
                  <div>{transaction.method}</div>
                  <div>{transaction.price}</div>
                  <div>{transaction.shares}</div>
                  <div>{transaction.total}</div>
                  <div className="flex items-center gap-1">
                    {transaction.transactionTime}
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ClaimRewardModal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          amount={selectedClaimAmount}
        />

        <CancelOrderModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} />
      </div>
    </div>
  )
}
