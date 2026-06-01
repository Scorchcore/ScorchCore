import { createConnector } from "wagmi";
import { WaypointProvider } from "@sky-mavis/waypoint";
import { getAddress } from "viem";

/**
 * Workaround: @sky-mavis/waypoint v4.2.2 no soporta chainId 202601 (Saigon L2)
 * internamente. Usamos 2021 para el provider de Waypoint pero reportamos
 * 202601 a wagmi para que las transacciones vayan por el transport correcto.
 */
const WAYPOINT_SUPPORTED_CHAIN = 2021;

function getInternalChainId(configuredChainId: number): number {
  return configuredChainId === 202601 ? WAYPOINT_SUPPORTED_CHAIN : configuredChainId;
}

export function roninWaypointConnector(config: {
  clientId: string;
  chainId: number;
  redirectUrl?: string;
}) {
  let providerInstance: WaypointProvider | undefined;

  return createConnector((wagmiConfig) => {
    const { emitter } = wagmiConfig;

    return {
      id: "roninWaypoint",
      name: "Ronin Waypoint",
      type: "waypoint",

      // setup() intencionalmente omitido para evitar que createConfig
      // instancie WaypointProvider durante el SSR/HMR. El provider se crea
      // lazy en connect() — justo cuando el usuario hace clic.

      async connect<withCapabilities extends boolean = false>(
        parameters?: {
          chainId?: number;
          isReconnecting?: boolean;
          withCapabilities?: withCapabilities | boolean;
        },
      ) {
        if (!config.clientId) {
          throw new Error(
            "Ronin Waypoint clientId is missing. Set NEXT_PUBLIC_WAYPOINT_CLIENT_ID in your environment.",
          );
        }

        const targetChainId = parameters?.chainId || config.chainId;
        const internalChainId = getInternalChainId(targetChainId);

        // Lazy instantiation: solo se crea al hacer clic en Connect Wallet
        providerInstance = WaypointProvider.create({
          clientId: config.clientId,
          chainId: internalChainId,
          redirectUrl:
            config.redirectUrl ||
            (typeof window !== "undefined" ? window.location.origin : undefined),
        });

        // Wire EIP-1193 events into wagmi emitter
        providerInstance.on("accountsChanged", (accounts: string[]) => {
          emitter.emit("change", {
            accounts: accounts.map((x) => getAddress(x)),
          });
        });
        providerInstance.on("chainChanged", (chainId: string) => {
          emitter.emit("change", { chainId: Number(chainId) });
        });
        providerInstance.on("connect", (connectInfo: { chainId: string }) => {
          emitter.emit("connect", {
            chainId: Number(connectInfo.chainId),
            accounts: [],
          });
        });
        providerInstance.on("disconnect", () => {
          emitter.emit("disconnect");
        });

        // Trigger Waypoint native connect (opens popup/redirect for auth)
        const connectResult = await providerInstance.connect();

        const accounts = connectResult.address
          ? [getAddress(connectResult.address)]
          : [];

        // Reportamos el chainId configurado (202601) a wagmi, no el interno
        const reportedChainId = targetChainId;

        emitter.emit("connect", { accounts, chainId: reportedChainId });

        return {
          accounts: accounts as readonly `0x${string}`[],
          chainId: reportedChainId,
        } as any;
      },

      async disconnect() {
        if (providerInstance) {
          providerInstance.disconnect();
          providerInstance = undefined;
        }
        emitter.emit("disconnect");
      },

      async getAccounts() {
        if (!providerInstance) return [];
        const accounts = await providerInstance.request<string[]>({
          method: "eth_accounts",
        });
        return accounts.map((x) => getAddress(x));
      },

      async getChainId() {
        return config.chainId;
      },

      async getProvider() {
        if (!providerInstance) {
          const internalChainId = getInternalChainId(config.chainId);
          providerInstance = WaypointProvider.create({
            clientId: config.clientId,
            chainId: internalChainId,
            redirectUrl:
              config.redirectUrl ||
              (typeof window !== "undefined" ? window.location.origin : undefined),
          });
        }
        return providerInstance;
      },

      async isAuthorized() {
        try {
          const accounts = await this.getAccounts();
          return accounts.length > 0;
        } catch {
          return false;
        }
      },

      onAccountsChanged(accounts) {
        if (accounts.length === 0) {
          emitter.emit("disconnect");
        }
      },

      onChainChanged(chainId) {
        console.log("Chain changed to:", chainId);
      },

      onConnect(connectInfo) {
        console.log("Waypoint connected:", connectInfo);
      },

      onDisconnect(error) {
        console.log("Waypoint disconnected", error);
      },
    };
  });
}
