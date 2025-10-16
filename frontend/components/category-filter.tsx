"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Filter, ChevronDown } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useWalletCustom } from "./WalletConnectionContext"

const categories = ["All", "Business", "Crypto", "Sports", "Politics", "Science", "Pop Culture", "Finance"]

interface CategoryFilterProps {
  onFilterClick: () => void
  showProposedMarket?: boolean
}

export function CategoryFilter({ onFilterClick, showProposedMarket = true }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState("All")
  const [scrollPosition, setScrollPosition] = useState(0)

  const { connected } = useWalletCustom();

  const scrollLeft = () => {
    const container = document.getElementById("category-scroll")
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById("category-scroll")
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  return (
    <div className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button variant="outline" className="gap-2 bg-transparent whitespace-nowrap" onClick={onFilterClick}>
              <Filter className="w-4 h-4" />
              Filter
            </Button>

            <Button variant="outline" className="gap-2 bg-transparent whitespace-nowrap">
              Sort By
              <ChevronDown className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button variant="ghost" size="icon" className="text-muted-foreground flex-shrink-0" onClick={scrollLeft}>
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div
                id="category-scroll"
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    className={`whitespace-nowrap font-medium rounded-full px-4 py-2 flex-shrink-0 ${
                      activeCategory === category
                        ? "text-white hover:opacity-90"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={
                      activeCategory === category
                        ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                        : {}
                    }
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <Button variant="ghost" size="icon" className="text-muted-foreground flex-shrink-0" onClick={scrollRight}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showProposedMarket && (
            <Link href={connected ? "/propose-market" : '/'} className="flex-shrink-0 ml-4">
              <Button
                disabled={!connected}
                className="text-white font-medium rounded-full px-6 py-2 hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)",
                }}
              >
                Propose Market
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
