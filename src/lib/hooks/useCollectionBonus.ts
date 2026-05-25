/**
 * useCollectionBonus Hook
 * 
 * Hook para gestionar colecciones y bonuses de sets
 * 
 * @pattern Custom Hook Pattern (React)
 * @pattern Observer Pattern - Auto-refresh
 */

import { useState, useEffect, useCallback } from 'react';
import { useContractManager } from './useContractManager';
import { useWallet } from './useWallet';
import { CollectionService, type CollectionSet, type SetProgress, type UserBonusSummary } from '@/lib/services/collection';

/**
 * Estado del hook useCollectionBonus
 */
export interface UseCollectionBonusReturn {
  // Datos
  allSets: CollectionSet[];
  userProgress: SetProgress[];
  bonusSummary: UserBonusSummary | null;
  
  // Estado
  isLoading: boolean;
  error: Error | null;
  
  // Acciones
  refresh: () => Promise<void>;
}

/**
 * Hook para gestionar colecciones y bonuses
 * 
 * @param autoRefresh - Si debe auto-refrescar (default: false)
 * @param refreshInterval - Intervalo de refresh en ms (default: 60000)
 * 
 * @example
 * ```tsx
 * function CollectionDisplay() {
 *   const { allSets, userProgress, bonusSummary, isLoading } = useCollectionBonus();
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       <h3>Total Bonus: {bonusSummary?.totalBonus}%</h3>
 *       {userProgress.map(progress => (
 *         <div key={progress.setId}>
 *           {progress.setName}: {progress.progress}%
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCollectionBonus(
  autoRefresh: boolean = false,
  refreshInterval: number = 60000
): UseCollectionBonusReturn {
  const { contractManager } = useContractManager();
  const { address } = useWallet();
  
  const [allSets, setAllSets] = useState<CollectionSet[]>([]);
  const [userProgress, setUserProgress] = useState<SetProgress[]>([]);
  const [bonusSummary, setBonusSummary] = useState<UserBonusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga los datos de colección
   */
  const loadCollectionData = useCallback(async () => {
    if (!contractManager || !address) {
      setAllSets([]);
      setUserProgress([]);
      setBonusSummary(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = new CollectionService(contractManager);
      
      const [sets, progress, summary] = await Promise.all([
        service.getAllSets(),
        service.getAllSetProgress(address as `0x${string}`),
        service.getUserBonusSummary(address as `0x${string}`),
      ]);

      setAllSets(sets);
      setUserProgress(progress);
      setBonusSummary(summary);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading collection data');
      setError(error);
      console.error('Error in useCollectionBonus:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractManager, address]);

  /**
   * Función pública de refresh
   */
  const refresh = useCallback(async () => {
    await loadCollectionData();
  }, [loadCollectionData]);

  // Cargar datos iniciales
  useEffect(() => {
    loadCollectionData();
  }, [loadCollectionData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !contractManager || !address) return;

    const interval = setInterval(() => {
      loadCollectionData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, contractManager, address, loadCollectionData]);

  return {
    allSets,
    userProgress,
    bonusSummary,
    isLoading,
    error,
    refresh,
  };
}
