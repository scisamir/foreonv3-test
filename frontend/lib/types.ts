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

export interface AllowedAsset {
  isStable: boolean;
  policyId: string;
  assetNameHex: string;
  multiplier: number;
}

export interface GlobalSetting {
  id: number | string;
  minimumMarketAmount: number;
  adminMultisig: string;
  allowedAssets: AllowedAsset[];
}

export interface SettingMarket {
  id: number;
  name: string;
  resolved: boolean;
  winner?: "YES" | "NO";
}

export interface CreateSettingsLSItem {
  globalSetting: GlobalSetting;
  signedTx1: string;
}
