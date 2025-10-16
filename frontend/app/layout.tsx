"use client";

import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"
import { ClientProviders } from "@/components/ClientProviders"
import { usePathname } from "next/navigation";
import { useWalletCustom } from "@/components/WalletConnectionContext";
import { WalletCheck } from "@/components/WalletCheck";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Foreon - Prediction Markets</title>
        <meta
          name="description"
          content="Trade on the future with Foreon prediction markets"
        />
      </head>
      <body className={`font-sans ${dmSans.variable}`}>
        {/* <Suspense fallback={<div className="p-6 text-muted-foreground">Loading...</div>}> */}
        <ClientProviders>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <WalletCheck>{children}</WalletCheck>
          </ThemeProvider>
        </ClientProviders>
        {/* </Suspense> */}
        <Analytics />
      </body>
    </html>
  )
}
