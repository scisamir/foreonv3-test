"use client"

import { MarketFormData } from "@/lib/types"
import { ProposedMarketCard } from "./proposed-market-card"
import { useEffect, useState } from "react"
import { defaultMarkets } from "@/lib/markets"

export function ProposedMarketGrid() {
  const [proposedMarkets, setProposedMarkets] = useState(defaultMarkets)

  const mapFormToMarket = (parsed: any, liquidityMarkets: any) => {
    return parsed.map((form: MarketFormData, index: number) => {
      const liqMarket = liquidityMarkets.find((l: any) => l.email === form.email)

      return {
        id: `local-${index}`,
        title: form.marketTitle,
        image: form.coverImage || "/placeholder-image.jpg",
        status: liqMarket ? "active" as const : "approved" as const,
        createdAt: "just now",
        creator: form.email || "Anonymous",
    }})
}

  useEffect(() => {
    // Fetch liquidity info from localStorage
    const liquidity = JSON.parse(localStorage.getItem("liquidity") || "{}")
    // Map liquidity-only entries (in case some markets already exist but not proposals)
    const liquidityMarkets = Object.entries(liquidity).map(([title, info]: [string, any]) => ({
      id: title,
      shares: info.shares,
      yesPrice: info.yesPrice,
      noPrice: info.noPrice,
      email: info.email,
    }))

    const stored = localStorage.getItem("marketProposals")
    if (stored) {
      try {
        const parsed: MarketFormData[] = JSON.parse(stored)

        const mapped = mapFormToMarket(parsed, liquidityMarkets)
        setProposedMarkets([...mapped.reverse(), ...defaultMarkets])
      } catch (e) {
        console.error("Failed to parse stored markets", e)
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {proposedMarkets.map((market) => (
        <ProposedMarketCard key={market.id} market={market} />
      ))}
    </div>
  )
}
