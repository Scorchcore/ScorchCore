/**
 * ForgeRecipeService - Gestión de Recetas y Forja
 *
 * Responsabilidad única: Forja de geodas y gestión de recetas
 *
 * @pattern Service Layer (DDD)
 * @principle SRP - Solo gestiona forja y recetas
 */

import type { Address } from "viem";
import type { ContractManager } from "@/lib/contracts/ContractManager";
import type {
  ForgeResult,
  MaterialInput,
  Recipe,
} from "@/lib/contracts/interfaces";
import { BaseForgeService } from "@/lib/services/base/BaseForgeService";
import { withCriticalError, withSafeRead } from "@/lib/utils";
import { logger } from "@/lib/utils/logging/logger";

/**
 * Servicio especializado en forja de geodas y recetas
 *
 * **REFACTORIZACIÓN:** Ahora extiende BaseForgeService para eliminar duplicación.
 */
export class ForgeRecipeService extends BaseForgeService {
  /**
   * Forja una nueva geoda
   *
   * Los mementos base deben incluirse en el array `materials`.
   * Los mementos extra se pasan en `mementosToUse` para reducir fallo.
   *
   * @param recipeId - ID de la receta (tipo de geoda)
   * @param materials - Materiales para la forja (incluyendo tokens y mementos base)
   * @param geodeType - Tipo de geoda/clase de Axie (0-8)
   * @param mementosToUse - Cantidad de mementos extra para reducir riesgo
   * @returns Resultado de la forja
   *
   * @example
   * ```typescript
   * const materials = [
   *   { tokenAddress: AXS_ADDRESS, amount: parseUnits('10', 18) },
   *   { tokenAddress: MEMENTO_ADDRESS, amount: 5n } // Mementos base
   * ];
   * const axieIds = [123n]; // Fake Axies replace SLP in the testnet flow
   * await forgeGeode(1, materials, 0, 20, axieIds); // +20 mementos extra = -2% fallo
   * ```
   */
  async forgeGeode(
    recipeId: number,
    materials: MaterialInput[],
    geodeType?: number,
    mementosToUse?: number,
    axieIds: bigint[] = [],
    protocolFee?: bigint,
  ): Promise<ForgeResult> {
    logger.forge("start", undefined, {
      recipeId,
      materialsCount: materials.length,
      geodeType,
      mementosToUse,
      axieIds: axieIds.map((id) => id.toString()),
    });

    return withCriticalError(
      async () => {
        const result = await this.forgeContract.forgeRecipe(
          recipeId,
          materials,
          geodeType,
          mementosToUse,
          axieIds,
          protocolFee,
        );
        logger.forge("complete", result.geodeId, {
          isCritical: result.isCritical,
          isRare: result.isRare,
        });
        return result;
      },
      "Failed to forge geode",
      { recipeId, mementosToUse, axieIds: axieIds.map((id) => id.toString()) },
    );
  }

  /**
   * Obtiene información de una receta específica
   *
   * @param recipeId - ID de la receta
   * @returns Información completa de la receta
   */
  async getRecipe(recipeId: number): Promise<Recipe> {
    return withCriticalError(
      () => this.forgeContract.getRecipe(recipeId),
      "Failed to get recipe",
      { recipeId },
    );
  }

  /**
   * Obtiene todas las recetas disponibles
   *
   * @param onlyEnabled - Si solo retornar recetas habilitadas
   * @returns Array de recetas
   */
  async getAllRecipes(onlyEnabled: boolean = true): Promise<Recipe[]> {
    return withCriticalError(
      () => this.forgeContract.getAllRecipes(onlyEnabled),
      "Failed to get all recipes",
    );
  }

  /**
   * Calcula el costo total de una receta
   *
   * @param recipeId - ID de la receta
   * @returns Mapa de direcciones de token → cantidad requerida
   */
  async calculateCost(recipeId: number): Promise<Map<Address, bigint>> {
    return withCriticalError(
      () => this.forgeContract.calculateCost(recipeId),
      "Failed to calculate cost",
      { recipeId },
    );
  }

  /**
   * Verifica si el usuario puede forjar una receta
   *
   * @param userAddress - Dirección del usuario
   * @param recipeId - ID de la receta
   * @returns true si puede forjar, false si no
   */
  async canForge(userAddress: Address, recipeId: number): Promise<boolean> {
    return withSafeRead(
      () => this.forgeContract.canForge(userAddress, recipeId),
      "Failed to check forge eligibility",
      false,
      { userAddress, recipeId },
    );
  }

  /**
   * Verifica si el usuario tiene todos los materiales necesarios
   *
   * @param userAddress - Dirección del usuario
   * @param recipeId - ID de la receta
   * @returns true si tiene todos los materiales, false si no
   */
  async hasMaterials(userAddress: Address, recipeId: number): Promise<boolean> {
    return withSafeRead(
      () => this.forgeContract.hasMaterials(userAddress, recipeId),
      "Failed to check materials",
      false,
      { userAddress, recipeId },
    );
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createForgeRecipeService(
  contractManager: ContractManager,
): ForgeRecipeService {
  return new ForgeRecipeService(contractManager);
}
