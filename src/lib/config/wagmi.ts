import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { ronin } from "viem/chains";
import { defineChain } from "viem";
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
    default: { name: "Saigon Explorer", url: "https://saigon-explorer.roninchain.com/" },
  },
});

// 2. Configuración limpia y modular de Wagmi compatible con Next.js Turbopack
export const config = createConfig({
  chains: [saigonL2, ronin],
  transports: {
    [ronin.id]: http("https://api.roninchain.com/rpc"),
    [saigonL2.id]: http("https://saigon-testnet.roninchain.com/rpc"),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [
    injected({
      target: () => {
        const provider =
          typeof window !== "undefined" && (window as any).ronin
            ? (window as any).ronin
            : undefined;
        return {
          id: "ronin",
          name: "Ronin Extension",
          provider,
        };
      },
      shimDisconnect: true,
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