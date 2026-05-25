/**
 * BaseForgeService - Clase base abstracta para servicios de forge
 * 
 * Proporciona acceso común a contractManager y forgeContract
 * para evitar duplicación en servicios especializados.
 * 
 * **Elimina ~30 líneas de código duplicado** en 3 servicios de forge.
 * 
 * @pattern Template Method (GoF)
 * @principle DRY - Don't Repeat Yourself
 */

import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { IForgeContract } from '@/lib/contracts/interfaces/IForgeContract';

/**
 * Clase base abstracta para todos los servicios de forge
 * 
 * Centraliza la inicialización de contractManager y forgeContract
 * que es común a todos los servicios especializados.
 * 
 * @example
 * ```typescript
 * export class ForgeRecipeService extends BaseForgeService {
 *   constructor(contractManager: ContractManager) {
 *     super(contractManager);
 *     // Ya tienes acceso a this.contractManager y this.forgeContract
 *   }
 * 
 *   async forgeGeode(type: number): Promise<ForgeResult> {
 *     // Usa this.forgeContract directamente
 *     return await this.forgeContract.forgeGeode(type, 0);
 *   }
 * }
 * ```
 */
export abstract class BaseForgeService {
  protected readonly contractManager: ContractManager;
  protected readonly forgeContract: IForgeContract;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
    this.forgeContract = contractManager.getForgeFactory();
  }
}
