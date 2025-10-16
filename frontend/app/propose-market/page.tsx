"use client"
import { ForeonHeader } from "@/components/foreon-header"
import { ProposeMarketForm } from "@/components/propose-market-form"

export default function ProposeMarketPage() {
  return (
    <div className="min-h-screen bg-background">
      <ForeonHeader />
      <ProposeMarketForm />
    </div>
  )
}
