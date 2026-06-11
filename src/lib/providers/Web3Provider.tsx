"use client";

import { TantoProvider } from "@sky-mavis/tanto-widget";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { WagmiProvider } from "wagmi";
import { config, RONIN_TESTNET_ID } from "@/lib/config/wagmi";
import { EmotionRegistry } from "@/lib/providers/EmotionRegistry";

/**
 * Web3 Provider — Tanto Widget (estándar oficial de Ronin)
 *
 * ARQUITECTURA:
 * ┌─────────────────────────┐
 * │  wagmi (getDefaultConfig)│ ← conectores oficiales de Sky Mavis
 * │  Ronin Wallet + Waypoint │   (@sky-mavis/tanto-widget)
 * └──────────┬──────────────┘
 *            ↓
 * ┌─────────────────────────┐
 * │  TanStack Query          │ ← caché compartida (wagmi + queries propias)
 * └──────────┬──────────────┘
 *            ↓
 * ┌─────────────────────────┐
 * │  TantoProvider           │ ← modal de conexión oficial (UI)
 * └──────────┬──────────────┘
 *            ↓
 *           App
 *
 * La conexión de wallet (extensión Ronin, Waypoint keyless) la gestiona el
 * Tanto Widget; el resto de la app consume wagmi hooks como siempre.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <EmotionRegistry>
          <TantoProvider
            theme="dark"
            config={{ initialChainId: RONIN_TESTNET_ID }}
          >
            {children}
          </TantoProvider>
        </EmotionRegistry>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
