/**
 * RecipeService
 *
 * Service Layer para gestionar recetas de forja
 * Encapsula lógica de negocio y operaciones admin
 *
 * @pattern Service Layer (DDD)
 * @pattern Facade - Simplifica acceso a RecipeRegistry
 */

import type { ContractManager } from "@/lib/contracts/ContractManager";
import type { Address } from "viem";
import {
  RecipeCategory,
  MinerType,
  CATEGORY_NAMES,
  MINER_TYPE_NAMES,
  MINER_TYPE_EMOJIS,
  type RecipeInfo,
} from "@/lib/contracts/interfaces/IRecipeRegistry";
import type { Recipe } from "@/lib/contracts/interfaces/SharedTypes";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const log = createServiceLogger("RecipeService");

/**
 * Filtros para búsqueda de recetas
 */
export interface RecipeFilters {
  category?: RecipeCategory;
  minerType?: MinerType;
  enabled?: boolean;
  hasSupply?: boolean;
}

/**
 * Estadísticas de recetas
 */
export interface RecipeStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<RecipeCategory, number>;
  byType: Record<MinerType, number>;
}

/**
 * Servicio para gestionar recetas de forja
 */
export class RecipeService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Verifica si una dirección es admin
   */
  async isAdmin(address: Address): Promise<boolean> {
    try {
      const registry = this.contractManager.getRecipeRegistry();
      return await registry.hasAdminRole(address);
    } catch (error) {
      log.error("Error checking admin role", { error, address });
      return false;
    }
  }

  /**
   * Obtiene una receta específica
   */
  async getRecipe(
    category: number,
    minerType: number,
    minerIndex: number,
  ): Promise<RecipeInfo | null> {
    try {
      log.info("Getting recipe", { category, minerType, minerIndex });

      const registry = this.contractManager.getRecipeRegistry();

      const [maxSupply, enabled] = await Promise.all([
        registry.getRecipeMaxSupply(category, minerType, minerIndex),
        registry.isRecipeActive(category, minerType, minerIndex),
      ]);

      // Si no tiene supply configurado, la receta no existe
      if (maxSupply === 0n) {
        return null;
      }

      const recipe: Recipe = {
        id: category * 100 + minerType * 10 + minerIndex,
        name: this.generateRecipeName(category, minerType, minerIndex),
        category,
        minerType,
        minerIndex,
        enabled: enabled,
        maxSupply,
        currentSupply: 0n,
        materials: [],
        chances: { success: 8000, critical: 1000, rare: 500 },
      };

      const recipeInfo = await this.enrichRecipeInfo(recipe);

      log.info("Recipe retrieved", {
        id: recipeInfo.id,
        enabled,
        maxSupply: maxSupply.toString(),
      });

      return recipeInfo;
    } catch (error) {
      log.error("Error getting recipe", {
        error,
        category,
        minerType,
        minerIndex,
      });
      return null;
    }
  }

  /**
   * Obtiene todas las recetas configuradas
   */
  async getAllRecipes(filters?: RecipeFilters): Promise<RecipeInfo[]> {
    try {
      log.info("Getting all recipes", { filters });

      const recipes: RecipeInfo[] = [];
      const registry = this.contractManager.getRecipeRegistry();

      // Iterar sobre todas las combinaciones posibles
      // Categories: 0-2 (Common, Rare, Epic)
      // MinerTypes: 0-8 (Beast, Aqua, Bird, etc.)
      // MinerIndexes: 0-99 (100 posibles miners por tipo)

      const maxCategory = 2;
      const maxMinerType = 8;
      const maxMinerIndex = 99;

      for (let cat = 0; cat <= maxCategory; cat++) {
        // Aplicar filtro de categoría
        if (filters?.category !== undefined && cat !== filters.category) {
          continue;
        }

        for (let type = 0; type <= maxMinerType; type++) {
          // Aplicar filtro de tipo
          if (filters?.minerType !== undefined && type !== filters.minerType) {
            continue;
          }

          for (let index = 0; index <= maxMinerIndex; index++) {
            try {
              const [maxSupply, enabled] = await Promise.all([
                registry.getRecipeMaxSupply(cat, type, index),
                registry.isRecipeActive(cat, type, index),
              ]);

              // Solo incluir recetas que tengan supply configurado
              if (maxSupply === 0n) {
                continue;
              }

              // Aplicar filtro de estado activo
              if (
                filters?.enabled !== undefined &&
                enabled !== filters.enabled
              ) {
                continue;
              }

              const recipe: Recipe = {
                id: cat * 100 + type * 10 + index,
                name: this.generateRecipeName(cat, type, index),
                category: cat,
                minerType: type,
                minerIndex: index,
                enabled,
                maxSupply,
                currentSupply: 0n,
                materials: [],
                chances: { success: 8000, critical: 1000, rare: 500 },
              };

              const recipeInfo = await this.enrichRecipeInfo(recipe);

              // Aplicar filtro de supply disponible
              if (filters?.hasSupply && recipeInfo.remaining === 0n) {
                continue;
              }

              recipes.push(recipeInfo);
            } catch (error) {
              // Continuar con la siguiente receta si hay error
              continue;
            }
          }
        }
      }

      log.info("All recipes retrieved", { count: recipes.length });

      return recipes;
    } catch (error) {
      log.error("Error getting all recipes", { error });
      return [];
    }
  }

  /**
   * Crea o actualiza una receta (solo admin)
   */
  async setRecipe(
    category: number,
    minerType: number,
    minerIndex: number,
    maxSupply: bigint,
    enabled: boolean = true,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      log.info("Setting recipe", {
        category,
        minerType,
        minerIndex,
        maxSupply: maxSupply.toString(),
        enabled,
      });

      const registry = this.contractManager.getRecipeRegistry();

      // Establecer supply máximo (esto también activa la receta automáticamente)
      const result = await registry.setRecipeMaxSupply(
        category,
        minerType,
        minerIndex,
        maxSupply,
      );

      if (!result.success) {
        return result;
      }

      // Si se requiere desactivar, hacer una segunda transacción
      if (!enabled) {
        const statusResult = await registry.setRecipeStatus(
          category,
          minerType,
          minerIndex,
          false,
        );

        if (!statusResult.success) {
          return statusResult;
        }
      }

      log.info("Recipe set successfully", {
        category,
        minerType,
        minerIndex,
      });

      return { success: true };
    } catch (error) {
      log.error("Error setting recipe", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Actualiza el estado activo/inactivo de una receta (solo admin)
   */
  async toggleRecipe(
    category: number,
    minerType: number,
    minerIndex: number,
    enabled: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      log.info("Toggling recipe status", {
        category,
        minerType,
        minerIndex,
        enabled,
      });

      const registry = this.contractManager.getRecipeRegistry();

      const result = await registry.setRecipeStatus(
        category,
        minerType,
        minerIndex,
        enabled,
      );

      if (result.success) {
        log.info("Recipe status toggled", {
          category,
          minerType,
          minerIndex,
          enabled,
        });
      }

      return result;
    } catch (error) {
      log.error("Error toggling recipe", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Crea múltiples recetas en batch (solo admin)
   */
  async batchSetRecipes(
    recipes: Array<{
      category: number;
      minerType: number;
      minerIndex: number;
      maxSupply: bigint;
    }>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      log.info("Batch setting recipes", { count: recipes.length });

      const registry = this.contractManager.getRecipeRegistry();

      const categories = recipes.map((r) => r.category);
      const minerTypes = recipes.map((r) => r.minerType);
      const minerIndexes = recipes.map((r) => r.minerIndex);
      const maxSupplies = recipes.map((r) => r.maxSupply);

      const result = await registry.batchSetRecipeMaxSupply(
        categories,
        minerTypes,
        minerIndexes,
        maxSupplies,
      );

      if (result.success) {
        log.info("Recipes batch set successfully", { count: recipes.length });
      }

      return result;
    } catch (error) {
      log.error("Error batch setting recipes", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Obtiene estadísticas de recetas
   */
  async getStats(): Promise<RecipeStats> {
    try {
      const recipes = await this.getAllRecipes();

      const stats: RecipeStats = {
        total: recipes.length,
        active: recipes.filter((r) => r.enabled).length,
        inactive: recipes.filter((r) => !r.enabled).length,
        byCategory: {
          [RecipeCategory.COMMON]: 0,
          [RecipeCategory.RARE]: 0,
          [RecipeCategory.EPIC]: 0,
          [RecipeCategory.LEGENDARY]: 0,
        },
        byType: {
          [MinerType.BEAST]: 0,
          [MinerType.AQUA]: 0,
          [MinerType.BIRD]: 0,
          [MinerType.REPTILE]: 0,
          [MinerType.BUG]: 0,
          [MinerType.PLANT]: 0,
          [MinerType.MECH]: 0,
          [MinerType.DUSK]: 0,
          [MinerType.DAWN]: 0,
        },
      };

      recipes.forEach((recipe) => {
        stats.byCategory[recipe.category as RecipeCategory]++;
        stats.byType[recipe.minerType as MinerType]++;
      });

      return stats;
    } catch (error) {
      log.error("Error getting recipe stats", { error });
      throw error;
    }
  }

  /**
   * Helpers privados
   */

  /**
   * Enriquece una receta con información adicional para UI
   */
  private async enrichRecipeInfo(recipe: Recipe): Promise<RecipeInfo> {
    // TODO: Obtener supply actual del SupplyTracker cuando esté disponible
    // Por ahora, asumimos que no se ha forjado nada
    const currentSupply = 0n;
    const remaining = recipe.maxSupply - currentSupply;
    const progress =
      recipe.maxSupply > 0n
        ? Number((currentSupply * 100n) / recipe.maxSupply)
        : 0;

    return {
      ...recipe,
      id: recipe.id,
      categoryName: CATEGORY_NAMES[recipe.category as RecipeCategory],
      typeName: MINER_TYPE_NAMES[recipe.minerType as MinerType],
      currentSupply,
      remaining,
      progress,
    };
  }

  /**
   * Genera un nombre descriptivo para la receta
   */
  private generateRecipeName(
    category: number,
    minerType: number,
    minerIndex: number,
  ): string {
    const categoryName = CATEGORY_NAMES[category as RecipeCategory];
    const typeName = MINER_TYPE_NAMES[minerType as MinerType];
    const emoji = MINER_TYPE_EMOJIS[minerType as MinerType];

    return `${emoji} ${categoryName} ${typeName} #${minerIndex}`;
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createRecipeService(
  contractManager: ContractManager,
): RecipeService {
  return new RecipeService(contractManager);
}
