/**
 * useMinerActions - Hook para acciones de CoreMiners individuales
 * 
 * Encapsula la lógica de negocio para:
 * - Activar/Desactivar miners (start/end cycle)
 * - Configurar ciclos (duración, bonos)
 * - Reclamar recompensas
 * 
 * @pattern Facade Hook - Simplifica interacción con múltiples servicios
 * @principle SRP - Responsabilidad única: acciones de miners
 */

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useContractManager } from '../contracts/useContractManager';
import { createCycleService } from '@/lib/services/cycle';
import { createMiningService } from '@/lib/services';
import { CycleDuration } from '@/lib/contracts/interfaces/ICycleContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('useMinerActions');

export interface MinerActionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface UseMinerActionsReturn {
  // State
  isProcessing: boolean;
  error: Error | null;
  
  // Actions
  activateMiner: (minerId: bigint, duration: CycleDuration) => Promise<MinerActionResult>;
  deactivateMiner: (minerId: bigint) => Promise<MinerActionResult>;
  claimRewards: (minerId: bigint) => Promise<MinerActionResult>;
  
  // Helpers
  clearError: () => void;
}

/**
 * Hook para gestionar acciones de CoreMiners individuales
 * 
 * @example
 * ```tsx
 * const { activateMiner, claimRewards, isProcessing } = useMinerActions();
 * 
 * const handleActivate = async () => {
 *   const result = await activateMiner(minerId, CycleDuration.DAYS_30);
 *   if (result.success) {
 *     showSuccess('Miner activado!');
 *   }
 * };
 * ```
 */
export function useMinerActions(): UseMinerActionsReturn {
  const { address } = useAccount();
  const { contractManager } = useContractManager();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Activa un miner iniciando un ciclo de minería
   */
  const activateMiner = useCallback(async (
    minerId: bigint,
    duration: CycleDuration
  ): Promise<MinerActionResult> => {
    if (!address) {
      const errorMsg = 'Wallet not connected';
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    setIsProcessing(true);
    setError(null);

    try {
      log.info('Activating miner', { 
        minerId: minerId.toString(), 
        duration 
      });

      const cycleService = createCycleService(contractManager);
      
      // Iniciar ciclo con un solo miner
      const result = await cycleService.startCycle({
        minerIds: [minerId],
        duration,
      });

      log.info('Miner activated successfully', {
        minerId: minerId.toString(),
        cycleId: result.cycleId.toString(),
        hash: result.transactionHash,
      });

      return {
        success: true,
        transactionHash: result.transactionHash,
      };
    } catch (err) {
      const error = err as Error;
      log.error('Failed to activate miner', error);
      setError(error);
      
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [address, contractManager]);

  /**
   * Desactiva un miner finalizando su ciclo activo
   */
  const deactivateMiner = useCallback(async (
    minerId: bigint
  ): Promise<MinerActionResult> => {
    if (!address) {
      const errorMsg = 'Wallet not connected';
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    setIsProcessing(true);
    setError(null);

    try {
      log.info('Deactivating miner', { minerId: minerId.toString() });

      const cycleService = createCycleService(contractManager);
      
      // Obtener el ciclo activo del miner
      const cycles = await cycleService.getUserActiveCycles(address);
      const minerCycle = cycles.find(c => 
        c.minerIds.some(id => id === minerId)
      );

      if (!minerCycle) {
        throw new Error('No active cycle found for this miner');
      }

      // Finalizar el ciclo
      const result = await cycleService.endCycle(minerCycle.cycleId);

      log.info('Miner deactivated successfully', {
        minerId: minerId.toString(),
        cycleId: minerCycle.cycleId.toString(),
        hash: result.transactionHash,
      });

      return {
        success: true,
        transactionHash: result.transactionHash,
      };
    } catch (err) {
      const error = err as Error;
      log.error('Failed to deactivate miner', error);
      setError(error);
      
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [address, contractManager]);

  /**
   * Reclama las recompensas acumuladas de un miner
   */
  const claimRewards = useCallback(async (
    minerId: bigint
  ): Promise<MinerActionResult> => {
    if (!address) {
      const errorMsg = 'Wallet not connected';
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    setIsProcessing(true);
    setError(null);

    try {
      log.info('Claiming rewards', { minerId: minerId.toString() });

      const miningFacade = createMiningService(contractManager);
      
      // Reclamar recompensas
      const result = await miningFacade.claimRewards(minerId);

      log.info('Rewards claimed successfully', {
        minerId: minerId.toString(),
        amount: result.amount.toString(),
        hash: result.tx.hash,
      });

      return {
        success: true,
        transactionHash: result.tx.hash,
      };
    } catch (err) {
      const error = err as Error;
      log.error('Failed to claim rewards', error);
      setError(error);
      
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [address, contractManager]);

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    activateMiner,
    deactivateMiner,
    claimRewards,
    clearError,
  };
}
