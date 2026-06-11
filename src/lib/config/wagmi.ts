/**
 * Configuración wagmi vía Tanto Widget (estándar oficial de Ronin)
 *
 * `getDefaultConfig` crea los conectores oficiales de Sky Mavis:
 * - Ronin Wallet (extensión / mobile, EIP-6963)
 * - Ronin Waypoint (keyless, requiere NEXT_PUBLIC_WAYPOINT_CLIENT_ID)
 *
 * WalletConnect queda deshabilitado en fase 1 (extensión + Waypoint primero).
 * Las chains vienen de viem/chains: saigon = Saigon L2 (202601) y ronin (2020).
 */

import { getDefaultConfig } from "@sky-mavis/tanto-widget";
import { ronin, saigon } from "viem/chains";
import { createStorage, http } from "wagmi";

// Volatile memory storage: wagmi won't write to localStorage on reload
const memoryStorage = createStorage({
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
});

const waypointClientId = process.env.NEXT_PUBLIC_WAYPOINT_CLIENT_ID || "";

export const config = getDefaultConfig({
  chains: [saigon, ronin],
  transports: {
    [ronin.id]: http("https://api.roninchain.com/rpc"),
    [saigon.id]: http("https://saigon-testnet.roninchain.com/rpc"),
  },
  storage: memoryStorage,
  ssr: true,
  appMetadata: {
    appName: "ScorchCore",
    appDescription:
      "Transform Axie Infinity NFTs into CoreMiners that mine $CORE on Ronin",
  },
  // Waypoint (keyless) solo si hay client ID; getDefaultConfig lanza si está vacío
  keylessWalletConfig: waypointClientId
    ? { clientId: waypointClientId, chainId: saigon.id }
    : { enable: false },
  walletConnectConfig: {
    enable: false,
  },
});

export { ronin, saigon as roninTestnet, saigon as saigonL2 };
export const RONIN_MAINNET_ID = ronin.id;
export const RONIN_TESTNET_ID = saigon.id;
