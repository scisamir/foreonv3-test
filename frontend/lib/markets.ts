import { DepositAddr } from "@/e2e/deposit/validator"
import { LiquidtyMarket, Market, MarketFormData } from "./types"
import { BlockchainProviderType, MarketDatumType } from "@/e2e/types"
import { getMarketUtxoOptimized } from "@/e2e/utils"
import { deserializeDatum } from "@meshsdk/core"
import { setup } from "@/e2e/setup"

export const defaultMarkets = [
  {
    id: "1",
    title: "Import duty to increase in Q2 market, 2024",
    image: "/import-duty-chart.jpg",
    status: "pending" as const,
    createdAt: "2 days ago",
    creator: "TradeAnalyst",
  },
  {
    id: "2",
    title: "Democratic presidential Nominee for 2024",
    image: "/democratic-candidate.jpg",
    status: "approved" as const,
    createdAt: "1 day ago",
    creator: "PoliticalWatcher",
  },
  {
    id: "3",
    title: "Who will win the 2024/2025 EPL season?",
    image: "/premier-league-trophy.jpg",
    status: "active" as const,
    createdAt: "5 days ago",
    creator: "SportsExpert",
  },
  {
    id: "4",
    title: "BTC to get to $100,000 by the end of December",
    image: "/bitcoin-chart.jpg",
    status: "approved" as const,
    createdAt: "3 days ago",
    creator: "CryptoAnalyst",
  },
  {
    id: "5",
    title: "Will the next Agent 007 (after 'No Time To Die') be black?",
    image: "/james-bond-007.jpg",
    status: "ended" as const,
    createdAt: "2 weeks ago",
    creator: "MovieBuff",
  },
  {
    id: "6",
    title: "Will Charles III still be the King of England at the end of 2025?",
    image: "/king-charles-crown.jpg",
    status: "active" as const,
    createdAt: "1 week ago",
    creator: "RoyalWatcher",
  },
  {
    id: "7",
    title: "2025 Miami Grand Prix Winner?",
    image: "/formula-1-racing.jpg",
    status: "ended" as const,
    createdAt: "3 weeks ago",
    creator: "F1Fan",
  },
  {
    id: "8",
    title: "Will Elon Musk Buy TikTok?",
    image: "/elon-musk-profile.jpg",
    status: "pending" as const,
    createdAt: "6 hours ago",
    creator: "TechInsider",
  },
]

export function getAllMarkets(): typeof defaultMarkets {
  const storedMarkets: MarketFormData[] = JSON.parse(
    (typeof window !== "undefined" ? localStorage.getItem("marketProposals") : "[]") || "[]"
  )

  const mappedLocalMarkets = storedMarkets.map((m, index) => ({
    id: `local-${index}`,
    title: m.marketTitle,
    image: m.coverImage || "/placeholder.svg",
    status: "approved" as const,
    createdAt: "just now",
    creator: m.email,
  }))

  return [...mappedLocalMarkets, ...defaultMarkets]
}

export function getMarketById(id: string) {
  const allMarkets = getAllMarkets()

  const market = allMarkets.find((m) => m.id === id) || {
    id,
    title: "Unknown Market",
    image: "/placeholder.svg",
    status: "approved" as const,
    createdAt: "just now",
    creator: "Anonymous",
  }

  return {
    ...market,
    summary:
      "Lorem ipsum dolor sit amet consectetur. Semper eros natoque habitant cum. Ut ultricies sed hendrerit tristique dictum pharetra nunc in dictum. In sit sit pharetra risus risus. Sed in sapien elit et egestas. Facilisi eu enim malesuada egestas adipiscing faucibus ut sagittis.",
    extendedSummary:
      "Tortor ullamcorper amet ut at adipiscing porttitor scelerisque lacus. Tincidunt vestibulum integer scelerisque quam aliquet mi. Velit et nunc velit fermentum. Velit quam libero non sed et lacus cursus nulla. Dignissim sit.",
    marketType: "Single outcome",
    resolveMethod: "Manually",
    tradingTime: "23 Feb 2025 - 21 Jan 2026",
    categories: "Business, Economics",
    creatorEmail: market.creator,
  }
}

