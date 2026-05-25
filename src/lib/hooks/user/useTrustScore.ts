/**
 * useTrustScore - React Hook para gestión de TrustScore
 *
 * @pattern Observer Pattern - React hooks con subscripción a cambios
 * @pattern Facade Pattern - Simplifica acceso a TrustScoreService
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { ContractManager } from "@/lib/contracts/ContractManager";
import { createTrustScoreService } from "@/lib/services/trustscore";
import type {
  TrustScoreUIInfo,
  TrustScoreLevel,
} from "@/lib/services/trustscore";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const log = createServiceLogger("useTrustScore");

export interface UseTrustScoreReturn {
  // Estado
  trustScoreInfo: TrustScoreUIInfo | null;
  isLoading: boolean;
  error: Error | null;

  // Acciones
  refresh: () => Promise<void>;
  canAccessCategory: (categoryLevel: number) => boolean;

  // Computed values
  hasScore: boolean;
  isFlagged: boolean;
  isStale: boolean;
  needsVerification: boolean;
  levelName: string;
  levelColor: string;
  formattedScore: string;
}

/**
 * Hook para gestionar TrustScore del usuario conectado
 */
export function useTrustScore(): UseTrustScoreReturn {
  const { address, isConnected } = useAccount();
  const [trustScoreInfo, setTrustScoreInfo] = useState<TrustScoreUIInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga la información de TrustScore
   */
  const loadTrustScore = useCallback(async () => {
    if (!address || !isConnected) {
      setTrustScoreInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      log.info("Loading trust score", { address });

      const contractManager = ContractManager.getInstance({ chainId: 202601 });

      // Validar que hay provider disponible
      const provider = contractManager.getProvider();
      if (!provider) {
        log.warn("No provider available, skipping trust score load");
        setTrustScoreInfo(null);
        setIsLoading(false);
        return;
      }

      const trustScoreService = createTrustScoreService(contractManager);

      const info = await trustScoreService.getUserTrustScoreInfo(address);
      setTrustScoreInfo(info);

      log.info("Trust score loaded", {
        address,
        score: info.score,
        level: info.level,
        levelName: info.levelName,
      });
    } catch (err) {
      const errorObj = err as Error;
      log.error("Error loading trust score", { address, error: err });
      setError(errorObj);
      setTrustScoreInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  /**
   * Refresca el TrustScore
   */
  const refresh = useCallback(async () => {
    await loadTrustScore();
  }, [loadTrustScore]);

  /**
   * Verifica si el usuario puede acceder a una categoría
   *
   * @param categoryLevel - Nivel de la categoría (0-3)
   * @returns true si tiene acceso
   */
  const canAccessCategory = useCallback(
    (categoryLevel: number): boolean => {
      if (!trustScoreInfo) return false;
      return trustScoreInfo.level >= categoryLevel;
    },
    [trustScoreInfo],
  );

  // Cargar información inicial y cuando cambie la wallet
  useEffect(() => {
    loadTrustScore();
  }, [loadTrustScore]);

  // Auto-refresh cada 5 minutos para detectar cambios
  useEffect(() => {
    if (!address || !isConnected) return;

    const interval = setInterval(
      () => {
        loadTrustScore();
      },
      5 * 60 * 1000,
    ); // 5 minutos

    return () => clearInterval(interval);
  }, [address, isConnected, loadTrustScore]);

  // Computed values
  const hasScore = trustScoreInfo !== null && trustScoreInfo.score > 0;
  const isFlagged = trustScoreInfo?.flagged ?? false;
  const isStale = trustScoreInfo?.isStale ?? true;
  const needsVerification = isStale || isFlagged;
  const levelName = trustScoreInfo?.levelName ?? "Basic";
  const levelColor = useMemo(() => {
    if (!trustScoreInfo) return "gray";
    const contractManager = ContractManager.getInstance({ chainId: 202601 });
    const trustScoreService = createTrustScoreService(contractManager);
    return trustScoreService.getLevelColor(trustScoreInfo.level);
  }, [trustScoreInfo]);

  const formattedScore = useMemo(() => {
    if (!trustScoreInfo) return "0/1000";
    const contractManager = ContractManager.getInstance({ chainId: 202601 });
    const trustScoreService = createTrustScoreService(contractManager);
    return trustScoreService.formatScore(trustScoreInfo.score);
  }, [trustScoreInfo]);

  return {
    trustScoreInfo,
    isLoading,
    error,
    refresh,
    canAccessCategory,
    hasScore,
    isFlagged,
    isStale,
    needsVerification,
    levelName,
    levelColor,
    formattedScore,
  };
}

/**
 * Hook simplificado para verificar si el usuario puede acceder a una categoría
 *
 * @param categoryLevel - Nivel de categoría requerido
 * @returns true si el usuario tiene acceso
 */
export function useCanAccessCategory(categoryLevel: number): {
  canAccess: boolean;
  isLoading: boolean;
  userLevel: TrustScoreLevel;
  levelName: string;
} {
  const { trustScoreInfo, isLoading, canAccessCategory } = useTrustScore();

  return {
    canAccess: canAccessCategory(categoryLevel),
    isLoading,
    userLevel: trustScoreInfo?.level ?? 0,
    levelName: trustScoreInfo?.levelName ?? "Basic",
  };
}
