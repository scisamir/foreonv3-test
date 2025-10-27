"use client";

import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { ClientProviders } from "@/components/ClientProviders"
import { WalletCheck } from "@/components/WalletCheck"
import Footer from "@/components/Footer"

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Trade on the future with Foreon prediction markets"
        />
      </head>
      <body className={`font-sans ${dmSans.variable}`}>
        <ClientProviders>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <WalletCheck>
              {children}
              <Footer /> {/* Add Footer below all page content */}
            </WalletCheck>
          </ThemeProvider>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}
