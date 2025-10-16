"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface ProposedMarket {
  id: string
  title: string
  image: string
  status: "pending" | "approved" | "active" | "ended"
  createdAt: string
  creator: string
}

interface ProposedMarketCardProps {
  market: ProposedMarket
}

export function ProposedMarketCard({ market }: ProposedMarketCardProps) {
  const getStatusBadge = () => {
    switch (market.status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Pending Liquidity
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Ready for Liquidity
          </Badge>
        )
      case "active":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Active Trading
          </Badge>
        )
      case "ended":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Market Ended
          </Badge>
        )
      default:
        return null
    }
  }

  const getActionButtons = () => {
    if (market.status === "approved" || market.status === "pending") {
      return (
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
          <Link href={`/market/${market.id}/add-liquidity`}>Add Liquidity</Link>
        </Button>
      )
    }

    if (market.status === "active") {
      return (
        <Link href={`/market/${market.id}`}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View Market</Button>
        </Link>
      )
    }

    return null
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={market.image || "/placeholder.svg"}
            alt={market.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight mb-2 line-clamp-2">{market.title}</h3>
          {getStatusBadge()}
        </div>
      </div>

      {getActionButtons()}

      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>Created: {market.createdAt}</span>
        <span>By: {market.creator}</span>
      </div>
    </Card>
  )
}
