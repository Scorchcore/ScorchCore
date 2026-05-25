/**
 * usefCoreBalance - Hook para gestionar el estado de fCORE y conversiones
 * @pattern Observer Pattern - React hooks con subscripción a cambios
 */

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ContractManager } from "@/lib/contracts/ContractManager";
import { createfCoreService } from "@/lib/services/fcore";
import type { fCoreSystemInfo, ConvertfCoreResult } from "@/lib/services/fcore";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const log = createServiceLogger("usefCoreBalance");

export interface UsefCoreBalanceReturn {
  // Estado
  systemInfo: fCoreSystemInfo | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  convertfCore: (amount?: bigint) => Promise<ConvertfCoreResult>;
  convertAll: () => Promise<ConvertfCoreResult>;
  refresh: () => Promise<void>;

  // Computed values
  hasfCoreBalance: boolean;
  canConvert: boolean;
  isPohVerified: boolean;
  needsPohVerification: boolean;
}

/**
 * Hook para gestionar balance y conversión de fCORE
 */
export function usefCoreBalance(): UsefCoreBalanceReturn {
  const { address, isConnected } = useAccount();
  const [systemInfo, setSystemInfo] = useState<fCoreSystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga la información del sistema fCORE
   */
  const loadSystemInfo = useCallback(async () => {
    if (!address || !isConnected) {
      setSystemInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      log.info("Loading fCORE system info", { address });

      const contractManager = ContractManager.getInstance({ chainId: 202601 });
      const fCoreService = createfCoreService(contractManager);

      const info = await fCoreService.getSystemInfo(address);
      setSystemInfo(info);

      log.info("fCORE system info loaded", {
        address,
        balance: info.fCoreBalance.balance.toString(),
        isVerified: info.pohVerification.isVerified,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cargar información de fCORE";
      log.error("Error loading fCORE system info", { address, error: err });
      setError(errorMessage);
      setSystemInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  /**
   * Convierte una cantidad específica de fCORE a CORE
   */
  const convertfCore = useCallback(
    async (amount?: bigint): Promise<ConvertfCoreResult> => {
      if (!address) {
        return {
          success: false,
          fCoreConverted: 0n,
          coreReceived: 0n,
          error: "Wallet no conectado",
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        log.info("Converting fCORE", { address, amount: amount?.toString() });

        const contractManager = ContractManager.getInstance({
          chainId: 202601,
        });
        const fCoreService = createfCoreService(contractManager);

        const result = await fCoreService.convertfCore({
          amount,
          userAddress: address,
        });

        if (result.success) {
          // Recargar información después de conversión exitosa
          await loadSystemInfo();
        } else {
          setError(result.error || "Error al convertir fCORE");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al convertir fCORE";
        log.error("Error converting fCORE", {
          address,
          amount: amount?.toString(),
          error: err,
        });
        setError(errorMessage);
        return {
          success: false,
          fCoreConverted: 0n,
          coreReceived: 0n,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [address, loadSystemInfo],
  );

  /**
   * Convierte todo el balance de fCORE a CORE
   */
  const convertAll = useCallback(async (): Promise<ConvertfCoreResult> => {
    return convertfCore(undefined);
  }, [convertfCore]);

  /**
   * Recarga la información del sistema
   */
  const refresh = useCallback(async () => {
    await loadSystemInfo();
  }, [loadSystemInfo]);

  // Cargar información inicial y cuando cambie la wallet
  useEffect(() => {
    loadSystemInfo();
  }, [loadSystemInfo]);

  // Computed values
  const hasfCoreBalance = systemInfo
    ? systemInfo.fCoreBalance.balance > 0n
    : false;
  const canConvert = systemInfo?.canPerformConversion ?? false;
  const isPohVerified = systemInfo?.pohVerification.isVerified ?? false;
  const needsPohVerification = hasfCoreBalance && !isPohVerified;

  return {
    systemInfo,
    isLoading,
    error,
    convertfCore,
    convertAll,
    refresh,
    hasfCoreBalance,
    canConvert,
    isPohVerified,
    needsPohVerification,
  };
}
