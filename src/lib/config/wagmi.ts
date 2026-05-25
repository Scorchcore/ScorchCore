import { createConfig, http, type CreateConnectorFn } from "wagmi";
import { ronin, saigon } from "viem/chains";
import { roninWallet, waypoint } from "@sky-mavis/tanto-wagmi";

// Waypoint configuration
// NOTE: Waypoint SDK bundles viem 2.9.2 which only recognizes saigon.id = 2021.
// The rest of the app uses 202601 (current Saigon testnet chain ID).
const waypointConfig = {
  clientId: process.env.NEXT_PUBLIC_WAYPOINT_CLIENT_ID || "",
  chainId: 2021, // Waypoint SDK internal chain ID (old Saigon)
};

// Type assertion needed due to wagmi v2.19+ type changes
// tanto-wagmi connectors work at runtime but have outdated type definitions
const roninWalletConnector = roninWallet() as unknown as CreateConnectorFn;
const waypointConnector = waypoint(
  waypointConfig,
) as unknown as CreateConnectorFn;

// Create wagmi config with Ronin connectors
// IMPORTANT: saigon (testnet) is first to be default when no wallet connected
export const config = createConfig({
  chains: [saigon, ronin], // Testnet first for development
  transports: {
    [ronin.id]: http("https://api.roninchain.com/rpc"),
    [saigon.id]: http("https://saigon-testnet.roninchain.com/rpc"),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [roninWalletConnector, waypointConnector],
  ssr: true,
});

// Re-export chains for convenience
export { ronin, saigon as roninTestnet };

// Chain IDs
export const RONIN_MAINNET_ID = ronin.id;
export const RONIN_TESTNET_ID = saigon.id;
