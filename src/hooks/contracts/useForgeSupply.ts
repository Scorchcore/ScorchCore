/**
 * Hook para obtener información de supply de geodas
 */

import { useState, useEffect, useCallback } from 'react';
import { useContractManager } from '@/lib/hooks/contracts/useContractManager';
import { createForgeSupplyService } from '@/lib/services/forge/ForgeSupplyService';
import type { CategorySupplyInfo } from '@/lib/services/forge/ForgeSupplyService';
import { GeodeCategory, CATEGORY_INFO } from '@/lib/constants/geodes';

interface UseForgeSupplyOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en milisegundos
}

/**
 * Hook para obtener supply de una categoría de geoda
 */
export function useCategorySupply(
  category: GeodeCategory | undefined,
  options: UseForgeSupplyOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  const contractManager = useContractManager();
  const [supplyInfo, setSupplyInfo] = useState<CategorySupplyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSupply = useCallback(async () => {
    // NO ejecutar si no hay contractManager o categoría
    if (!contractManager?.contractManager || category === undefined) {
      return;
    }

    // IMPORTANTE: Verificar provider antes de cualquier operación
    const provider = contractManager.contractManager.getProvider();
    if (!provider) {
      // No mostrar warning, es normal antes de conectar wallet
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = createForgeSupplyService(contractManager.contractManager);
      const maxSupply = CATEGORY_INFO[category].maxSupply;
      const info = await service.getCategorySupplyInfo(category, maxSupply);
      setSupplyInfo(info);
    } catch (err) {
      console.error('[useCategorySupply] Error fetching supply:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [contractManager, category]);

  // Fetch inicial (solo si hay provider)
  useEffect(() => {
    // Solo ejecutar si hay contractManager y provider disponible
    if (!contractManager?.contractManager) return;
    const provider = contractManager.contractManager.getProvider();
    if (!provider) {
      console.warn('[useCategorySupply] No provider available, skipping initial fetch');
      return;
    }
    fetchSupply();
  }, [fetchSupply, contractManager]);

  // Auto-refresh (solo si no hay error)
  useEffect(() => {
    if (!autoRefresh || error) return; // Detener si hay error

    const interval = setInterval(() => {
      fetchSupply();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSupply, error]);

  return {
    supplyInfo,
    loading,
    error,
    refetch: fetchSupply,
  };
}

/**
 * Hook para obtener supply de múltiples categorías
 */
export function useMultipleCategorySupply(
  categories: GeodeCategory[],
  options: UseForgeSupplyOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  const contractManager = useContractManager();
  const [suppliesInfo, setSuppliesInfo] = useState<Record<GeodeCategory, CategorySupplyInfo>>({} as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSupplies = useCallback(async () => {
    if (!contractManager?.contractManager || categories.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const service = createForgeSupplyService(contractManager.contractManager);
      const infos: Record<GeodeCategory, CategorySupplyInfo> = {} as any;

      await Promise.all(
        categories.map(async (category) => {
          const maxSupply = CATEGORY_INFO[category].maxSupply;
          const info = await service.getCategorySupplyInfo(category, maxSupply);
          infos[category] = info;
        })
      );

      setSuppliesInfo(infos);
    } catch (err) {
      console.error('[useMultipleCategorySupply] Error fetching supplies:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [contractManager, categories]);

  // Fetch inicial (solo si hay provider)
  useEffect(() => {
    // Solo ejecutar si hay contractManager y provider disponible
    if (!contractManager?.contractManager) return;
    const provider = contractManager.contractManager.getProvider();
    if (!provider) {
      console.warn('[useMultipleCategorySupply] No provider available, skipping initial fetch');
      return;
    }
    fetchSupplies();
  }, [fetchSupplies, contractManager]);

  // Auto-refresh (solo si no hay error)
  useEffect(() => {
    if (!autoRefresh || error) return; // Detener si hay error

    const interval = setInterval(() => {
      fetchSupplies();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSupplies, error]);

  return {
    suppliesInfo,
    loading,
    error,
    refetch: fetchSupplies,
  };
}

/**
 * Hook para obtener supply de una receta específica
 */
export function useRecipeSupply(
  category: number | undefined,
  minerType: number | undefined,
  minerIndex: number | undefined,
  options: UseForgeSupplyOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  const contractManager = useContractManager();
  const [remainingSupply, setRemainingSupply] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSupply = useCallback(async () => {
    if (!contractManager?.contractManager || category === undefined || minerType === undefined || minerIndex === undefined) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = createForgeSupplyService(contractManager.contractManager);
      const remaining = await service.getRecipeRemainingSupply(category, minerType, minerIndex);
      setRemainingSupply(remaining);
    } catch (err) {
      console.error('[useRecipeSupply] Error fetching supply:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [contractManager, category, minerType, minerIndex]);

  // Fetch inicial (solo si hay provider)
  useEffect(() => {
    // Solo ejecutar si hay contractManager y provider disponible
    if (!contractManager?.contractManager) return;
    const provider = contractManager.contractManager.getProvider();
    if (!provider) {
      console.warn('[useRecipeSupply] No provider available, skipping initial fetch');
      return;
    }
    fetchSupply();
  }, [fetchSupply, contractManager]);

  // Auto-refresh (solo si no hay error)
  useEffect(() => {
    if (!autoRefresh || error) return; // Detener si hay error

    const interval = setInterval(() => {
      fetchSupply();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSupply, error]);

  return {
    remainingSupply,
    loading,
    error,
    refetch: fetchSupply,
  };
}
