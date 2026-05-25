/**
 * ForgeFacade - Enhanced Facade Pattern
 * 
 * Proporciona una API unificada con validaciones, retry logic y orquestación.
 * No solo delega, sino que agrega valor real:
 * - ✅ Validación de inputs con Zod
 * - ✅ Retry automático para operaciones blockchain
 * - ✅ Orquestación de operaciones complejas
 * - ✅ Logging estructurado
 * 
 * @pattern Facade (GoF)
 * @pattern Retry with Exponential Backoff
 * @pattern Validation
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { ForgeTokenService } from './ForgeTokenService';
import { ForgeRecipeService } from './ForgeRecipeService';
import { GeodeHatchService } from './GeodeHatchService';
import { retryTransaction } from '@/lib/utils/network/retry';
import { validateInput } from '@/lib/services/validation/schemas';
import {
  GeodeTypeSchema,
  TokenTypeSchema,
  ApproveTokenInputSchema,
  ApproveAllTokensInputSchema,
  CheckApprovalsInputSchema,
  ForgeRecipeInputSchema,
  HatchGeodeInputSchema,
  AddressSchema,
  TokenIdSchema,
} from '@/lib/services/validation/schemas';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('ForgeFacade');
import type {
  TokenBalances,
  ApprovalStatus,
  GeodeType,
  ForgeCosts,
  GEODE_COSTS,
  ForgeResult,
  HatchResult,
  MaterialInput,
  Recipe,
} from './types';

/**
 * Facade que unifica los servicios modulares de Forge
 * Mantiene compatibilidad con API anterior
 */
export class ForgeFacade {
  private tokenService: ForgeTokenService;
  private recipeService: ForgeRecipeService;
  private hatchService: GeodeHatchService;

  /**
   * @param contractManager - Gestor de contratos
   * @param services - (Opcional) Servicios pre-instanciados para inyección de dependencias
   */
  constructor(
    contractManager: ContractManager,
    services?: {
      tokenService?: ForgeTokenService;
      recipeService?: ForgeRecipeService;
      hatchService?: GeodeHatchService;
    }
  ) {
    // Inyección de dependencias con retrocompatibilidad
    this.tokenService = services?.tokenService || new ForgeTokenService(contractManager);
    this.recipeService = services?.recipeService || new ForgeRecipeService(contractManager);
    this.hatchService = services?.hatchService || new GeodeHatchService(contractManager);
  }

  // ==========================================
  // Token Management (delegado a ForgeTokenService)
  // ==========================================

  async getTokenBalances(userAddress: Address): Promise<TokenBalances> {
    return this.tokenService.getTokenBalances(userAddress);
  }

  async getBalance(
    tokenType: 'axs' | 'slp' | 'memento',
    userAddress: Address
  ): Promise<string> {
    // Validar inputs
    const validatedType = validateInput(TokenTypeSchema, tokenType);
    const validatedAddress = validateInput(AddressSchema, userAddress);

    return this.tokenService.getBalance(validatedType, validatedAddress);
  }

  async checkApprovals(
    userAddress: Address,
    geodeType: GeodeType,
    mementosExtra: number = 0
  ): Promise<ApprovalStatus> {
    // Validar inputs
    const validated = validateInput(CheckApprovalsInputSchema, {
      userAddress,
      geodeType,
      mementosExtra,
    });

    return this.tokenService.checkApprovals(
      validated.userAddress,
      validated.geodeType as unknown as GeodeType,
      validated.mementosExtra
    );
  }

  async approveToken(
    tokenType: 'axs' | 'slp' | 'memento',
    amount: string
  ): Promise<{ hash: string; success: boolean }> {
    // Validar inputs
    const validated = validateInput(ApproveTokenInputSchema, {
      tokenType,
      amount,
    });

    // Ejecutar con retry automático
    return retryTransaction(
      () => this.tokenService.approveToken(validated.tokenType, validated.amount),
      {
        maxAttempts: 3,
        onRetry: (attempt) => {
          log.warn(`Retrying approval (attempt ${attempt})`, {
            tokenType: validated.tokenType,
          });
        },
      }
    );
  }

