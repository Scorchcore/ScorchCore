/**
 * useVesting - React Hook para gestión de Vesting Schedules
 *
 * @pattern Observer Pattern - React hooks con subscripción a cambios
 * @pattern Facade Pattern - Simplifica acceso a VestingService
 */

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ContractManager } from "@/lib/contracts/ContractManager";
import { createVestingService } from "@/lib/services/vesting";
import type {
  VestingDashboard,
  VestingScheduleUI,
} from "@/lib/services/vesting";
import { createServiceLogger } from "@/lib/utils/logger";

const log = createServiceLogger("useVesting");

export interface UseVestingReturn {
  // Estado
  dashboard: VestingDashboard | null;
  isLoading: boolean;
  error: Error | null;

  // Acciones
  refresh: () => Promise<void>;
  release: (scheduleId: bigint) => Promise<void>;

  // Computed values
  hasSchedules: boolean;
  hasReleasable: boolean;
  totalReleasableAmount: bigint;
  activeCount: number;
  nextUnlockSeconds: number;
}

/**
 * Hook para gestionar Vesting Schedules del usuario
 */
export function useVesting(): UseVestingReturn {
  const { address, isConnected } = useAccount();
  const [dashboard, setDashboard] = useState<VestingDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga el dashboard de vesting del usuario
   */
  const loadVesting = useCallback(async () => {
    if (!address || !isConnected) {
      setDashboard(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      log.info("Loading vesting dashboard", { address });

      const contractManager = ContractManager.getInstance({ chainId: 202601 });
      const vestingService = createVestingService(contractManager);

      const dashboardData = await vestingService.getUserDashboard(address);
      setDashboard(dashboardData);

      log.info("Vesting dashboard loaded", {
        address,
        schedulesCount: dashboardData.schedules.length,
        totalReleasable: dashboardData.totalReleasableFormatted,
      });
    } catch (err) {
      const errorObj = err as Error;
      log.error("Error loading vesting dashboard", { error: err });
      setError(errorObj);
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  /**
   * Refresca el dashboard
   */
  const refresh = useCallback(async () => {
    await loadVesting();
  }, [loadVesting]);

  /**
   * Libera tokens de un schedule
   *
   * @param scheduleId - ID del schedule
   */
  const release = useCallback(
    async (scheduleId: bigint) => {
      if (!address) {
        throw new Error("Wallet no conectada");
      }

      try {
        log.info("Releasing tokens from hook", {
          scheduleId: scheduleId.toString(),
        });

        const contractManager = ContractManager.getInstance({
          chainId: 202601,
        });
        const vestingService = createVestingService(contractManager);

        await vestingService.release(scheduleId);

        // Refrescar después de liberar
        await loadVesting();
      } catch (err) {
        log.error("Error releasing tokens", { error: err });
        throw err;
      }
    },
    [address, loadVesting],
  );

  // Cargar información inicial
  useEffect(() => {
    if (isConnected && address) {
      loadVesting();
    }
  }, [isConnected, address, loadVesting]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(() => {
      loadVesting();
    }, 30 * 1000); // 30 segundos

    return () => clearInterval(interval);
  }, [isConnected, address, loadVesting]);

  // Computed values
  const hasSchedules = (dashboard?.schedules.length ?? 0) > 0;
  const hasReleasable = (dashboard?.totalReleasable ?? 0n) > 0n;
  const totalReleasableAmount = dashboard?.totalReleasable ?? 0n;
  const activeCount = dashboard?.activeSchedulesCount ?? 0;

  const nextUnlockSeconds = dashboard
    ? createVestingService(
        ContractManager.getInstance({ chainId: 202601 }),
      ).calculateNextUnlock(dashboard.schedules)
    : 0;

  return {
    dashboard,
    isLoading,
    error,
    refresh,
    release,
    hasSchedules,
    hasReleasable,
    totalReleasableAmount,
    activeCount,
    nextUnlockSeconds,
  };
}

/**
 * Hook simplificado para obtener un schedule específico
 *
 * @param scheduleId - ID del schedule
 * @returns Schedule con info calculada
 */
export function useVestingSchedule(scheduleId: bigint | undefined): {
  schedule: VestingScheduleUI | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [schedule, setSchedule] = useState<VestingScheduleUI | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSchedule = useCallback(async () => {
    if (!scheduleId) {
      setSchedule(null);
      return;
    }

    setIsLoading(true);

    try {
      const contractManager = ContractManager.getInstance({ chainId: 202601 });
      const vestingService = createVestingService(contractManager);

      const scheduleData = await vestingService.getSchedule(scheduleId);
      setSchedule(scheduleData);

      log.info("Schedule loaded", {
        scheduleId: scheduleId.toString(),
      });
    } catch (error) {
      log.error("Error loading schedule", {
        scheduleId: scheduleId.toString(),
        error,
      });
      setSchedule(null);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId]);

  const refresh = useCallback(async () => {
    await loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  return {
    schedule,
    isLoading,
    refresh,
  };
}
