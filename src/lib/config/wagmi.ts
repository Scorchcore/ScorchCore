import { defineChain } from "viem";
import { ronin } from "viem/chains";
import { createConfig, createStorage, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { roninWaypointConnector } from "./WaypointWagmiConnector"; // Importa tu nuevo conector personalizado

// 1. Forzar definición limpia de la red Saigon L2 libre de bugs antiguos
export const saigonL2 = defineChain({
  id: 202601,
  name: "Ronin Saigon Testnet",
  nativeCurrency: { name: "RON", symbol: "RON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://saigon-testnet.roninchain.com/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "Saigon Explorer",
      url: "https://saigon-explorer.roninchain.com/",
    },
  },
});

// Volatile memory storage: wagmi won't write to localStorage on reload
const memoryStorage = createStorage({
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
});

// 2. Configuración limpia y modular de Wagmi compatible con Next.js Turbopack
export const config = createConfig({
  storage: memoryStorage,
  chains: [saigonL2, ronin],
  transports: {
    [ronin.id]: http("https://api.roninchain.com/rpc"),
    [saigonL2.id]: http("https://saigon-testnet.roninchain.com/rpc"),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [
    injected({
      target: () => {
        if (typeof window === "undefined") return undefined;

        // Ronin Wallet Extension expone el provider EIP-1193 en window.ronin.provider
        const roninWallet = (
          window as Window & { ronin?: { provider?: unknown } }
        ).ronin;
        if (roninWallet?.provider) {
          return {
            id: "ronin",
            name: "Ronin Extension",
            provider: roninWallet.provider as any,
          };
        }

        // Fallback: Ronin también inyecta en window.ethereum con flag isRonin
        const eth = (
          window as Window & {
            ethereum?: { isRonin?: boolean; provider?: unknown };
          }
        ).ethereum;
        if (eth?.isRonin) {
          return {
            id: "ronin",
            name: "Ronin Extension",
            provider: eth as any,
          };
        }

        return undefined;
      },
      shimDisconnect: false,
    }),
    roninWaypointConnector({
      clientId: process.env.NEXT_PUBLIC_WAYPOINT_CLIENT_ID || "",
      chainId: 202601,
    }),
  ],
  ssr: true,
});

export { ronin, saigonL2 as roninTestnet };
export const RONIN_MAINNET_ID = ronin.id;
export const RONIN_TESTNET_ID = saigonL2.id;
