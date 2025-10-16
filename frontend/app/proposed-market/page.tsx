"use client"

import { useState } from "react"
import { ForeonHeader } from "@/components/foreon-header"
import { CategoryFilter } from "@/components/category-filter"
import { ProposedMarketGrid } from "@/components/proposed-market-grid"
import { ProposedMarketFilter } from "@/components/proposed-market-filter"
import { Pagination } from "@/components/pagination"

export default function ProposedMarketPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <ForeonHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <ProposedMarketFilter isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

          {/* Main Content */}
          <div className="flex-1">
            <CategoryFilter onFilterClick={() => setIsFilterOpen(!isFilterOpen)} showProposedMarket={false} />

            <ProposedMarketGrid />

            <div className="mt-8">
              <Pagination />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
