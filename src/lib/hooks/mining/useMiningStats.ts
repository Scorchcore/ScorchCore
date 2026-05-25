/**
 * Hook para consultar estadísticas de minería
 * 
 * Proporciona información sobre el estado de minería de un minero:
 * - Recompensas pendientes
 * - Estado de minería activo/inactivo
 * - Información del minero
 * - Estadísticas de minería
 * 
 * @category Mining
 * @example
 * ```tsx
 * function MinerCard({ minerId }: { minerId: bigint }) {
 *   const { stats, isLoading, reload } = useMiningStats(minerId);
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       <p>Mining: {stats?.isMining ? 'Sí' : 'No'}</p>
 *       <p>Rewards: {stats?.pendingRewards.toString()}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useContractManager } from '../contracts/useContractManager';
import type { PendingRewards, MinerInfo, MinerStats } from '@/lib/contracts/interfaces/IMiningContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('useMiningStats');

/**
 * Estadísticas completas de minería de un minero
 */
export interface MiningStatsData {
  /** Si el minero está minando actualmente */
  isMining: boolean;
  
  /** Información del minero */
  minerInfo: MinerInfo | null;
  
  /** Estadísticas de minería */
  minerStats: MinerStats | null;
  
  /** Recompensas pendientes */
  pendingRewards: PendingRewards | null;
}

/**
 * Opciones de configuración
 */
export interface UseMiningStatsOptions {
  /**
   * Si debe cargar automáticamente al montar
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Intervalo de recarga automática en ms
   * @default 30000 (30 segundos)
   */
  refreshInterval?: number;
}

/**
 * Valor de retorno del hook
 */
export interface UseMiningStatsReturn {
  /** Estadísticas de minería */
  stats: MiningStatsData | null;
  
  /** Indica si está cargando */
  isLoading: boolean;
  
  /** Mensaje de error */
  error: string | null;
  
  /** Función para recargar estadísticas */
  reload: () => Promise<void>;
}

/**
 * Hook para consultar estadísticas de minería
 */
export function useMiningStats(
  minerId: bigint | null,
  options: UseMiningStatsOptions = {}
): UseMiningStatsReturn {
  const {
    autoLoad = true,
    refreshInterval = 30000,
  } = options;

  const { contractManager } = useContractManager();
  
  const [stats, setStats] = useState<MiningStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga las estadísticas de minería
   */
  const loadStats = useCallback(async () => {
    if (!minerId) {
      setStats(null);
      return;
    }

    logger.info('Cargando estadísticas de minería', { minerId: minerId.toString() });
    setIsLoading(true);
    setError(null);

    try {
      const miningPool = contractManager.getMiningPool();

      // Cargar todos los datos en paralelo
      const [isMining, minerInfo, minerStats, pendingRewards] = await Promise.all([
        miningPool.isMining(minerId),
        miningPool.getMinerInfo(minerId),
        miningPool.getMinerStats(minerId),
        miningPool.getPendingRewards(minerId),
      ]);

      const statsData: MiningStatsData = {
        isMining,
        minerInfo,
        minerStats,
        pendingRewards,
      };

      setStats(statsData);
      logger.info('Estadísticas cargadas', { 
        minerId: minerId.toString(),
        isMining,
        pendingAmount: pendingRewards.totalAmount.toString()
      });
    } catch (err) {
      logger.error('Error cargando estadísticas', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [minerId, contractManager]);

  // Auto-load al montar o cuando cambia minerId
  useEffect(() => {
    if (autoLoad && minerId) {
      loadStats();
    }
  }, [autoLoad, minerId, loadStats]);

  // Refresh interval
  useEffect(() => {
    if (!minerId || !refreshInterval) return;

    const interval = setInterval(() => {
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [minerId, refreshInterval, loadStats]);

  return {
    stats,
    isLoading,
    error,
    reload: loadStats,
  };
}
