"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CancelOrderModal({ isOpen, onClose }: CancelOrderModalProps) {
  if (!isOpen) return null

  const handleCancel = () => {
    // Handle order cancellation logic here
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cancel Order</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your order has been returned by system, because there is no available ask/bid for matching. You may cancel
            the order now.
          </p>

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={handleCancel}
          >
            Cancel Order
          </Button>
        </div>
      </Card>
    </div>
  )
}
