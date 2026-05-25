/**
 * Hook para acceso a Ronin Wallet
 *
 * **INTEGRACIÓN OFICIAL RONIN:**
 * - SDK Principal: @roninnetwork/wallet-sdk (para transacciones)
 * - Connectors: @sky-mavis/tanto-wagmi (para wagmi integration)
 * REQUERIDO para Sky Mavis Grant Program.
 *
 * Features:
 * - Ronin Wallet via Waypoint SDK
 * - Balance automático en RON
 * - Soporte para Saigon Testnet (chainId: 202601)
 * - Compatible con wagmi v2
 *
 * @category Core
 * @see https://docs.roninchain.com/developers/tools/delegation
 * @see https://docs.skymavis.com/ronin/wallets/waypoint/integrate
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { address, isConnected, balance, connectRonin } = useWallet();
 *
 *   if (!isConnected) {
 *     return <button onClick={connectRonin}>Connect Ronin Wallet</button>;
 *   }
 *
 *   return <div>Connected: {address}, Balance: {balance} RON</div>;
 * }
 * ```
 */

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useCallback } from "react";

export interface UseWalletReturn {
  /** Dirección de la wallet conectada */
  address: `0x${string}` | undefined;

  /** Si la wallet está conectada */
  isConnected: boolean;

  /** Si está en proceso de conexión */
  isConnecting: boolean;

  /** Si la wallet está desconectada */
  isDisconnected: boolean;

  /** Información de la chain actual */
  chain: ReturnType<typeof useAccount>["chain"];

  /** Balance formateado en RON */
  balance: string;

  /** Símbolo del token nativo (RON) */
  balanceSymbol: string;

  /** Función para conectar wallet */
  connect: ReturnType<typeof useConnect>["connect"];

  /** Función optimizada para conectar Ronin Wallet específicamente */
  connectRonin: () => void;

  /** Función para desconectar wallet */
  disconnect: ReturnType<typeof useDisconnect>["disconnect"];

  /** Lista de conectores disponibles */
  connectors: ReturnType<typeof useConnect>["connectors"];

  /** Estado de la conexión */
  status: ReturnType<typeof useAccount>["status"];
}

/**
 * Hook que proporciona acceso a Ronin Wallet via Waypoint SDK
 *
 * Integración oficial de Sky Mavis para Ronin ecosystem.
 */
export function useWallet(): UseWalletReturn {
  const account = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address: account.address,
  });

  /**
   * Conecta específicamente con Ronin Wallet (Waypoint)
   * Busca el conector de Ronin y lo usa preferentemente
   */
  const connectRonin = useCallback(() => {
    // Buscar el conector de Ronin Waypoint
    const roninConnector = connectors.find(
      (connector) =>
        connector.id === "roninWaypoint" ||
        connector.name.toLowerCase().includes("ronin") ||
        connector.type === "roninWaypoint",
    );

    if (roninConnector) {
      connect({ connector: roninConnector });
    } else {
      // Fallback al primer conector disponible
      const firstConnector = connectors[0];
      if (firstConnector) {
        connect({ connector: firstConnector });
      }
    }
  }, [connect, connectors]);

  return {
    // Account info
    address: account.address,
    isConnected: account.isConnected,
    isConnecting: account.isConnecting,
    isDisconnected: account.isDisconnected,
    chain: account.chain,

    // Balance info (RON en Saigon testnet)
    balance: balanceData?.value
      ? (Number(balanceData.value) / 10 ** balanceData.decimals).toFixed(4)
      : "0",
    balanceSymbol: balanceData?.symbol ?? "RON",

    // Connection methods
    connect,
    connectRonin, // ✨ Método optimizado para Ronin
    disconnect,
    connectors,

    // Status
    status: account.status,
  };
}
