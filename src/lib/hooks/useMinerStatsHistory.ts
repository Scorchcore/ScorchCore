/**
 * useMinerStatsHistory Hook
 * 
 * Hook para gestionar estadísticas históricas de un miner
 * con auto-refresh y comparaciones
 * 
 * @pattern Custom Hook Pattern (React)
 * @pattern Observer Pattern - Auto-refresh cada 30 segundos
 */

import { useState, useEffect, useCallback } from 'react';
import { useContractManager } from './useContractManager';
import { MinerStatsService } from '@/lib/services/minerstats';
import type { MinerStatsUI, MinerComparison } from '@/lib/services/minerstats';

/**
 * Estado del hook useMinerStatsHistory
 */
export interface UseMinerStatsHistoryReturn {
  // Datos
  stats: MinerStatsUI | null;
  health: {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number;
    warnings: string[];
  } | null;
  
  // Estado
  isLoading: boolean;
  error: Error | null;
  
  // Acciones
  refresh: () => Promise<void>;
  
  // Computed values
  needsAttention: boolean;
  healthScore: number;
}

/**
 * Hook para comparación de múltiples miners
 */
export interface UseMinerComparisonReturn {
  comparisons: MinerComparison[];
  averages: {
    avgDurability: number;
    avgEfficiency: number;
    avgLevel: number;
    avgMultiplier: number;
    totalExperience: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para gestionar estadísticas históricas de un miner
 * 
 * @param minerId - ID del miner
 * @param autoRefresh - Si debe auto-refrescar (default: true)
 * @param refreshInterval - Intervalo de refresh en ms (default: 30000)
 * 
 * @example
 * ```tsx
 * function MinerStatsCard({ minerId }: { minerId: bigint }) {
 *   const { stats, health, isLoading } = useMinerStatsHistory(minerId);
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       <h3>Durability: {stats?.durability}%</h3>
 *       <p>Health Score: {health?.score}/100</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMinerStatsHistory(
  minerId: bigint | null,
  autoRefresh: boolean = true,
  refreshInterval: number = 30000
): UseMinerStatsHistoryReturn {
  const { contractManager } = useContractManager();
  
  const [stats, setStats] = useState<MinerStatsUI | null>(null);
  const [health, setHealth] = useState<{
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number;
    warnings: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga las estadísticas del miner
   */
  const loadStats = useCallback(async () => {
    if (!minerId || !contractManager) {
      setStats(null);
      setHealth(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = new MinerStatsService(contractManager);
      
      const minerStats = await service.getMinerStats(minerId);
      const minerHealth = service.getMinerHealth(minerStats);

      setStats(minerStats);
      setHealth(minerHealth);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading miner stats');
      setError(error);
      console.error('Error in useMinerStatsHistory:', error);
    } finally {
      setIsLoading(false);
    }
  }, [minerId, contractManager]);

  /**
   * Función pública de refresh
   */
  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  // Cargar datos iniciales
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !minerId || !contractManager) return;

    const interval = setInterval(() => {
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, minerId, contractManager, loadStats]);

  // Computed values
  const needsAttention = health ? health.score < 50 : false;
  const healthScore = health?.score ?? 0;

  return {
    stats,
    health,
    isLoading,
    error,
    refresh,
    needsAttention,
    healthScore,
  };
}

/**
 * Hook para comparar múltiples miners
 * 
 * @param minerIds - Array de IDs de miners a comparar
 * 
 * @example
 * ```tsx
 * function MinerComparison({ minerIds }: { minerIds: bigint[] }) {
 *   const { comparisons, averages, isLoading } = useMinerComparison(minerIds);
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       <h3>Avg Durability: {averages?.avgDurability}%</h3>
 *       {comparisons.map(c => (
 *         <div key={c.minerId.toString()}>
 *           Rank #{c.rank} - Multiplier: {c.effectiveMultiplier}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMinerComparison(
  minerIds: bigint[]
): UseMinerComparisonReturn {
  const { contractManager } = useContractManager();
  
  const [comparisons, setComparisons] = useState<MinerComparison[]>([]);
  const [averages, setAverages] = useState<{
    avgDurability: number;
    avgEfficiency: number;
    avgLevel: number;
    avgMultiplier: number;
    totalExperience: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga la comparación de miners
   */
  const loadComparison = useCallback(async () => {
    if (minerIds.length === 0 || !contractManager) {
      setComparisons([]);
      setAverages(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = new MinerStatsService(contractManager);
      
      const [comps, avgs] = await Promise.all([
        service.compareMiners(minerIds),
        service.getCollectionAverage(minerIds),
      ]);

      setComparisons(comps);
      setAverages(avgs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error comparing miners');
      setError(error);
      console.error('Error in useMinerComparison:', error);
    } finally {
      setIsLoading(false);
    }
  }, [minerIds, contractManager]);

  /**
   * Función pública de refresh
   */
  const refresh = useCallback(async () => {
    await loadComparison();
  }, [loadComparison]);

  // Cargar datos iniciales
  useEffect(() => {
    loadComparison();
  }, [loadComparison]);

  return {
    comparisons,
    averages,
    isLoading,
    error,
    refresh,
  };
}
