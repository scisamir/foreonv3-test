"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

export function Pagination() {
  const [currentPage, setCurrentPage] = useState(2)
  const [itemsPerPage, setItemsPerPage] = useState(9)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            {itemsPerPage}
            <span className="text-muted-foreground">/page</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">Previous</Button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              1
            </Button>
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground">
              2
            </Button>
            <Button variant="ghost" size="sm">
              3
            </Button>
            <Button variant="ghost" size="sm">
              4
            </Button>
            <span className="px-2 text-muted-foreground">...</span>
            <Button variant="ghost" size="sm">
              24
            </Button>
          </div>

          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Next</Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Current page - <span className="text-foreground">Page 1</span>
        </div>
      </div>
    </div>
  )
}
