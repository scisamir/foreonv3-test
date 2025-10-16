"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const [volumeFilter, setVolumeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Overlay for mobile */}
      <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div className="absolute left-0 top-0 h-full w-80 bg-background border-r border-border p-6 overflow-y-auto lg:relative lg:w-64">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-lg font-semibold">Filter</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <h2 className="text-lg font-semibold mb-6 hidden lg:block">Filter</h2>

        {/* Volume Filter */}
        <div className="mb-8">
          <h3 className="font-medium mb-4">Volume</h3>
          <RadioGroup value={volumeFilter} onValueChange={setVolumeFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="volume-all" />
              <Label htmlFor="volume-all" className="text-sm">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="under-10k" id="volume-under-10k" />
              <Label htmlFor="volume-under-10k" className="text-sm">
                Under 10,000 ADA
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10k-50k" id="volume-10k-50k" />
              <Label htmlFor="volume-10k-50k" className="text-sm">
                10,000 ADA - 50,000 ADA
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="50k-100k" id="volume-50k-100k" />
              <Label htmlFor="volume-50k-100k" className="text-sm">
                50,000 ADA - 100,000 ADA
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="above-100k" id="volume-above-100k" />
              <Label htmlFor="volume-above-100k" className="text-sm">
                Above 100,000 ADA
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Status Filter */}
        <div className="mb-8">
          <h3 className="font-medium mb-4">Status</h3>
          <RadioGroup value={statusFilter} onValueChange={setStatusFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all" className="text-sm">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active" className="text-sm">
                Active
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ended" id="status-ended" />
              <Label htmlFor="status-ended" className="text-sm">
                Ended
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* End Date Filter */}
        <div>
          <h3 className="font-medium mb-4">End Date</h3>
          <div className="relative">
            <Input placeholder="From - To" className="pl-10 bg-muted/50 border-border" />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