const marketData: Market[] = [
  {
    id: "1",
    title: "Import duty to increase in Q2 market, 2024",
    image: "/import-duty-chart.jpg",
    chance: "38%",
    options: [
      { name: "Yes", percentage: "68%", type: "yes" as const },
      { name: "No", percentage: "32%", type: "no" as const },
    ],
    volume: "569,236,056 USDM",
    marketHash: "",
    marketScript: "",
    endTime: "1761559928",
    resolved: false,
  },
  {
    id: "2",
    title: "Democratic presidential Nominee for 2024",
    image: "/democratic-candidate.jpg",
    chance: "68%",
    options: [
      { name: "Donald Trump", percentage: "68%", type: "yes" as const },
      { name: "Kamala Harris", percentage: "12%", type: "yes" as const },
    ],
    volume: "569,236,056 USDM",
    marketHash: "",
    marketScript: "",
    endTime: "1761559928",
    resolved: false,
  },
  {
    id: "3",
    title: "Who will win the 2024/2025 EPL season?",
    image: "/premier-league-trophy.png",
    chance: "68%",
    options: [
      { name: "Arsenal", percentage: "68%", type: "yes" as const },
      { name: "Manchester City", percentage: "12%", type: "yes" as const },
    ],
    volume: "569,236,056 USDM",
    marketHash: "",
    marketScript: "",
    endTime: "1761559928",
    resolved: true,
  },
  {
    id: "4",
    title: "BTC to get to $100,000 by the end of December",
    image: "/bitcoin-chart.png",
    chance: "78%",
    options: [
      { name: "Yes", percentage: "78%", type: "yes" as const },
      { name: "No", percentage: "22%", type: "no" as const },
    ],
    volume: "569,236,056 USDM",
    marketHash: "",
    marketScript: "",
    endTime: "1761559928",
    resolved: true,
  },
  {
    id: "5",
    title: "Will the next Agent 007 (after 'No Time To Die') be black?",
    image: "/james-bond-007.jpg",
    chance: "38%",
    options: [
      { name: "Yes", percentage: "38%", type: "yes" as const },
      { name: "No", percentage: "62%", type: "no" as const },
    ],
    volume: "569,236,056 USDM",
    marketHash: "",
    marketScript: "",
    endTime: "1761559928",
    resolved: false,
  },
  {
    id: "6",
    title: "Will Charles III still be the King of England at the end of 2025?",
    image: "/king-charles-crown.jpg",
    chance: "87%",
    options: [
      { name: "Yes", percentage: "87%", type: "yes" as const },
      { name: "No", percentage: "13%", type: "no" as const },
    ],
    volume: "569,236,056 USDM",
    marketHash: "",
    marketScript: "",
    endTime: "1761559928",
    resolved: true,
  },
  {
    id: "7",
    title: "2025 Miami Grand Prix Winner?",
    image: "/formula-1-racing.jpg",
    chance: "18%",
    options: [
      { name: "Max Verstappen", percentage: "18%", type: "yes" as const },
      { name: "Lando Norris", percentage: "12%", type: "yes" as const },
    ],
    volume: "569,236,056 USDM",
    marketHash: "",
    marketScript: "",
    endTime: "1761559928",
    resolved: true,
  },
  {
    id: "8",
    title: "Will Elon Musk Buy TikTok?",
    image: "/elon-musk-profile.png",
    chance: "18%",
    options: [
      { name: "Yes", percentage: "18%", type: "yes" as const },
      { name: "No", percentage: "82%", type: "no" as const },
    ],
    volume: "569,236,056 USDM",
    marketHash: "",
    marketScript: "",
    endTime: "1761559928",
    resolved: true,
  },
]

export const fetchMarketData = async (blockchainProvider: BlockchainProviderType): Promise<Market[]> => {
  // Fetch proposed markets from localStorage
  const proposals: MarketFormData[] = JSON.parse(
    localStorage.getItem("marketProposals") || "[]"
  )

  // Fetch liquidity info from localStorage
  const liquidity = JSON.parse(localStorage.getItem("liquidity") || "{}")

  // Map liquidity-only entries (in case some markets already exist but not proposals)
  const liquidityMarkets = Object.entries(liquidity).map(([title, info]: [string, any]) => ({
    id: title,
    shares: info.shares,
    yesPrice: info.yesPrice,
    noPrice: info.noPrice,
    email: info.email,
    marketHash: info.marketHash,
    marketScript: info.marketScript,
  }))

  const depositUtxos = await blockchainProvider.fetchAddressUTxOs(DepositAddr);
  const { PrecisionFactor } = setup();

  const getMarketPrices = async (lm: any) => {
    console.log("lm.marketHash:", lm.marketHash);
    const marketUtxo = await getMarketUtxoOptimized(depositUtxos, lm.marketHash);

    if (marketUtxo) {
      const marketDatum = deserializeDatum<MarketDatumType>(marketUtxo.output.plutusData!);

      const q = Number(marketDatum.fields[6].int);
      const pYes = Number(marketDatum.fields[9].int);
      const pNo = Number(marketDatum.fields[10].int);

      return { q, pYes, pNo };
    }

    return { q: 0, pYes: 0, pNo: 0 };
  }

  const lsMarkets = localStorage.getItem("Foreon_Markets") ?? "[]"
  const foreonMarkets: Market[] = JSON.parse(lsMarkets)

  const confirmedMarketsRaw = await Promise.all(liquidityMarkets.map(async (lm) => {
    const proposal = proposals.find((p) => p.email === lm.email)

    let prices = { q: 0, pYes: 0, pNo: 0 };

    if (lm.marketHash) {
      prices = await getMarketPrices(lm);
    } else {
      prices = { q: 100_000, pYes: 5_000, pNo: 5_000 }
    }

    const { q, pYes, pNo } = prices;

    // If market is in localstorage and it's resolved, skip updating the data
    const isMarketInLs = foreonMarkets.find(fm => (fm.id === lm.id && fm.resolved === true))
    if (isMarketInLs) return

    // Note: market data is saved on the DB
    // New market `resolved` value is 'false' by default
    // Every query to get all markets would run this function again but without updating `resolved` value for existing markets on the DB
    // Only admin can update resolved values (when updating market winners)
    return {
      id: lm.id,
      title: proposal?.marketTitle || "Unknown",
      image: proposal?.coverImage || "/placeholder.svg",
      chance: String(Math.round((Number(pYes) / PrecisionFactor) * 100)) + "%",
      options: [
        { name: "Yes", percentage: `${Math.round((Number(pYes) / PrecisionFactor) * 100)}%`, type: "yes" as const },
        { name: "No", percentage: `${Math.round((Number(pNo) / PrecisionFactor) * 100)}%`, type: "no" as const },
      ],
      volume: `${q.toLocaleString()} USDM`,
      marketHash: lm.marketHash,
      marketScript: lm.marketScript,
      endTime: proposal?.endTime ?? "0",
      resolved: false,
  }}));

  const confirmedMarkets = confirmedMarketsRaw.filter(
    (m): m is Market => m !== undefined
  );
  const existingMarkets: Market[] = [...confirmedMarkets.reverse(), ...marketData]
  const filteredFM = foreonMarkets.filter(fm => fm.resolved === true)

  return [...existingMarkets, ...filteredFM];
}
