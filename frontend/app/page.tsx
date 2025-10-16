"use client"

import { useEffect, useState } from "react"
import { ForeonHeader } from "@/components/foreon-header"
import { CategoryFilter } from "@/components/category-filter"
import { FilterSidebar } from "@/components/filter-sidebar"
import { HeroCards } from "@/components/hero-cards"
import { MarketGrid } from "@/components/market-grid"
import { Pagination } from "@/components/pagination"

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
            <CategoryFilter onFilterClick={() => setIsFilterOpen(!isFilterOpen)} />

            <HeroCards />
            <MarketGrid />

            <div className="mt-8">
              <Pagination />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
