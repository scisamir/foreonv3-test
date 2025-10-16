"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface ProposedMarketFilterProps {
  isOpen: boolean
  onClose: () => void
}

export function ProposedMarketFilter({ isOpen, onClose }: ProposedMarketFilterProps) {
  if (!isOpen) return null

  return (
    <div className="w-64 flex-shrink-0">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Filter</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Status</h3>
          <RadioGroup defaultValue="all" className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all" className="text-sm">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="status-pending" />
              <Label htmlFor="status-pending" className="text-sm">
                Pending Liquidity
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id="status-approved" />
              <Label htmlFor="status-approved" className="text-sm">
                Ready for Liquidity
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active" className="text-sm">
                Active Trading
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ended" id="status-ended" />
              <Label htmlFor="status-ended" className="text-sm">
                Market Ended
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Your Markets Filter */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Your Markets</h3>
          <RadioGroup defaultValue="all" className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="markets-all" />
              <Label htmlFor="markets-all" className="text-sm">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="created" id="markets-created" />
              <Label htmlFor="markets-created" className="text-sm">
                Created by You
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="liquidity-added" id="markets-liquidity" />
              <Label htmlFor="markets-liquidity" className="text-sm">
                Liquidity Added
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Proposed by Filter */}
        <div>
          <h3 className="font-medium mb-3">Proposed by</h3>
          <RadioGroup defaultValue="all" className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="proposed-all" />
              <Label htmlFor="proposed-all" className="text-sm">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="me" id="proposed-me" />
              <Label htmlFor="proposed-me" className="text-sm">
                Me
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="others" id="proposed-others" />
              <Label htmlFor="proposed-others" className="text-sm">
                Others
              </Label>
            </div>
          </RadioGroup>
        </div>
      </Card>
    </div>
  )
}
