"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface ClaimRewardModalProps {
  isOpen: boolean
  onClose: () => void
  amount: string
}

export function ClaimRewardModal({ isOpen, onClose, amount }: ClaimRewardModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleClaim = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Claim Reward</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-muted-foreground">Your reward is being claimed, please wait for some blocks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to claim the final reward amount of{" "}
              <span className="font-semibold text-foreground">{amount} USDM</span> to your wallet address?
            </p>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleClaim}>
                Claim
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
