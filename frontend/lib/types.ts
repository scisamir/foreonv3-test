export interface MarketFormData {
  coverImage?: string   // optional instead of File | null
  marketTitle: string
  category: string
  startTime: string
  endTime: string
  marketSummary: string
  // marketType: "single" | "multiple"
  marketType: string
  resolveMethod: string
  // resolveMethod: "oracle" | "manual"
  email: string
}

export interface Market {
  id: string
  title: string
  image: string
  chance: string
  options: { name: string; percentage: string; type: "yes" | "no" }[]
  volume: string
  marketHash: string,
  marketScript: string,
}

export interface LiquidtyMarket {
  shares: number,
  yesPrice: number,
  noPrice: number,
  email: string,
  timestamp: string,
  marketHash: string,
  marketScript: string,
}
