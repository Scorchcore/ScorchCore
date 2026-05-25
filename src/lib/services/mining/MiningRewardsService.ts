/**
 * MiningRewardsService - Gestión de Recompensas de Minería
 * 
 * Responsabilidad única: Cálculos y estimaciones de recompensas
 * 
 * @pattern Service Layer (DDD)
 * @principle SRP - Solo cálculos de recompensas
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { BaseMiningService } from '@/lib/services/base/BaseMiningService';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { TokenService } from '../token/TokenService';
import { TOKEN_ADDRESSES } from '@/lib/config/tokens';
import { BASE_EMISSION_RATE } from '@/lib/constants/mining';

const log = createServiceLogger('MiningRewardsService');

/**
 * Servicio especializado en cálculos de recompensas
 * 
 * **REFACTORIZACIÓN:** Ahora extiende BaseMiningService para eliminar duplicación.
 */
export class MiningRewardsService extends BaseMiningService {
  private tokenService: TokenService;

  /**
   * @param contractManager - Gestor de contratos
   * @param tokenService - (Opcional) Servicio de tokens. Si no se provee, se crea internamente.
   */
  constructor(
    contractManager: ContractManager,
    tokenService?: TokenService
  ) {
    super(contractManager);
    // Inyección de dependencia con retrocompatibilidad
    this.tokenService = tokenService || new TokenService(contractManager);
  }

  /**
   * Calcula las recompensas pendientes de un minero
   * 
   * @param minerId - ID del minero
   * @returns Cantidad de recompensas pendientes
   */
  async calculatePendingRewards(minerId: bigint): Promise<bigint> {
    try {
      const rewards = await this.miningContract.getPendingRewards(minerId);
      return rewards.totalAmount || 0n;
    } catch (error) {
      log.error('Failed to calculate pending rewards', error, { minerId: minerId.toString() });
      return 0n;
    }
  }

  /**
   * Obtiene la tasa base de recompensas por hora
   * 
   * **NOTA IMPORTANTE:** Esta tasa está importada de constants/mining.ts
   * y debe coincidir con la configuración del contrato MiningPool en blockchain.
   * 
   * @returns Tasa base de recompensas (100 CORE/hora)
   * @see {@link BASE_EMISSION_RATE}
   * 
   * @todo Agregar método getBaseRate() en IMiningContract cuando esté disponible
   */
  async getBaseRewardPerHour(): Promise<bigint> {
    return BASE_EMISSION_RATE;
  }

  /**
   * Calcula las recompensas estimadas por hora
   * 
   * **Fórmula:** `baseRate * power * efficiency / 10000`
   * 
   * - baseRate: Tasa de emisión base (100 CORE/hora)
   * - power: Poder de minería del CoreMiner
   * - efficiency: Eficiencia del CoreMiner (basis points, 10000 = 100%)
   * 
   * @param power - Poder de minería del minero
   * @param efficiency - Eficiencia del minero (0-10000)
   * @returns Recompensas estimadas por hora en wei
   * 
   * @example
   * ```typescript
   * // Minero con power=50, efficiency=8000 (80%)
   * const rewards = await estimateRewardsPerHour(50n, 8000n);
   * // rewards = 100 * 50 * 8000 / 10000 = 4000 CORE/hora
   * ```
   */
  async estimateRewardsPerHour(
    power: bigint,
    efficiency: bigint
  ): Promise<bigint> {
    try {
      const baseRate = await this.getBaseRewardPerHour();
      // Fórmula simplificada: baseRate * power * efficiency / 10000
      return (baseRate * power * efficiency) / 10000n;
    } catch (error) {
      log.error('Error estimating rewards per hour', error, { power, efficiency });
      return 0n;
    }
  }

  /**
   * Obtiene el balance de fCORE del usuario
   * 
   * fCORE es el token de recompensas de minería.
   * 
   * @param userAddress - Dirección del wallet del usuario
   * @returns Balance de fCORE en wei (bigint)
   */
  async getFCoreBalance(userAddress: Address): Promise<bigint> {
    try {
      const balance = await this.tokenService.getBalance(TOKEN_ADDRESSES.FCORE, userAddress);
      log.info('fCORE balance retrieved', { userAddress, balance });
      return balance;
    } catch (error) {
      log.error('Failed to get fCORE balance', error, { userAddress });
      return 0n;
    }
  }

  /**
   * Calcula el total acumulado de recompensas ganadas por un minero
   * 
   * Este valor incluye todas las recompensas reclamadas históricamente,
   * no solo las pendientes.
   * 
   * @param minerId - ID del minero
   * @returns Total histórico de recompensas en wei
   */
  async calculateTotalEarned(minerId: bigint): Promise<bigint> {
    try {
      const stats = await this.miningContract.getMinerStats(minerId);
      return stats.totalRewards || 0n;
    } catch (error) {
      log.error('Error calculating total earned', error, { minerId: minerId.toString() });
      return 0n;
    }
  }

  /**
   * Estima recompensas para un período de tiempo específico
   * 
   * @param power - Poder de minería
   * @param efficiency - Eficiencia del minero
   * @param hours - Horas de minería
   * @returns Recompensas estimadas para el período
   */
  async estimateRewardsForPeriod(
    power: bigint,
    efficiency: bigint,
    hours: number
  ): Promise<bigint> {
    try {
      const rewardsPerHour = await this.estimateRewardsPerHour(power, efficiency);
      return rewardsPerHour * BigInt(hours);
    } catch (error) {
      log.error('Error estimating rewards for period', error, { hours });
      return 0n;
    }
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createMiningRewardsService(
  contractManager: ContractManager,
  tokenService?: TokenService
): MiningRewardsService {
  return new MiningRewardsService(contractManager, tokenService);
}
