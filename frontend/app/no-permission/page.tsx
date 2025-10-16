import { ForeonHeader } from "@/components/foreon-header"

export default function NoPermissionPage() {
  return (
    <div className="min-h-screen bg-background">
      <ForeonHeader />

      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="relative w-48 h-32 mx-auto">
              {/* UFO Illustration */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-16 bg-gradient-to-b from-purple-200 to-purple-300 rounded-full opacity-80"></div>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full"></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-600 rounded-full"></div>
              </div>

              {/* Beam */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[40px] border-r-[40px] border-t-[60px] border-l-transparent border-r-transparent border-t-purple-200 opacity-60"></div>

              {/* Cow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-8 bg-white rounded-lg border-2 border-gray-300">
                  <div className="w-2 h-2 bg-black rounded-full mt-1 ml-2"></div>
                  <div className="w-2 h-2 bg-black rounded-full mt-1 ml-6"></div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-4">You do not have permission in voting</h1>

          <p className="text-muted-foreground">You need to own at least 25,000 $FRN or 1 FRN NFT.</p>
        </div>
      </main>
    </div>
  )
}
