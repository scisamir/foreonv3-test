"use client"

import { useEffect, useState } from "react"
import { MarketCard } from "./market-card"
import { fetchMarketData } from "@/lib/markets"
import { Market } from "@/lib/types"
import { useWalletCustom } from "./WalletConnectionContext"

export function MarketGrid() {
  const [markets, setMarkets] = useState<Market[]>([])
  const { blockchainProvider, connected } = useWalletCustom();

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        if (!blockchainProvider) throw new Error('blockchainProvider not found');
        const marketResult = await fetchMarketData(blockchainProvider)
        const marketData = marketResult.filter((m) => m.title !== "Unknown")
        setMarkets(marketData)
      } catch(e) {
        console.error('e:', e);
      }
    }

    fetchMarket();
  }, [connected])

  return (
    <>
      {connected ?
        (<div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {markets.map((market, index) => (
              <MarketCard key={index} {...market} />
            ))}
          </div>
        </div>) : (
        <div className="flex flex-col items-center justify-center text-center py-24 px-6 rounded-2xl border border-border shadow-lg bg-gradient-to-b from-[#F6EEFF]/60 to-background dark:from-[#1E1E2E]/40 dark:to-muted transition-colors">
          <div className="max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00A9B7] via-[#4C32F2] to-[#9F00BE] shadow-md">
              <img
                src="/foreon-logo.svg"
                alt="Foreon Logo"
                className="w-8 h-8 brightness-0 invert dark:invert-0"
              />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#00A9B7] via-[#4C32F2] to-[#9F00BE] text-transparent bg-clip-text">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Connect your Cardano wallet to view and participate in available markets on{" "}
              <span className="font-semibold text-foreground">Foreon</span>.
            </p>
          </div>
        </div>)
      }
    </>
  )
}
