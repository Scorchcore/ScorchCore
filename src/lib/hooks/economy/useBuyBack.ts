/**
 * useBuyBack - React Hook para gestión del BuyBack Fund
 *
 * @pattern Observer Pattern - React hooks con subscripción a cambios
 * @pattern Facade Pattern - Simplifica acceso a BuyBackService
 */

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ContractManager } from "@/lib/contracts/ContractManager";
import { createBuyBackService } from "@/lib/services/buyback";
import type { BuyBackDashboardInfo } from "@/lib/services/buyback";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const log = createServiceLogger("useBuyBack");

export interface UseBuyBackReturn {
  // Estado
  info: BuyBackDashboardInfo | null;
  isLoading: boolean;
  error: Error | null;

  // Acciones
  refresh: () => Promise<void>;
  executeBuyback: (maxRonToSpend: bigint) => Promise<void>;
  deposit: (amount: bigint) => Promise<void>;

  // Computed values
  hasBalance: boolean;
  readyToExecute: boolean;
  totalBuybacksCount: number;
}

/**
 * Hook para gestionar el BuyBack Fund
 */
export function useBuyBack(): UseBuyBackReturn {
  const { address, isConnected } = useAccount();
  const [info, setInfo] = useState<BuyBackDashboardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga la información del BuyBack Fund
   */
  const loadBuyBackInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      log.info("Loading BuyBack Fund info");

      const contractManager = ContractManager.getInstance({ chainId: 202601 });
      const buyBackService = createBuyBackService(contractManager);

      const buyBackInfo = await buyBackService.getBuyBackInfo();
      setInfo(buyBackInfo);

      log.info("BuyBack info loaded", {
        balance: buyBackInfo.balanceFormatted,
        totalBuybacks: buyBackInfo.totalBuybacks.toString(),
      });
    } catch (err) {
      const errorObj = err as Error;
      log.error("Error loading BuyBack info", { error: err });
      setError(errorObj);
      setInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresca la información
   */
  const refresh = useCallback(async () => {
    await loadBuyBackInfo();
  }, [loadBuyBackInfo]);

  /**
   * Ejecuta un buyback
   *
   * @param maxRonToSpend - Máximo RON a gastar
   */
  const executeBuyback = useCallback(
    async (maxRonToSpend: bigint) => {
      if (!address) {
        throw new Error("Wallet no conectada");
      }

      try {
        log.info("Executing buyback from hook", {
          maxRonToSpend: maxRonToSpend.toString(),
        });

        const contractManager = ContractManager.getInstance({
          chainId: 202601,
        });
        const buyBackService = createBuyBackService(contractManager);

        await buyBackService.executeBuyback(maxRonToSpend);

        // Refrescar después de ejecutar
        await loadBuyBackInfo();
      } catch (err) {
        log.error("Error executing buyback", { error: err });
        throw err;
      }
    },
    [address, loadBuyBackInfo],
  );

  /**
   * Deposita fondos al BuyBack Fund
   *
   * @param amount - Monto en RON (wei)
   */
  const deposit = useCallback(
    async (amount: bigint) => {
      if (!address) {
        throw new Error("Wallet no conectada");
      }

      try {
        log.info("Depositing from hook", {
          amount: amount.toString(),
        });

        const contractManager = ContractManager.getInstance({
          chainId: 202601,
        });
        const buyBackService = createBuyBackService(contractManager);

        await buyBackService.deposit(amount);

        // Refrescar después de depositar
        await loadBuyBackInfo();
      } catch (err) {
        log.error("Error depositing", { error: err });
        throw err;
      }
    },
    [address, loadBuyBackInfo],
  );

  // Cargar información inicial
  useEffect(() => {
    loadBuyBackInfo();
  }, [loadBuyBackInfo]);

  // Auto-refresh cada 30 segundos (el fondo cambia poco frecuentemente)
  useEffect(() => {
    const interval = setInterval(() => {
      loadBuyBackInfo();
    }, 30 * 1000); // 30 segundos

    return () => clearInterval(interval);
  }, [loadBuyBackInfo]);

  // Computed values
  const hasBalance = (info?.balance ?? 0n) > 0n;
  const readyToExecute = info?.readyToExecute ?? false;
  const totalBuybacksCount = Number(info?.totalBuybacks ?? 0n);

  return {
    info,
    isLoading,
    error,
    refresh,
    executeBuyback,
    deposit,
    hasBalance,
    readyToExecute,
    totalBuybacksCount,
  };
}
