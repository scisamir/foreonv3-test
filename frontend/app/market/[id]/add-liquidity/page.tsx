"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, Plus, Minus, X, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { LiquidityConfirmationModal } from "@/components/liquidity-confirmation-modal"
import { getMarketById } from "@/lib/markets"
import { useRouter } from "next/navigation"
import { useWalletCustom } from "@/components/WalletConnectionContext"
import { createMarket } from "@/e2e/market/create_market"
import { getMarketValidator } from "@/e2e/market/validator"
import { LiquidtyMarket } from "@/lib/types"
import BackButton from "@/components/BackButton"
import { toast, ToastContainer } from 'react-toastify';

export default function AddLiquidityPage({ params }: { params: { id: string } }) {
  const [showMarketInfo, setShowMarketInfo] = useState(false)
  const [shares, setShares] = useState("")
  const [yesPrice, setYesPrice] = useState("")
  const [noPrice, setNoPrice] = useState("")
  const [email, setEmail] = useState("")
  const [showConfirmation, setShowConfirmation] = useState<"confirm" | "cancel" | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const { refreshWalletState, } = useWalletCustom()

  useEffect(() => {
    refreshWalletState();
  }, [isProcessing])

  const { txBuilder, blockchainProvider, walletCollateral, walletUtxos, walletVK, walletSK, address, wallet } = useWalletCustom();

  const router = useRouter()

  const market = getMarketById(params.id)

  const totalLiquidity = Number(shares) * (Number(yesPrice) + Number(noPrice))

  const handleSharesChange = (increment: boolean) => {
    const currentShares = Number(shares) || 0
    if (increment) {
      setShares(String(currentShares + 1))
    } else {
      setShares(String(Math.max(0, currentShares - 1)))
    }
  }

  const handleAddLiquidity = () => {
    setShowConfirmation("confirm")
  }

  // Toast
  const toastSuccess = (txHash: string) => {
    toast.success(<div>
      Success!  
      <br />
      <a
        href={`https://preprod.cardanoscan.io/transaction/${txHash}`} 
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#61dafb", textDecoration: "underline" }}
      >
        View on Explorer
      </a>
    </div>);
  };
  const toastFailure = (err: any) => toast.error(`Failed: ${err instanceof Error ? err.message : String(err)}`);

  const handleConfirmLiquidity = async () => {
    setShowConfirmation(null)

    const existingLiquidity: Record<string, LiquidtyMarket> = JSON.parse(localStorage.getItem("liquidity") || "{}")

    const { MarketHash, MarketValidatorScript } = getMarketValidator(walletUtxos);

    existingLiquidity[market.id] = {
      shares: Number(shares),
      yesPrice: Number(yesPrice),
      noPrice: Number(noPrice),
      email,
      timestamp: new Date().toISOString(),
      marketHash: MarketHash,
      marketScript: MarketValidatorScript,
    }

    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider) {
      toastFailure("Error: Check collateral")
      return;
    }

    let txHash = ""
    try {
      txHash = await createMarket(
        txBuilder,
        blockchainProvider,
        wallet,
        address,
        walletCollateral,
        walletUtxos,
        walletVK,
        walletSK,
        Number(shares),
        Number(yesPrice),
        Number(noPrice),
      );
      txBuilder.reset();
    } catch (e) {
      txBuilder.reset();
      setIsProcessing(false);
      toastFailure(e);
      console.error("e tx:", e);
      return;
    }

    blockchainProvider.onTxConfirmed(txHash, () => {
      txBuilder.reset();
      setIsProcessing(false);
      toastSuccess(txHash);
      console.log("Create market tx hash:", txHash);
      localStorage.setItem("liquidity", JSON.stringify(existingLiquidity))
      console.log("Liquidity added successfully")
      setShares("")
      setYesPrice("")
      setNoPrice("")
      setEmail("")
      setTimeout(() => router.push('/'), 5000)
    });
  }

  const handleCancelLiquidity = () => {
    setShowConfirmation(null)
  }

  const handleCancel = () => {
    setShowConfirmation("cancel")
  }

  const handleModalConfirm = () => {
    if (showConfirmation === "cancel") {
      handleCancelLiquidity();
    } else if (showConfirmation === "confirm") {
      handleConfirmLiquidity();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toast */}
      <ToastContainer position='top-right' autoClose={5000} />

      <div className="container mx-auto px-4 py-8">
        <BackButton />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Market Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={market.image || "/placeholder.svg"}
                  alt={market.title}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{market.title}</h1>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-600">Market Summary</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{market.summary}</p>
                <p>{market.extendedSummary}</p>
              </div>
            </div>

            <Card className="p-6">
              <button
                onClick={() => setShowMarketInfo(!showMarketInfo)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold">Market Information</h3>
                {showMarketInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showMarketInfo && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Status</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Approved
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market type</span>
                    <span>{market.marketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolve method</span>
                    <span>{market.resolveMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market trading time</span>
                    <span>{market.tradingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categories</span>
                    <span>{market.categories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator's email</span>
                    <span>{market.creatorEmail}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Add Liquidity Form */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Add Liquidity</h3>
                <Link href={`/market/${params.id}`}>
                  <Button variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-6">
                {/* Number of Shares */}
                <div>
                  <label className="block text-sm font-medium mb-2">Number of YES-NO shares</label>
                  <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSharesChange(false)}
                      disabled={Number(shares) <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      placeholder="0 shares"
                      className="text-center border-none bg-transparent font-medium flex-1 mx-2"
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleSharesChange(true)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Price Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price of YES</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={yesPrice}
                      onChange={(e) => setYesPrice(e.target.value)}
                      placeholder="0 USDM"
                      className="text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price of NO</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={noPrice}
                      onChange={(e) => setNoPrice(e.target.value)}
                      placeholder="0 USDM"
                      className="text-center"
                    />
                  </div>
                </div>

                {/* Liquidity Info */}
                {Number(shares) > 0 && Number(yesPrice) > 0 && Number(noPrice) > 0 && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    Liquidity provider will have {shares} Yes Shares at {yesPrice} USDM/share,
                    {shares} No Shares at {noPrice} USDM/share
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#00A9B7] via-[#4C32F2] to-[#9F00BE] hover:opacity-90 text-white"
                    onClick={handleAddLiquidity}
                    disabled={!shares || !yesPrice || !noPrice || !email || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Add Liquidity"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <LiquidityConfirmationModal
        isOpen={showConfirmation !== null}
        onClose={() => setShowConfirmation(null)}
        type={showConfirmation || "confirm"}
        // onConfirm={showConfirmation === "cancel" ? handleCancelLiquidity : handleConfirmLiquidity}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}
