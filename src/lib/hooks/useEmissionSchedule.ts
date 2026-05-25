/**
 * useEmissionSchedule Hook
 * 
 * Hook para gestionar información del Emission Schedule
 * con auto-refresh y estado reactivo
 * 
 * @pattern Custom Hook Pattern (React)
 * @pattern Observer Pattern - Auto-refresh cada 60 segundos
 */

import { useState, useEffect, useCallback } from 'react';
import { useContractManager } from './useContractManager';
import { EmissionScheduleService } from '@/lib/services/emission';
import type { EmissionScheduleUI, HalvingHistory } from '@/lib/services/emission';

/**
 * Estado del hook useEmissionSchedule
 */
export interface UseEmissionScheduleReturn {
  // Datos
  info: EmissionScheduleUI | null;
  halvingHistory: HalvingHistory[];
  
  // Estado
  isLoading: boolean;
  error: Error | null;
  
  // Acciones
  refresh: () => Promise<void>;
  
  // Computed values
  isEmissionActive: boolean;
  daysUntilHalving: number;
  halvingProgress: number; // % de progreso hasta próximo halving
  emissionProgress: number; // % del total ya emitido
}

/**
 * Hook para gestionar información de emisión de tokens
 * 
 * @param autoRefresh - Si debe auto-refrescar (default: true)
 * @param refreshInterval - Intervalo de refresh en ms (default: 60000 = 1 min)
 * 
 * @example
 * ```tsx
 * function EmissionDashboard() {
 *   const { info, isLoading, daysUntilHalving } = useEmissionSchedule();
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       <h2>Next Halving: {daysUntilHalving} days</h2>
 *       <p>Current Rate: {info?.currentRate} CORE/s</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEmissionSchedule(
  autoRefresh: boolean = true,
  refreshInterval: number = 60000
): UseEmissionScheduleReturn {
  const { contractManager } = useContractManager();
  
  const [info, setInfo] = useState<EmissionScheduleUI | null>(null);
  const [halvingHistory, setHalvingHistory] = useState<HalvingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga la información de emisión
   */
  const loadEmissionInfo = useCallback(async () => {
    if (!contractManager) return;

    try {
      setIsLoading(true);
      setError(null);

      const service = new EmissionScheduleService(contractManager);
      
      // Cargar info principal y history en paralelo
      const [emissionInfo, history] = await Promise.all([
        service.getEmissionInfo(),
        service.getHalvingHistory(10),
      ]);

      setInfo(emissionInfo);
      setHalvingHistory(history);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading emission info');
      setError(error);
      console.error('Error in useEmissionSchedule:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractManager]);

  /**
   * Función pública de refresh
   */
  const refresh = useCallback(async () => {
    await loadEmissionInfo();
  }, [loadEmissionInfo]);

  // Cargar datos iniciales
  useEffect(() => {
    loadEmissionInfo();
  }, [loadEmissionInfo]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !contractManager) return;

    const interval = setInterval(() => {
      loadEmissionInfo();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, contractManager, loadEmissionInfo]);

  // Computed values
  const isEmissionActive = info?.emissionStarted ?? false;
  const daysUntilHalving = info?.daysUntilHalving ?? 0;
  
  // Progreso del halving actual (0-100%)
  const halvingProgress = info && info.halvingPeriodDays > 0
    ? ((info.halvingPeriodDays - daysUntilHalving) / info.halvingPeriodDays) * 100
    : 0;

  // Progreso total de emisión (0-100%)
  const emissionProgress = info?.totalEmittedPercentage ?? 0;

  return {
    info,
    halvingHistory,
    isLoading,
    error,
    refresh,
    isEmissionActive,
    daysUntilHalving,
    halvingProgress,
    emissionProgress,
  };
}

/**
 * Hook simplificado para obtener solo el countdown hasta halving
 * Útil para componentes pequeños que solo necesitan esta info
 * 
 * @example
 * ```tsx
 * function HalvingBadge() {
 *   const { daysUntilHalving, timeFormatted } = useHalvingCountdown();
 *   return <Badge>{daysUntilHalving}d until halving</Badge>;
 * }
 * ```
 */
export function useHalvingCountdown() {
  const { info, isLoading } = useEmissionSchedule(true, 60000);

  return {
    daysUntilHalving: info?.daysUntilHalving ?? 0,
    timeFormatted: info?.timeUntilHalving ?? 'Loading...',
    nextHalvingDate: info?.nextHalvingDate ?? null,
    currentHalving: info?.currentHalving ?? 0,
    isLoading,
  };
}
