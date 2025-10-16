"use client";

import React, { ReactNode } from "react";
import { MeshProvider } from "@meshsdk/react";
import { WalletConnectionProvider } from "./WalletConnectionContext";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <MeshProvider>
      <WalletConnectionProvider>
          {children}
      </WalletConnectionProvider>
    </MeshProvider>
  );
}