  async approveAllTokens(
    geodeType: GeodeType,
    mementosExtra: number = 0
  ): Promise<void> {
    // Validar inputs
    const validated = validateInput(ApproveAllTokensInputSchema, {
      geodeType,
      mementosExtra,
    });

    log.info('Approving all tokens', {
      geodeType: validated.geodeType,
      mementosExtra: validated.mementosExtra,
    });

    // Ejecutar con retry automático
    return retryTransaction(
      () => this.tokenService.approveAllTokens(validated.geodeType as unknown as GeodeType, validated.mementosExtra),
      {
        maxAttempts: 3,
        onRetry: (attempt) => {
          log.warn(`Retrying approval batch (attempt ${attempt})`);
        },
      }
    );
  }

  async revokeApproval(
    tokenType: 'axs' | 'slp' | 'memento'
  ): Promise<{ hash: string; success: boolean }> {
    return this.tokenService.revokeApproval(tokenType);
  }

  // ==========================================
  // Recipe & Forging (delegado a ForgeRecipeService)
  // ==========================================

  /**
   * Forja una nueva geoda
   * 
   * @param recipeId - ID de la receta
   * @param materials - Array de materiales (tokens y mementos)
   * @param geodeType - Tipo de geoda
   * @param mementosToUse - Mementos extra para reducir riesgo
   * @returns Resultado de la forja
   */
  async forgeRecipe(
    recipeId: number,
    materials: MaterialInput[],
    geodeType?: number,
    mementosToUse?: number
  ): Promise<ForgeResult> {
    // Validar inputs
    const validated = validateInput(ForgeRecipeInputSchema, {
      recipeId,
      materials,
    });

    log.info('Forging recipe', { recipeId: validated.recipeId, mementosToUse });

    // Ejecutar con retry automático
    return retryTransaction(
      () => this.recipeService.forgeGeode(validated.recipeId, validated.materials, geodeType, mementosToUse),
      {
        maxAttempts: 2, // Solo 2 intentos para forja (más costoso)
        onRetry: (attempt) => {
          log.warn(`Retrying forge (attempt ${attempt})`, {
            recipeId: validated.recipeId,
            mementosToUse
          });
        },
      }
    );
  }

  async getRecipe(recipeId: number): Promise<Recipe> {
    return this.recipeService.getRecipe(recipeId);
  }

  async getAllRecipes(onlyEnabled: boolean = true): Promise<Recipe[]> {
    return this.recipeService.getAllRecipes(onlyEnabled);
  }

  async calculateCost(recipeId: number): Promise<Map<Address, bigint>> {
    return this.recipeService.calculateCost(recipeId);
  }

  async canForge(userAddress: Address, recipeId: number): Promise<boolean> {
    return this.recipeService.canForge(userAddress, recipeId);
  }

  async hasMaterials(userAddress: Address, recipeId: number): Promise<boolean> {
    return this.recipeService.hasMaterials(userAddress, recipeId);
  }

  // ==========================================
  // Hatching (delegado a GeodeHatchService)
  // ==========================================

  async hatchGeode(geodeId: bigint): Promise<HatchResult> {
    // Validar inputs
    const validated = validateInput(HatchGeodeInputSchema, { geodeId });

    log.info('Hatching geode', { geodeId: validated.geodeId.toString() });

    // Ejecutar con retry automático
    return retryTransaction(
      () => this.hatchService.hatchGeode(validated.geodeId),
      {
        maxAttempts: 2,
        onRetry: (attempt) => {
          log.warn(`Retrying hatch (attempt ${attempt})`, {
            geodeId: validated.geodeId.toString(),
          });
        },
      }
    );
  }

  async canHatch(geodeId: bigint): Promise<boolean> {
    return this.hatchService.canHatch(geodeId);
  }

  async getIncubationTime(geodeId: bigint): Promise<number> {
    return this.hatchService.getIncubationTime(geodeId);
  }

  async isReadyToHatch(geodeId: bigint): Promise<boolean> {
    return this.hatchService.isReadyToHatch(geodeId);
  }

  // ==========================================
  // Acceso directo a servicios internos
  // (para uso avanzado)
  // ==========================================

  get tokens() {
    return this.tokenService;
  }

  get recipes() {
    return this.recipeService;
  }

  get hatching() {
    return this.hatchService;
  }

  // ==========================================
  // Operaciones Orquestadas (Valor Agregado)
  // ==========================================

