"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useWalletCustom } from "./WalletConnectionContext"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

type DetectedWallet = {
  key: string;
  name: string;
  icon?: string;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connect } = useWalletCustom();
  const [availableWallets, setAvailableWallets] = useState<DetectedWallet[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).cardano) {
      const cardano = (window as any).cardano;
      const detected: DetectedWallet[] = Object.keys(cardano)
        .filter(key => cardano[key].enable)
        .map(key => ({
          key,
          name: cardano[key].name,
          icon: cardano[key].icon,
        }));
        setAvailableWallets(detected);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Get started on Foreon</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            By connecting your wallet, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            &{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {availableWallets.map((wallet, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-12 justify-start gap-3 hover:bg-muted/50 bg-transparent"
              onClick={async () => {
                // Handle wallet connection
                await connect(wallet.key, true);
                onClose()
              }}
            >
              {wallet.icon && (
                <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">{wallet.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
