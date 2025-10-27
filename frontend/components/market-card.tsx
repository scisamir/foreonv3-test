"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface MarketCardProps {
  title: string
  image: string
  chance: string
  options: Array<{
    name: string
    percentage: string
    type: "yes" | "no"
  }>
  volume: string
  icon?: string
  id?: string
}

export function MarketCard({ title, image, chance, options, volume, icon, id }: MarketCardProps) {
  const marketId =
    id ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const chancePercentage = Number.parseInt(chance.replace("%", ""))
  const totalBars = 20
  const filledBars = Math.round((chancePercentage / 100) * totalBars)

  const isLowChance = chancePercentage < 50
  const progressBarColor = isLowChance ? "bg-[#F2994A]" : "bg-green-500"

  const router = useRouter();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-[#3B3B3B] dark:border-gray-600">
      <CardContent className="p-0">
        <Link href={`/market/${marketId}`} className="block">
          <div className="flex flex-col items-center justify-between gap-4 px-4">
            <div className="flex items-center flex-start gap-4 mb-3 w-full">
              <img src={image || "/placeholder.svg"} alt={title} className="object-cover inline-block w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" />
              <h3 className="font-semibold text-sm text-foreground mb-3 line-clamp-2 min-w-0">{title}</h3>
            </div>

            <div className="flex items-center justify-between mb-3 w-full">
              <span className="block text-sm font-medium text-foreground">{chance} Chance</span>

              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: totalBars }, (_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-3 rounded-sm ${
                        index < filledBars ? progressBarColor : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 mb-5 w-full">
              <Button
                size="sm"
                className="flex-1 h-8 w-auto bg-green-100 hover:bg-green-200 text-green-700 border-0 dark:bg-green-900/30 dark:hover:bg-green-900/40 dark:text-green-400"
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/market/${marketId}`)
                }}
              >
                Yes
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8 w-auto bg-red-100 hover:bg-red-200 text-red-700 border-0 dark:bg-red-900/30 dark:hover:bg-red-900/40 dark:text-red-400"
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/market/${marketId}`)
                }}
              >
                No
              </Button>
            </div>
          </div>
        </Link>

        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-primary font-medium">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="16" height="16" rx="8" fill="url(#paint0_linear_11372_144106)" />
              <g clipPath="url(#clip0_11372_144106)">
                <path
                  d="M5 8.00008H6.33333V11.0001H5V8.00008ZM9.66667 6.66675H11V11.0001H9.66667V6.66675ZM7.33333 4.66675H8.66667V11.0001H7.33333V4.66675Z"
                  fill="white"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_11372_144106"
                  x1="-0.212154"
                  y1="-0.212154"
                  x2="15.2846"
                  y2="15.2846"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#00A9B7" />
                  <stop offset="0.5027" stopColor="#4C32F2" />
                  <stop offset="1" stopColor="#9F00BE" />
                </linearGradient>
                <clipPath id="clip0_11372_144106">
                  <rect width="8" height="8" fill="white" transform="translate(4 4)" />
                </clipPath>
              </defs>
            </svg>
            <span>{volume}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault()
              // Handle favorite action here
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
