import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function HeroCards() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* UEFA Champions League Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 border-0 text-white">
          <div className="p-8 h-64 flex flex-col justify-between">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">⚽</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-balance">2025 UEFA Champions League Winner?</h3>
              <Link href="/market/2025-uefa-champions-league-winner">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                  View Market
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* French Open Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 via-orange-500 to-red-500 border-0 text-white">
          <div className="p-8 h-64 flex flex-col justify-between">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">🎾</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-balance">2025 French Open Men Winner?</h3>
              <Link href="/market/2025-french-open-men-winner">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                  View Market
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Club World Cup Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black border-0 text-white">
          <div className="p-8 h-64 flex flex-col justify-between">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">🏆</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-balance">2025 Club World Cup Winner?</h3>
              <Link href="/market/2025-club-world-cup-winner">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                  View Market
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
