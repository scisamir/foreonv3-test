"use client"

import { Moon, Sun, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import { WalletConnectModal } from "./wallet-connect-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useWalletCustom } from "./WalletConnectionContext"

export function ForeonHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { address, connected, walletName, balance, connect, disconnect, connecting } = useWalletCustom();

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      <header
       className={`sticky top-0 z-50 w-full backdrop-blur-md transition-shadow ${
       typeof window !== "undefined" && window.scrollY > 10 ? "shadow-md" : ""
       }`}
       style={{
         backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(246, 238, 255, 0.85)",
   }}  
   >

        <div className="flex flex-col text-[#22005D]">
          {/* Main header row */}
          <div className="container mx-auto flex items-center justify-between px-8 py-4">
            {/* Logo section */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/foreon-logo.svg" alt="Foreon Logo" width={24} height={24} className="md:w-8 md:h-8" />
              <span className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">Foreon</span>
            </Link>

            {/* Desktop navigation - hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-0 text-sm">
              <Link href="/">
                <Button
                  variant="ghost"
                  className={
                    isActive("/")
                      ? "text-white font-medium rounded-full px-4 py-2 h-10 whitespace-nowrap"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full px-4 py-2 h-10 whitespace-nowrap"
                  }
                  style={
                    isActive("/")
                      ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                      : {}
                  }
                >
                  <Image
                    src="/icons/slideshow-line.svg"
                    alt=""
                    width={14}
                    height={14}
                    className={`${isActive("/") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                  />
                  Markets
                </Button>
              </Link>

              <Link href="/activity">
                <Button
                  variant="ghost"
                  className={
                    isActive("/activity")
                      ? "text-white font-medium rounded-full px-4 py-2 h-10 whitespace-nowrap"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full px-4 py-2 h-10 whitespace-nowrap"
                  }
                  style={
                    isActive("/activity")
                      ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                      : {}
                  }
                >
                  <Image
                    src="/icons/activity.svg"
                    alt=""
                    width={14}
                    height={14}
                    className={`${isActive("/activity") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                  />
                  Activity
                </Button>
              </Link>

              <Link href="/rank">
                <Button
                  variant="ghost"
                  className={
                    isActive("/rank")
                      ? "text-white font-medium rounded-full px-4 py-2 h-10 whitespace-nowrap"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full px-4 py-2 h-10 whitespace-nowrap"
                  }
                  style={
                    isActive("/rank")
                      ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                      : {}
                  }
                >
                  <Image
                    src="/icons/reports.svg"
                    alt=""
                    width={14}
                    height={14}
                    className={`${isActive("/rank") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                  />
                  Rank
                </Button>
              </Link>

              <Link href="/proposed-market">
                <Button
                  variant="ghost"
                  className={
                    isActive("/proposed-market")
                      ? "text-white font-medium rounded-full px-4 py-2 h-10 whitespace-nowrap"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full px-4 py-2 h-10 whitespace-nowrap"
                  }
                  style={
                    isActive("/proposed-market")
                      ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                      : {}
                  }
                >
                  <Image
                    src="/icons/small-shop.svg"
                    alt=""
                    width={14}
                    height={14}
                    className={`${isActive("/proposed-market") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                  />
                  Proposed Market
                </Button>
              </Link>

              <Link href="/portfolio">
                <Button
                  variant="ghost"
                  className={
                    isActive("/portfolio")
                      ? "text-white font-medium rounded-full px-4 py-2 h-10 whitespace-nowrap"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full px-4 py-2 h-10 whitespace-nowrap"
                  }
                  style={
                    isActive("/portfolio")
                      ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                      : {}
                  }
                >
                  <Image
                    src="/icons/briefcase-2-line.svg"
                    alt=""
                    width={14}
                    height={14}
                    className={`${isActive("/portfolio") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                  />
                  Portfolio
                </Button>
              </Link>
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Desktop search - hidden on mobile */}
              <div className="p-[-8px] relative items-center hidden lg:flex">
                <Input
                  placeholder="Search Market"
                  className="pl-4 pr-12 w-50 bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 rounded-full text-gray-500 placeholder:text-gray-400"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full"
                  style={{ backgroundColor: "#5138F6" }}
                >
                  <Image src="/icons/search-icon-correct.svg" alt="Search" width={30} height={30} />
                </Button>
              </div>

              {/* Connect Wallet Button */}
              {connected ? (
                <div className="relative">
                  {/* Trigger Button */}
                  <button
                    onClick={() => setIsWalletDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 rounded-full focus:outline-none"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium hidden sm:inline">
                      {address.slice(0, 4)}...{address.slice(-4)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isWalletDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isWalletDropdownOpen && (
                    <div
                      className="absolute flex right-0 mt-2 w-auto bg-white dark:bg-gray-800 border border-gray-200 
                                dark:border-gray-700 rounded-lg shadow-lg z-[9999]"
                    >
                      <button
                        onClick={() => {
                          disconnect()
                          setIsWalletDropdownOpen(false)
                        }}
                        className="block w-full whitespace-nowrap text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 
                                  dark:hover:bg-red-900/20 px-3 py-2 rounded-md"
                      >
                        Disconnect wallet
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  className="text-white font-medium rounded-full px-4 py-2 text-sm md:px-6"
                  style={{
                    background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)",
                  }}
                  onClick={() => setIsWalletModalOpen(true)}
                >
                  Connect Wallet
                </Button>
              )}
              {/* Theme toggle - hidden on mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="bg-white/90 dark:bg-gray-800/90 rounded-full hidden md:flex"
              >
                {theme === "dark" ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5" />}
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden bg-white/90 dark:bg-gray-800/90 rounded-full ${theme === "dark" ? "text-white" : ""}`}
              >
                <Image src="/icons/menu-icon.svg" alt="Menu" width={24} height={24} />
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-4 pb-3 lg:hidden">
            <div className="relative flex items-center">
              <Input
                placeholder="Search Market"
                className="pl-4 pr-12 w-full bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 rounded-full text-gray-500 placeholder:text-gray-400"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full"
                style={{ backgroundColor: "#5138F6" }}
              >
                <Image src="/icons/search-icon-correct.svg" alt="Search" width={30} height={30} />
              </Button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700">
              <nav className="flex flex-col p-4 space-y-2">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive("/")
                        ? "text-white font-medium rounded-full"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full"
                    }`}
                    style={
                      isActive("/")
                        ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                        : {}
                    }
                  >
                    <Image
                      src="/icons/slideshow-line.svg"
                      alt=""
                      width={14}
                      height={14}
                      className={`mr-2 ${isActive("/") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                    />
                    Markets
                  </Button>
                </Link>

                <Link href="/activity" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive("/activity")
                        ? "text-white font-medium rounded-full"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full"
                    }`}
                    style={
                      isActive("/activity")
                        ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                        : {}
                    }
                  >
                    <Image
                      src="/icons/activity.svg"
                      alt=""
                      width={14}
                      height={14}
                      className={`mr-2 ${isActive("/activity") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                    />
                    Activity
                  </Button>
                </Link>

                <Link href="/rank" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive("/rank")
                        ? "text-white font-medium rounded-full"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full"
                    }`}
                    style={
                      isActive("/rank")
                        ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                        : {}
                    }
                  >
                    <Image
                      src="/icons/reports.svg"
                      alt=""
                      width={14}
                      height={14}
                      className={`mr-2 ${isActive("/rank") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                    />
                    Rank
                  </Button>
                </Link>

                <Link href="/proposed-market" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive("/proposed-market")
                        ? "text-white font-medium rounded-full"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full"
                    }`}
                    style={
                      isActive("/proposed-market")
                        ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                        : {}
                    }
                  >
                    <Image
                      src="/icons/small-shop.svg"
                      alt=""
                      width={14}
                      height={14}
                      className={`mr-2 ${isActive("/proposed-market") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                    />
                    Proposed Market
                  </Button>
                </Link>

                <Link href="/portfolio" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive("/portfolio")
                        ? "text-white font-medium rounded-full"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full"
                    }`}
                    style={
                      isActive("/portfolio")
                        ? { background: "linear-gradient(135deg, #00A9B7 -1.33%, #4C32F2 47.36%, #9F00BE 95.53%)" }
                        : {}
                    }
                  >
                    <Image
                      src="/icons/briefcase-2-line.svg"
                      alt=""
                      width={14}
                      height={14}
                      className={`mr-2 ${isActive("/portfolio") ? "brightness-0 invert" : "brightness-0 dark:invert"}`}
                    />
                    Portfolio
                  </Button>
                </Link>

                {/* Theme toggle in mobile menu */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark")
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full justify-start text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full"
                >
                  {theme === "dark" ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false)
        }}
      />
    </>
  )
}
