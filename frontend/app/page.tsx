"use client"

import { useState } from "react"
import { ForeonHeader } from "@/components/foreon-header"
import { CategoryFilter } from "@/components/category-filter"
import { FilterSidebar } from "@/components/filter-sidebar"
import { HeroCards } from "@/components/hero-cards"
import { MarketGrid } from "@/components/market-grid"

export default function Home() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <ForeonHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

          {/* Main Content */}
          <div className="flex-1">
            {/* Sticky Category Filter */}
            <div className="sticky top-16 z-40 bg-background pb-2">
              <CategoryFilter onFilterClick={() => setIsFilterOpen(!isFilterOpen)} />
            </div>

            <HeroCards />

            {/* Market grid now handles its own lazy loading / load more */}
            <MarketGrid />
          </div>
        </div>
      </main>
    </div>
  )
}