  /**
   * Orquestación: Verifica, aprueba (si necesario) y forja en una sola operación
   * 
   * Flujo completo:
   * 1. Verifica si tiene materiales necesarios
   * 2. Verifica aprobaciones
   * 3. Aprueba tokens faltantes (si necesario)
   * 4. Ejecuta forja
   * 
   * @param userAddress - Dirección del usuario
   * @param recipeId - ID de la receta
   * @param materials - Materiales a usar
   * @returns Resultado de la forja
   * @throws Error si no tiene materiales suficientes
   */
  async forgeWithAutoApproval(
    userAddress: Address,
    recipeId: number,
    materials: MaterialInput[]
  ): Promise<ForgeResult> {
    log.info('Starting orchestrated forge', { recipeId, userAddress });

    // 1. Verificar materiales
    const hasMaterials = await this.hasMaterials(userAddress, recipeId);
    if (!hasMaterials) {
      throw new Error(`Insufficient materials for recipe ${recipeId}`);
    }

    // 2. Verificar si puede forjar
    const canForge = await this.canForge(userAddress, recipeId);
    if (!canForge) {
      log.warn('User cannot forge, checking approvals...', { recipeId });
      
      // 3. Aprobar tokens necesarios (basado en receta)
      // Por ahora usamos geodeType basado en recipeId
      // Esto es una simplificación, en producción deberías mapear recipeId -> geodeType
      const geodeType = this.mapRecipeToGeodeType(recipeId);
      
      log.info('Approving tokens automatically', { geodeType });
      await this.approveAllTokens(geodeType);
    }

    // 4. Ejecutar forja
    return this.forgeRecipe(recipeId, materials);
  }

  /**
   * Orquestación: Verifica y eclosiona geoda si está lista
   * 
   * Flujo completo:
   * 1. Verifica si geoda existe y está lista
   * 2. Verifica tiempo de incubación
   * 3. Ejecuta eclosión si está lista
   * 
   * @param geodeId - ID de la geoda
   * @returns Resultado de la eclosión
   * @throws Error si no está lista para eclosionar
   */
  async hatchWhenReady(geodeId: bigint): Promise<HatchResult> {
    log.info('Checking if geode ready to hatch', { geodeId: geodeId.toString() });

    // 1. Verificar si puede eclosionar
    const canHatch = await this.canHatch(geodeId);
    if (!canHatch) {
      throw new Error(`Geode ${geodeId} is not ready to hatch`);
    }

    // 2. Verificar si realmente está lista (doble verificación)
    const isReady = await this.isReadyToHatch(geodeId);
    if (!isReady) {
      const remainingTime = await this.getIncubationTime(geodeId);
      throw new Error(
        `Geode ${geodeId} needs ${remainingTime} more seconds to incubate`
      );
    }

    // 3. Eclosionar
    return this.hatchGeode(geodeId);
  }

  /**
   * Batch operation: Aprobar múltiples tokens en paralelo
   * 
   * @param approvals - Array de aprobaciones a ejecutar
   * @returns Resultados de todas las aprobaciones
   */
  async batchApproveTokens(
    approvals: Array<{ tokenType: 'axs' | 'slp' | 'memento'; amount: string }>
  ): Promise<Array<{ hash: string; success: boolean }>> {
    log.info('Batch approving tokens', { count: approvals.length });

    const results = await Promise.all(
      approvals.map((approval) =>
        this.approveToken(approval.tokenType, approval.amount)
      )
    );

    const successCount = results.filter((r) => r.success).length;
    log.info('Batch approval completed', {
      total: results.length,
      successful: successCount,
      failed: results.length - successCount,
    });

    return results;
  }

  /**
   * Helper privado: Mapea recipe ID a geode type
   * TODO: Esto debería venir del contrato o configuración
   */
  private mapRecipeToGeodeType(recipeId: number): GeodeType {
    // Simplificación: mapeo basado en rangos de IDs
    // En producción, esto debería consultarse del contrato
    if (recipeId <= 9) return 'PETIT' as unknown as GeodeType;
    if (recipeId <= 18) return 'ALTO' as unknown as GeodeType;
    if (recipeId <= 27) return 'ANIMAL' as unknown as GeodeType;
    if (recipeId <= 36) return 'ULTRAMECH' as unknown as GeodeType;
    return 'TANQUE' as unknown as GeodeType;
  }
}

/**
 * Factory para crear instancia del servicio (compatible con API anterior)
 * 
 * @pattern Factory Method
 */
export function createForgeService(
  contractManager: ContractManager,
  services?: {
    tokenService?: ForgeTokenService;
    recipeService?: ForgeRecipeService;
    hatchService?: GeodeHatchService;
  }
): ForgeFacade {
  return new ForgeFacade(contractManager, services);
}
