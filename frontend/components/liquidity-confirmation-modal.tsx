"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface LiquidityConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  type: "confirm" | "cancel"
  onConfirm: () => void
}

export function LiquidityConfirmationModal({ isOpen, onClose, type, onConfirm }: LiquidityConfirmationModalProps) {
  if (!isOpen) return null

  const isCancel = type === "cancel"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isCancel ? "Cancel Add Liquidity" : "Add Liquidity"}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isCancel
              ? "If you cancel, all data will be discarded. This action cannot be reversed."
              : "The liquidity information will be sent to your email after proposing market. This action cannot be reversed."}
          </p>

          <p className="text-sm font-medium">Are you sure you want to proceed?</p>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              {isCancel ? "No" : "Cancel"}
            </Button>
            <Button
              className={`flex-1 ${isCancel ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}`}
              onClick={onConfirm}
            >
              {isCancel ? "Yes" : "Confirm"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
