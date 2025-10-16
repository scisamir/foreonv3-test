"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Share, Heart, Plus, Minus, UnfoldHorizontal, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForeonHeader } from "@/components/foreon-header"
import Link from "next/link"
import { fetchMarketData } from "@/lib/markets"
import { Market } from "@/lib/types"
import { useRouter } from "next/navigation"
import { YesMarketBuy } from "@/e2e/market/yes_market_buy"
import { useWalletCustom } from "@/components/WalletConnectionContext"
import { YesMarketSell } from "@/e2e/market/yes_market_sell"
import { NoMarketBuy } from "@/e2e/market/no_market_buy"
import { NoMarketSell } from "@/e2e/market/no_market_sell"
import BackButton from "@/components/BackButton"
import { toast, ToastContainer } from 'react-toastify';

export default function MarketPage({ params }: { params: { id: string } }) {
  const { txBuilder, blockchainProvider, walletCollateral, walletUtxos, walletVK, walletSK, address, wallet, refreshWalletState, connected } = useWalletCustom();

  const [amount, setAmount] = useState<number | "">("")
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy")
  const [shareType, setShareType] = useState<"yes" | "no">("yes")

  const [market, setMarket] = useState<Market | undefined>(undefined)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  useEffect(() => {
    refreshWalletState();
  }, [isProcessing])

  const router = useRouter()

  const getSelectedMarket = async () => {
    if (!blockchainProvider) throw new Error('blockchainProvider not found');
    const markets = await fetchMarketData(blockchainProvider)
    const selectedMarket = markets.find((m) => m.id === params.id)

    return selectedMarket;
  }

  useEffect(() => {
    const fetchSelectedMarket = async () => {
      try {
        const selectedMarket = await getSelectedMarket();
        setMarket(selectedMarket || undefined);
      } catch (err) {
        console.error("Error fetching selected market:", err);
        setMarket(undefined);
      }
    };

    fetchSelectedMarket();
  }, [params.id])

  const orderBookData = {
    bids: [
      { price: "8USDM", shares: 12580, total: "3,874 USDM" },
      { price: "14USDM", shares: 368, total: "6,901 USDM" },
      { price: "15USDM", shares: 479, total: "207.36 USDM" },
      { price: "18USDM", shares: 963, total: "800 USDM" },
      { price: "23USDM", shares: 4201, total: "632.23 USDM" },
      { price: "25USDM", shares: 500, total: "1,972 USDM" },
    ],
    asks: [
      { price: "8USDM", shares: 12580, total: "3,874 USDM" },
      { price: "14USDM", shares: 368, total: "6,901 USDM" },
      { price: "15USDM", shares: 479, total: "207.36 USDM" },
      { price: "18USDM", shares: 963, total: "800 USDM" },
      { price: "23USDM", shares: 4201, total: "632.23 USDM" },
      { price: "25USDM", shares: 500, total: "1,972 USDM" },
    ],
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

  const handleYesBuy = async () => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider || !market) return

    let txHash = "";
    try {
      txHash = await YesMarketBuy(
        txBuilder,
        blockchainProvider,
        wallet,
        address,
        walletCollateral,
        walletUtxos,
        walletVK,
        walletSK,
        Number(amount),
        market.marketHash,
        market.marketScript,
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
      console.log("Yes market buy tx hash:", txHash);
      setAmount(0);
      setTimeout(() => router.push('/'), 5000)
    });
  }

  const handleYesSell = async () => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider || !market) return

    let txHash = "";
    try {
      txHash = await YesMarketSell(
        txBuilder,
        blockchainProvider,
        wallet,
        address,
        walletCollateral,
        walletUtxos,
        walletVK,
        walletSK,
        Number(amount),
        market.marketHash,
        market.marketScript,
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
      console.log("Yes market sell tx hash:", txHash);
      setAmount(0);
      setTimeout(() => router.push('/'), 5000)
    });
  }

  const handleNoBuy = async () => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider || !market) return

    let txHash = "";
    try {
      txHash = await NoMarketBuy(
        txBuilder,
        blockchainProvider,
        wallet,
        address,
        walletCollateral,
        walletUtxos,
        walletVK,
        walletSK,
        Number(amount),
        market.marketHash,
        market.marketScript,
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
      console.log("No market buy tx hash:", txHash);
      setAmount(0);
      setTimeout(() => router.push('/'), 5000)
    });
  }

  const handleNoSell = async () => {
    setIsProcessing(true);
    if (!txBuilder || !walletCollateral || !blockchainProvider || !market) return

    let txHash = "";
    try {
      const txHash = await NoMarketSell(
        txBuilder,
        blockchainProvider,
        wallet,
        address,
        walletCollateral,
        walletUtxos,
        walletVK,
        walletSK,
        Number(amount),
        market.marketHash,
        market.marketScript,
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
      console.log("No market sell tx hash:", txHash);
      setAmount(0);
      setTimeout(() => router.push('/'), 5000)
    });
  }

  const handleTrade = async () => {
    if (activeTab === "buy" && shareType === "yes") {
      await handleYesBuy();
    } else if (activeTab === "buy" && shareType === "no") {
      await handleNoBuy();
    } else if (activeTab === "sell" && shareType === "yes") {
      await handleYesSell();
    } else {
      await handleNoSell();
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast */}
      <ToastContainer position='top-right' autoClose={5000} />

      <ForeonHeader />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <BackButton />

            {/* Market Info */}
            <div className="flex items-start gap-4 mb-6">
              <img src={market?.image || "/placeholder.svg"} alt={market?.title} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{market?.title || "Unknown"}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {market?.volume || "0 USDM"}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    23 February, 2025
                  </span>
                  <Button variant="ghost" size="sm">
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Market Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Market Summary</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Lorem ipsum dolor sit amet, consectetur. Semper orci natoque habitant cum. Ut ultricies sed hendrerit
                mauris dictum mauris viverra in dictum. In sit elit ut mauris mus. Sed in sapien elit ut egestas.
                Facilisi sit enim mauris USDM egestas adipiscing faucibus ut sagittis.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Tortor ullamcorper amet ut ut adipiscing porttitor scelerisque. Tincidunt vestibulum integer scelerisque
                quam aliquam mi. Velit ut nunc velit fermentum. Velit quam libero non sed at lacus cursus nulla.
                Dignissim sit.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary">
                Show more
              </Button>
            </div>

            {/* Graph */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Graph</h2>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <span className="text-sm text-muted-foreground">NO</span>
                    <div className="text-2xl font-bold text-red-500">13%</div>
                    <span className="text-sm text-muted-foreground">Chance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">2.3</span>
                    <div className="w-4 h-4 bg-muted rounded"></div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {["All", "1H", "6H", "1D", "1W", "1M"].map((period) => (
                    <Button key={period} variant={period === "All" ? "default" : "ghost"} size="sm">
                      {period}
                    </Button>
                  ))}
                </div>

                {/* Simple chart placeholder */}
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Chart visualization would go here</span>
                </div>
              </div>
            </div>

            {/* Order Book */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Order Book</h2>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Tabs defaultValue="yes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="yes">Trade Yes</TabsTrigger>
                  <TabsTrigger value="no">Trade No</TabsTrigger>
                </TabsList>

                <TabsContent value="yes" className="mt-4">
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 text-sm font-medium">
                      <span>Price</span>
                      <span>Shares</span>
                      <span>Total</span>
                    </div>

                    {/* Bids */}
                    <div className="bg-green-500/10">
                      {orderBookData.bids.map((bid, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 p-3 text-sm border-b border-border/50">
                          <span className="text-green-600 font-medium">{bid.price}</span>
                          <span>{bid.shares.toLocaleString()}</span>
                          <span>{bid.total}</span>
                        </div>
                      ))}
                      <div className="p-3 bg-green-600 text-white text-sm font-medium">Bids</div>
                      <div className="p-2 text-xs text-muted-foreground">
                        Last: 25USDM &nbsp;&nbsp;&nbsp; Spread: 1USDM
                      </div>
                    </div>

                    {/* Asks */}
                    <div className="bg-red-500/10">
                      <div className="p-3 bg-red-600 text-white text-sm font-medium">Asks</div>
                      {orderBookData.asks.map((ask, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 p-3 text-sm border-b border-border/50">
                          <span className="text-red-600 font-medium">{ask.price}</span>
                          <span>{ask.shares.toLocaleString()}</span>
                          <span>{ask.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="no">
                  <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                    Trade No order book would be displayed here
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Buy/Sell Toggle */}
              <div className="flex gap-2 mb-6">
                <Button
                  className={`flex-1 ${activeTab === "buy" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  onClick={() => setActiveTab("buy")}
                >
                  Buy
                </Button>
                <Button
                  className={`flex-1 ${activeTab === "sell" ? "bg-red-500 hover:bg-red-500" : "bg-muted hover:bg-red-500 text-muted-foreground"} border-red-200 border`}
                  onClick={() => setActiveTab("sell")}
                >
                  Sell
                </Button>
                <Button variant="outline" className="px-3 bg-transparent">
                  Market ▼
                </Button>
              </div>

              {/* Yes/No Buttons */}
              <div className="flex gap-2 mb-6">
                <Button
                  onClick={() => setShareType("yes")}
                  variant="outline"
                  className={`flex-1 ${shareType === "yes" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-transparent"}`}
                >Yes ${(Number(market?.options[0].percentage.replace('%', '')) / 100).toFixed(2) || 0.00} USDM</Button>
                <Button
                  onClick={() => setShareType("no")}
                  variant="outline"
                  className={`flex-1 ${shareType === "no" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-transparent"}`}
                >
                  No ${(Number(market?.options[1].percentage.replace('%', '')) / 100).toFixed(2) ?? 0.00} USDM
                </Button>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Your Amount</label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAmount((prev) => (Number(prev) > 0 ? Number(prev) - 1 : ""))}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAmount(val === "" ? "" : Number(val));
                    }}
                    className="text-center"
                    placeholder="0 shares"
                  />
                  <Button variant="outline" size="sm" onClick={() => setAmount((prev) => (prev === "" ? 1 : Number(prev) + 1))}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Price</span>
                  <span>0.5 USDM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shares</span>
                  <span>{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential Return</span>
                  <span>0 USDM</span>
                </div>
              </div>

              {/* Buy Button */}
              <Button
                disabled={isProcessing}
                onClick={handleTrade}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  activeTab === "buy" ? "Buy" : "Sell"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
