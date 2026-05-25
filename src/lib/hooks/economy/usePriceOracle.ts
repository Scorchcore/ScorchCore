/**
 * usePriceOracle Hook
 * 
 * Hook para gestionar precios del oracle con auto-refresh
 * 
 * @pattern Custom Hook Pattern (React)
 * @pattern Observer Pattern - Auto-refresh
 */

import { useState, useEffect, useCallback } from 'react';
import { useContractManager } from '../contracts/useContractManager';
import { PriceOracleService, type PriceInfoUI, type PriceStats } from '@/lib/services/price';

/**
 * Estado del hook usePriceOracle
 */
export interface UsePriceOracleReturn {
  // Datos
  priceInfo: PriceInfoUI | null;
  priceStats: PriceStats | null;
  currentPrice: number | null;
  
  // Estado
  isLoading: boolean;
  error: Error | null;
  
  // Acciones
  refresh: () => Promise<void>;
  convertTokens: (
    fromAmount: bigint,
    fromToken: 'CORE' | 'RON',
    toToken: 'CORE' | 'RON'
  ) => Promise<{ fromAmount: bigint; toAmount: bigint; rate: number } | null>;
}

/**
 * Hook para gestionar precios del oracle
 * 
 * @param autoRefresh - Si debe auto-refrescar (default: true)
 * @param refreshInterval - Intervalo de refresh en ms (default: 30000)
 * 
 * @example
 * ```tsx
 * function PriceDisplay() {
 *   const { currentPrice, priceInfo, isLoading } = usePriceOracle();
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       <h3>CORE Price</h3>
 *       <p>${currentPrice?.toFixed(4)}</p>
 *       {priceInfo?.isFresh ? '✅ Fresh' : '⚠️ Stale'}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePriceOracle(
  autoRefresh: boolean = true,
  refreshInterval: number = 30000
): UsePriceOracleReturn {
  const { contractManager } = useContractManager();
  
  const [priceInfo, setPriceInfo] = useState<PriceInfoUI | null>(null);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga los datos del precio
   */
  const loadPriceData = useCallback(async () => {
    if (!contractManager) {
      setPriceInfo(null);
      setPriceStats(null);
      setCurrentPrice(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = new PriceOracleService(contractManager);
      
      const [info, stats] = await Promise.all([
        service.getPriceInfo(),
        service.getPriceStats(),
      ]);

      setPriceInfo(info);
      setPriceStats(stats);
      setCurrentPrice(info.priceUSD);

      // Agregar al historial local para trending
      service.addPriceToHistory(info.priceUSD);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading price data');
      setError(error);
      console.error('Error in usePriceOracle:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractManager]);

  /**
   * Convierte tokens usando el precio del oracle
   */
  const convertTokens = useCallback(async (
    fromAmount: bigint,
    fromToken: 'CORE' | 'RON',
    toToken: 'CORE' | 'RON'
  ) => {
    if (!contractManager) return null;

    try {
      const service = new PriceOracleService(contractManager);
      const result = await service.convertTokens(fromAmount, fromToken, toToken);
      
      return {
        fromAmount: result.fromAmount,
        toAmount: result.toAmount,
        rate: result.rate,
      };
    } catch (err) {
      console.error('Error converting tokens:', err);
      return null;
    }
  }, [contractManager]);

  /**
   * Función pública de refresh
   */
  const refresh = useCallback(async () => {
    await loadPriceData();
  }, [loadPriceData]);

  // Cargar datos iniciales
  useEffect(() => {
    loadPriceData();
  }, [loadPriceData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !contractManager) return;

    const interval = setInterval(() => {
      loadPriceData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, contractManager, loadPriceData]);

  return {
    priceInfo,
    priceStats,
    currentPrice,
    isLoading,
    error,
    refresh,
    convertTokens,
  };
}
