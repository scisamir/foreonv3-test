"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ProposedMarketDetailPage({ params }: { params: { id: string } }) {
  const [showMarketInfo, setShowMarketInfo] = useState(false)
  const [showAddLiquidity, setShowAddLiquidity] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState<"confirm" | "cancel" | null>(null)

  // Mock data - replace with actual data fetching
  const market = {
    id: params.id,
    title: "BTC to get to $70,000 by the end of October",
    image: "/bitcoin-chart.jpg",
    status: "approved" as const,
    summary:
      "Lorem ipsum dolor sit amet consectetur. Semper eros natoque habitant cum. Ut ultricies sed hendrerit tristique dictum pharetra nunc in dictum. In sit sit pharetra risus risus. Sed in sapien elit et egestas. Facilisi eu enim malesuUSDM egestas adipiscing faucibus ut sagittis.",
    extendedSummary:
      "Tortor ullamcorper amet ut at adipiscing porttitor scelerisque lacus. Tincidunt vestibulum integer scelerisque quam aliquet mi. Velit et nunc velit fermentum. Velit quam libero non sed et lacus cursus nulla. Dignissim sit.",
    marketType: "Single outcome",
    resolveMethod: "Manually",
    tradingTime: "23 Feb 2025 - 21 Jan 2026",
    categories: "Business, Economics",
    creatorEmail: "businessxyz@email.com",
    liquidityInfo: {
      totalLiquidity: "0 USDM",
      liquidityProviders: 0,
      status: "Awaiting Liquidity",
    },
  }

  const handleAddLiquidity = (data: any) => {
    setShowAddLiquidity(false)
    setShowConfirmation("confirm")
  }

  const handleConfirmLiquidity = () => {
    setShowConfirmation(null)
    // Handle liquidity addition logic here
    console.log("Liquidity added successfully")
  }

  const handleCancelLiquidity = () => {
    setShowConfirmation(null)
    setShowAddLiquidity(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/proposed-market">
            <Button variant="outline" className="mb-4 bg-transparent">
              Go Back
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Market Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={market.image || "/placeholder.svg"}
                  alt={market.title}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{market.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    569,236,056 USDM
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    23 February 2025
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-600">Market Summary</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{market.summary}</p>
                <p>{market.extendedSummary}</p>
              </div>
            </div>

            <Card className="p-6">
              <button
                onClick={() => setShowMarketInfo(!showMarketInfo)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold">Market Information</h3>
                {showMarketInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showMarketInfo && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Status</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Ready for Liquidity
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market type</span>
                    <span>{market.marketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolve method</span>
                    <span>{market.resolveMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market trading time</span>
                    <span>{market.tradingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categories</span>
                    <span>{market.categories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator's email</span>
                    <span>{market.creatorEmail}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Liquidity Information */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Liquidity Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Liquidity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">{market.liquidityInfo.totalLiquidity}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liquidity Providers</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">{market.liquidityInfo.liquidityProviders}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">{market.liquidityInfo.status}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700" asChild>
                <Link href={`/market/${market.id}/add-liquidity`}>Add Liquidity</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* <AddLiquidityModal
        isOpen={showAddLiquidity}
        onClose={() => setShowConfirmation("cancel")}
        marketTitle={market.title}
        onConfirm={handleAddLiquidity}
      /> */}

      {/* <LiquidityConfirmationModal
        isOpen={showConfirmation !== null}
        onClose={() => setShowConfirmation(null)}
        type={showConfirmation || "confirm"}
        onConfirm={showConfirmation === "cancel" ? handleCancelLiquidity : handleConfirmLiquidity}
      /> */}
    </div>
  )
}
