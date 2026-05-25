/**
 * MiningOperationsService - Operaciones Core de Minería
 * 
 * Responsabilidad única: Start, Stop, Claim de minería
 * 
 * @pattern Service Layer (DDD)
 * @principle SRP - Solo operaciones básicas de minería
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { BaseMiningService } from '@/lib/services/base/BaseMiningService';
import { logger } from '@/lib/utils/logging/logger';
import { withCriticalError, withSafeRead } from '@/lib/utils';
import type { MiningTransactionResult, ClaimResult } from './types';

/**
 * Servicio especializado en operaciones básicas de minería
 * 
 * **REFACTORIZACIÓN:** Ahora extiende BaseMiningService para eliminar duplicación.
 */
export class MiningOperationsService extends BaseMiningService {
  constructor(contractManager: ContractManager) {
    super(contractManager);
  }

  /**
   * Inicia minería con un CoreMiner
   * 
   * @param minerId - ID del minero
   * @param power - Poder de minería
   * @param efficiency - Eficiencia del minero
   * @returns Resultado de la transacción
   */
  async startMining(
    minerId: bigint,
    power: bigint,
    efficiency: bigint
  ): Promise<MiningTransactionResult> {
    logger.mining('start', minerId, {
      power: power.toString(),
      efficiency: efficiency.toString(),
    });

    return withCriticalError(
      async () => {
        const result = await this.miningContract.startMining(minerId);
        logger.transaction('Start Mining', result.hash, result.success);
        return {
          hash: result.hash,
          success: result.success,
          receipt: result.receipt,
        };
      },
      'Failed to start mining',
      { minerId: minerId.toString() }
    );
  }

  /**
   * Detiene la minería de un CoreMiner
   * 
   * @param minerId - ID del minero
   * @returns Resultado de la transacción
   */
  async stopMining(minerId: bigint): Promise<MiningTransactionResult> {
    logger.mining('stop', minerId);

    return withCriticalError(
      async () => {
        const result = await this.miningContract.stopMining(minerId);
        logger.transaction('Stop Mining', result.hash, result.success);
        return {
          hash: result.hash,
          success: result.success,
          receipt: result.receipt,
        };
      },
      'Failed to stop mining',
      { minerId: minerId.toString() }
    );
  }

  /**
   * Reclama las recompensas acumuladas
   * 
   * @param minerId - ID del minero
   * @returns Resultado con cantidad reclamada
   */
  async claimRewards(minerId: bigint): Promise<ClaimResult> {
    logger.mining('claim rewards', minerId);

    return withCriticalError(
      async () => {
        const result = await this.miningContract.claimRewards(minerId);
        logger.transaction('Claim Rewards', result.hash, result.success);
        return {
          tx: {
            hash: result.hash,
            success: result.success,
            receipt: result.receipt || undefined,
          },
          amount: result.amount,
        };
      },
      'Failed to claim rewards',
      { minerId: minerId.toString() }
    );
  }

  /**
   * Verifica si un minero está actualmente minando
   * 
   * @param minerId - ID del minero
   * @returns true si está minando
   */
  async isMining(minerId: bigint): Promise<boolean> {
    return withSafeRead(
      () => this.miningContract.isMining(minerId),
      'Failed to check mining status',
      false,
      { minerId: minerId.toString() }
    );
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createMiningOperationsService(
  contractManager: ContractManager
): MiningOperationsService {
  return new MiningOperationsService(contractManager);
}
