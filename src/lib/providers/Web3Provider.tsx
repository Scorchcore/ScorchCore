"use client";

import React, { useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/config/wagmi";
import { waypointService } from "@/lib/services/waypoint";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const log = createServiceLogger("Web3Provider");

/**
 * Web3 Provider - Arquitectura de Capas
 *
 * ARQUITECTURA:
 * ┌─────────────────────┐
 * │  Ronin Waypoint     │  ← CAPA 1: Core/Obligatorio (Source of Truth)
 * │  @sky-mavis/waypoint│     - SDK oficial Sky Mavis
 * └──────────┬──────────┘     - EIP-1193 provider
 *            │                - Requerido para Grant
 *            ↓
 *    EIP-1193 Provider
 *            │
 *            ↓
 * ┌──────────┴──────────┐
 * │  wagmi + tanto      │  ← CAPA 2: Optional (UI/DX)
 * │  Optional Abstraction│    - Hooks React convenientes
 * └──────────┬──────────┘    - Estado UI simplificado
 *            │
 *            ↓
 *       ┌────────┐
 *       │  App   │
 *       └────────┘
 *
 * FLUJO:
 * 1. Waypoint se inicializa primero (source of truth)
 * 2. wagmi envuelve el provider de Waypoint (optional layer)
 * 3. App consume ambas capas según necesidad
 *
 * @see WAYPOINT-MIGRATION.md para detalles de arquitectura
 */

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // ═══════════════════════════════════════════════════════
    // CAPA 1: Inicializar Ronin Waypoint (CORE - Obligatorio)
    // ═══════════════════════════════════════════════════════
    const clientId = process.env.NEXT_PUBLIC_WAYPOINT_CLIENT_ID || "";
    const chainId = 2021; // Waypoint SDK bundles viem 2.9.2 which only supports saigon.id = 2021

    if (clientId) {
      waypointService.initialize({
        clientId,
        chainId,
        redirectUrl:
          typeof window !== "undefined" ? window.location.origin : undefined,
        popupCloseDelay: 4000,
      });
      log.info("Ronin Waypoint SDK initialized successfully", {
        chainId,
        redirectUrl:
          typeof window !== "undefined" ? window.location.origin : undefined,
      });
    } else {
      log.warn("Waypoint SDK initialization failed - missing client ID", {
        envVar: "NEXT_PUBLIC_WAYPOINT_CLIENT_ID",
        impact: "Wallet connection will not work",
      });
    }
  }, []);

  // ═══════════════════════════════════════════════════════
  // CAPA 2: wagmi Provider (OPTIONAL - UI/DX Layer)
  // ═══════════════════════════════════════════════════════
  // wagmi detecta automáticamente el provider de Waypoint
  // y proporciona hooks convenientes (useAccount, useBalance, etc.)
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
