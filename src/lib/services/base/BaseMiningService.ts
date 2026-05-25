/**
 * BaseMiningService - Clase base abstracta para servicios de mining
 * 
 * Proporciona acceso común a contractManager y miningContract
 * para evitar duplicación en servicios especializados.
 * 
 * **Elimina ~30 líneas de código duplicado** en 4 servicios de mining.
 * 
 * @pattern Template Method (GoF)
 * @principle DRY - Don't Repeat Yourself
 */

import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { IMiningContract } from '@/lib/contracts/interfaces/IMiningContract';

/**
 * Clase base abstracta para todos los servicios de mining
 * 
 * Centraliza la inicialización de contractManager y miningContract
 * que es común a todos los servicios especializados.
 * 
 * @example
 * ```typescript
 * export class MiningRewardsService extends BaseMiningService {
 *   constructor(contractManager: ContractManager) {
 *     super(contractManager);
 *     // Ya tienes acceso a this.contractManager y this.miningContract
 *   }
 * 
 *   async calculateRewards(minerId: bigint): Promise<bigint> {
 *     // Usa this.miningContract directamente
 *     return await this.miningContract.getPendingRewards(minerId);
 *   }
 * }
 * ```
 */
export abstract class BaseMiningService {
  protected readonly contractManager: ContractManager;
  protected readonly miningContract: IMiningContract;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
    this.miningContract = contractManager.getMiningPool();
  }
}
