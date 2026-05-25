/**
 * MinerFeedingService - Gestión de Alimentación de Mineros
 * 
 * Responsabilidad única: Alimentación y mantenimiento de mineros voraces
 * 
 * Sistema de hambre:
 * - feedingInterval: Tiempo entre alimentaciones (ej: 24h)
 * - hungerGracePeriod: Gracia antes de penalización (ej: 12h)
 * - hungerPenalty: Reducción de efficiency por hambre
 * - voraciousBonus: Bonus de power cuando está bien alimentado
 * 
 * @pattern Service Layer (DDD)
 * @principle SRP - Solo alimentación de mineros
 */

import { ContractManager } from '@/lib/contracts/ContractManager';
import { BaseMiningService } from '@/lib/services/base/BaseMiningService';
import { logger } from '@/lib/utils/logging/logger';
import { withCriticalError, withSafeRead } from '@/lib/utils';
import type { IMiningContract } from '@/lib/contracts/interfaces';
import type { MiningTransactionResult } from './types';
import { HUNGER_THRESHOLD } from '@/lib/constants/mining';

/**
 * Servicio especializado en alimentación de mineros
 * 
 * **REFACTORIZACIÓN:** Ahora extiende BaseMiningService para eliminar duplicación.
 */
export class MinerFeedingService extends BaseMiningService {
  constructor(contractManager: ContractManager) {
    super(contractManager);
  }

  /**
   * Alimenta un minero voraz
   * 
   * Actualiza lastFed y restaura efficiency si tenía hambre.
   * 
   * @param minerId - ID del minero
   * @returns Resultado de la transacción
   */
  async feedMiner(minerId: bigint): Promise<MiningTransactionResult> {
    logger.mining('feed', minerId);
    
    return withCriticalError(
      async () => {
        const result = await this.miningContract.feedMiner(minerId);
        logger.transaction('Feed Miner', result.hash, result.success);
        return {
          hash: result.hash,
          success: result.success,
          receipt: result.receipt,
        };
      },
      'Failed to feed miner',
      { minerId: minerId.toString() }
    );
  }

  /**
   * Verifica el nivel de hambre de un minero
   * 
   * Calcula el % de hambre basado en tiempo desde última alimentación.
   * 
   * @param minerId - ID del minero
   * @returns Nivel de hambre (0-100, donde 0=satisfecho, 100=muy hambriento)
   */
  async checkHungerLevel(minerId: bigint): Promise<number> {
    return withSafeRead(
      async () => {
        const [isHungry, isStarving, config] = await Promise.all([
          this.miningContract.isHungry(minerId),
          this.miningContract.isStarving(minerId),
          this.miningContract.getFeedingConfig(),
        ]);
        
        if (isStarving) {
          return 100; // Hambre crítica
        }
        
        if (isHungry) {
          // Calcular % basado en tiempo hasta starvation
          const timeUntilStarving = await this.miningContract.getTimeUntilStarving(minerId);
          const gracePeriod = config.hungerGracePeriod;
          
          // Si está en grace period, calcular %
          const hungerProgress = gracePeriod > 0
            ? Math.floor(((gracePeriod - timeUntilStarving) / gracePeriod) * 50) + 50
            : 50;
          
          return Math.min(100, Math.max(50, hungerProgress));
        }
        
        // No tiene hambre
        return 0;
      },
      'Failed to check hunger level',
      0,
      { minerId: minerId.toString() }
    );
  }

  /**
   * Verifica si un minero necesita ser alimentado
   * 
   * Usa threshold de 70: si hunger > 70, necesita alimentación urgente.
   * 
   * @param minerId - ID del minero
   * @returns true si necesita alimentación, false si no
   */
  async needsFeeding(minerId: bigint): Promise<boolean> {
    return withSafeRead(
      async () => {
        const hungerLevel = await this.checkHungerLevel(minerId);
        return hungerLevel > HUNGER_THRESHOLD;
      },
      'Failed to check feeding needs',
      false,
      { minerId: minerId.toString() }
    );
  }

  /**
   * Obtiene el costo de alimentar un minero
   * 
   * **NOTA:** El contrato MiningPool actual no cobra por feeding.
   * Este método retorna 0n pero está preparado para cuando se implemente.
   * 
   * @param minerId - ID del minero
   * @returns Costo en tokens (wei)
   * 
   * @todo Implementar cuando el contrato exponga feeding costs
   */
  async getFeedingCost(minerId: bigint): Promise<bigint> {
    // Por ahora feeding es gratuito en el contrato
    // Este método existe para futuras versiones que cobren por feeding
    return 0n;
  }

}

/**
 * Factory para crear instancia del servicio
 */
export function createMinerFeedingService(
  contractManager: ContractManager
): MinerFeedingService {
  return new MinerFeedingService(contractManager);
}
