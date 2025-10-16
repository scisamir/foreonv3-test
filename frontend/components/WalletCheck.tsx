"use client";

import { usePathname, useRouter } from "next/navigation";
import { useWalletCustom } from "@/components/WalletConnectionContext";
import React from "react";
import { ForeonHeader } from "./foreon-header";
import { Button } from "./ui/button";

export function WalletCheck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { connected } = useWalletCustom();

  const isHomePage = pathname === "/";
  const shouldShowConnectScreen = !isHomePage && !connected;

  if (shouldShowConnectScreen) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
        <ForeonHeader />

        <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground mb-6">
              Please connect your Cardano wallet to access this page and
              participate in Foreon prediction markets.
            </p>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="rounded-full px-6"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
