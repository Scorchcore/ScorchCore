/**
 * useCycleManager - React Hook para gestión de ciclos de minería
 * 
 * Proporciona acceso a funcionalidad de ciclos con estado reactivo
 * 
 * @pattern Facade Pattern
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { useContractManager } from './useContractManager';
import { createCycleService } from '@/lib/services/cycle';
import type {
  ActiveCycle,
  CycleBonusInfo,
  UserCyclesSummary,
  StartCycleOptions,
  CycleDuration,
} from '@/lib/services/cycle';
import { createServiceLogger } from '@/lib/utils/logger';

const log = createServiceLogger('useCycleManager');

export interface UseCycleManagerReturn {
  // State
  activeCycles: ActiveCycle[];
  cyclesSummary: UserCyclesSummary | null;
  bonusInfo: CycleBonusInfo[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  startCycle: (options: StartCycleOptions) => Promise<void>;
  endCycle: (cycleId: bigint) => Promise<void>;
  refreshCycles: () => Promise<void>;
  canStartCycleWithMiners: (minerIds: bigint[]) => Promise<boolean>;

  // Computed
  totalMinersLocked: number;
  averageBonus: number;
  nextCycleToEnd: ActiveCycle | undefined;
}

/**
 * Hook principal para gestión de ciclos
 * 
 * @returns Estado y funciones para manejar ciclos
 */
export function useCycleManager(): UseCycleManagerReturn {
  const { address } = useAccount();
  const { contractManager } = useContractManager();
  
  const [activeCycles, setActiveCycles] = useState<ActiveCycle[]>([]);
  const [cyclesSummary, setCyclesSummary] = useState<UserCyclesSummary | null>(null);
  const [bonusInfo, setBonusInfo] = useState<CycleBonusInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Crear instancia del servicio
  const cycleService = useMemo(() => {
    return createCycleService(contractManager);
  }, [contractManager]);

  /**
   * Carga los ciclos activos del usuario
   */
  const refreshCycles = useCallback(async () => {
    if (!address) {
      setActiveCycles([]);
      setCyclesSummary(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      log.info('Loading user cycles', { address });

      // Cargar ciclos activos y resumen en paralelo
      const [cycles, summary] = await Promise.all([
        cycleService.getUserActiveCycles(address),
        cycleService.getUserCyclesSummary(address),
      ]);

      setActiveCycles(cycles);
      setCyclesSummary(summary);

      log.info('Cycles loaded', { 
        cyclesCount: cycles.length,
        minersLocked: summary.totalMinersLocked,
      });
    } catch (err) {
      const error = err as Error;
      log.error('Failed to load cycles', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [address, cycleService]);

  /**
   * Carga información de bonos por duración
   */
  const loadBonusInfo = useCallback(async () => {
    try {
      const info = await cycleService.getAllCycleBonusInfo();
      setBonusInfo(info);
    } catch (err) {
      log.error('Failed to load bonus info', err);
    }
  }, [cycleService]);

  /**
   * Inicia un nuevo ciclo
   */
  const startCycle = useCallback(async (options: StartCycleOptions) => {
    if (!address) {
      throw new Error('No wallet connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      log.info('Starting cycle', {
        minerCount: options.minerIds.length,
        duration: options.duration,
      });

      const result = await cycleService.startCycle(options);

      log.info('Cycle started', {
        cycleId: result.cycleId.toString(),
        hash: result.transactionHash,
      });

      // Refrescar ciclos después de iniciar
      await refreshCycles();
    } catch (err) {
      const error = err as Error;
      log.error('Failed to start cycle', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, cycleService, refreshCycles]);

  /**
   * Finaliza un ciclo
   */
  const endCycle = useCallback(async (cycleId: bigint) => {
    if (!address) {
      throw new Error('No wallet connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      log.info('Ending cycle', { cycleId: cycleId.toString() });

      const result = await cycleService.endCycle(cycleId);

      log.info('Cycle ended', { 
        cycleId: cycleId.toString(),
        hash: result.transactionHash,
      });

      // Refrescar ciclos después de finalizar
      await refreshCycles();
    } catch (err) {
      const error = err as Error;
      log.error('Failed to end cycle', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, cycleService, refreshCycles]);

  /**
   * Verifica si se puede iniciar un ciclo con miners específicos
   */
  const canStartCycleWithMiners = useCallback(async (minerIds: bigint[]) => {
    try {
      return await cycleService.canStartCycleWithMiners(minerIds);
    } catch (err) {
      log.error('Failed to check if can start cycle', err);
      return false;
    }
  }, [cycleService]);

  // Valores computados
  const totalMinersLocked = useMemo(() => {
    return cyclesSummary?.totalMinersLocked || 0;
  }, [cyclesSummary]);

  const averageBonus = useMemo(() => {
    return cyclesSummary?.averageBonus || 0;
  }, [cyclesSummary]);

  const nextCycleToEnd = useMemo(() => {
    return cyclesSummary?.nextCycleToEnd;
  }, [cyclesSummary]);

  // Efectos
  useEffect(() => {
    refreshCycles();
  }, [refreshCycles]);

  useEffect(() => {
    // Solo cargar si el contractManager tiene un provider válido
    const provider = contractManager.getProvider();
    if (provider) {
      loadBonusInfo();
    }
  }, [loadBonusInfo, contractManager]);

  // Auto-refresh cada minuto para actualizar timeRemaining
  useEffect(() => {
    if (activeCycles.length === 0) return;

    const interval = setInterval(() => {
      refreshCycles();
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [activeCycles.length, refreshCycles]);

  return {
    // State
    activeCycles,
    cyclesSummary,
    bonusInfo,
    isLoading,
    error,

    // Actions
    startCycle,
    endCycle,
    refreshCycles,
    canStartCycleWithMiners,

    // Computed
    totalMinersLocked,
    averageBonus,
    nextCycleToEnd,
  };
}

/**
 * Hook simplificado para obtener info de bonos
 */
export function useCycleBonusInfo(): CycleBonusInfo[] {
  const { bonusInfo } = useCycleManager();
  return bonusInfo;
}

/**
 * Hook para obtener solo el resumen de ciclos
 */
export function useUserCyclesSummary(): {
  summary: UserCyclesSummary | null;
  isLoading: boolean;
} {
  const { cyclesSummary, isLoading } = useCycleManager();
  return { summary: cyclesSummary, isLoading };
}
