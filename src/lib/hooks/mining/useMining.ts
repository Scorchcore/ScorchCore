/**
 * Hook para operaciones de minería
 * 
 * Maneja el ciclo completo de minería de Core Miners:
 * - Iniciar minería
 * - Detener minería
 * - Reclamar recompensas
 * - Consultar estado de minería
 * 
 * @category Mining
 * @example
 * ```tsx
 * function MiningPanel() {
 *   const { startMining, stopMining, claimRewards, isLoading } = useMining();
 *   
 *   const handleStartMining = async (minerId: bigint) => {
 *     const result = await startMining(minerId);
 *     if (result.success) {
 *       console.log('Minería iniciada!');
 *     }
 *   };
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useContractManager } from '../contracts/useContractManager';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('useMining');

/**
 * Resultado de una operación de minería
 */
export interface MiningOperationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Resultado de reclamar recompensas
 */
export interface ClaimRewardsResult extends MiningOperationResult {
  amount?: bigint;
}

/**
 * Valor de retorno del hook useMining
 */
export interface UseMiningReturn {
  /** Indica si está ejecutando una operación */
  isLoading: boolean;
  
  /** Mensaje de error */
  error: string | null;
  
  /** Inicia minería para un minero */
  startMining: (minerId: bigint) => Promise<MiningOperationResult>;
  
  /** Detiene minería para un minero */
  stopMining: (minerId: bigint) => Promise<MiningOperationResult>;
  
  /** Reclama recompensas de un minero */
  claimRewards: (minerId: bigint) => Promise<ClaimRewardsResult>;
}

/**
 * Hook para operaciones de minería
 */
export function useMining(): UseMiningReturn {
  const { address } = useAccount();
  const { contractManager } = useContractManager();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Inicia minería para un minero
   */
  const startMining = useCallback(async (minerId: bigint): Promise<MiningOperationResult> => {
    if (!address) {
      const error = 'Wallet no conectada';
      logger.error(error);
      return { success: false, error };
    }

    logger.info('Iniciando minería', { minerId: minerId.toString() });
    setIsLoading(true);
    setError(null);

    try {
      const miningPool = contractManager.getMiningPool();
      const result = await miningPool.startMining(minerId);

      if (!result.success) {
        throw new Error('La transacción falló');
      }

      logger.info('Minería iniciada exitosamente', { 
        minerId: minerId.toString(),
        hash: result.hash 
      });

      return {
        success: true,
        transactionHash: result.hash,
      };
    } catch (err) {
      logger.error('Error iniciando minería', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [address, contractManager]);

  /**
   * Detiene minería para un minero
   */
  const stopMining = useCallback(async (minerId: bigint): Promise<MiningOperationResult> => {
    if (!address) {
      const error = 'Wallet no conectada';
      logger.error(error);
      return { success: false, error };
    }

    logger.info('Deteniendo minería', { minerId: minerId.toString() });
    setIsLoading(true);
    setError(null);

    try {
      const miningPool = contractManager.getMiningPool();
      const result = await miningPool.stopMining(minerId);

      if (!result.success) {
        throw new Error('La transacción falló');
      }

      logger.info('Minería detenida exitosamente', { 
        minerId: minerId.toString(),
        hash: result.hash 
      });

      return {
        success: true,
        transactionHash: result.hash,
      };
    } catch (err) {
      logger.error('Error deteniendo minería', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [address, contractManager]);

  /**
   * Reclama recompensas de un minero
   */
  const claimRewards = useCallback(async (minerId: bigint): Promise<ClaimRewardsResult> => {
    if (!address) {
      const error = 'Wallet no conectada';
      logger.error(error);
      return { success: false, error };
    }

    logger.info('Reclamando recompensas', { minerId: minerId.toString() });
    setIsLoading(true);
    setError(null);

    try {
      const miningPool = contractManager.getMiningPool();
      const result = await miningPool.claimRewards(minerId);

      if (!result.success) {
        throw new Error('La transacción falló');
      }

      logger.info('Recompensas reclamadas exitosamente', { 
        minerId: minerId.toString(),
        amount: result.amount?.toString(),
        hash: result.hash 
      });

      return {
        success: true,
        amount: result.amount,
        transactionHash: result.hash,
      };
    } catch (err) {
      logger.error('Error reclamando recompensas', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [address, contractManager]);

  return {
    isLoading,
    error,
    startMining,
    stopMining,
    claimRewards,
  };
}
