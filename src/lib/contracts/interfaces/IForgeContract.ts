/**
 * Interfaz para contratos de Forja (ForgeFactory)
 * Implementa Liskov Substitution Principle (LSP)
 * 
 * Cualquier implementación de esta interfaz debe ser intercambiable
 * sin romper la funcionalidad del sistema
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';
import type { 
  Recipe, 
  MaterialRequirement, 
  MaterialInput, 
  ForgeChances,
  HatchResult 
} from './SharedTypes';

// Re-exportar para compatibilidad con código existente
export type { Recipe, MaterialRequirement, MaterialInput, ForgeChances };

/**
 * Resultado de una operación de forja
 */
export interface ForgeResult {
  success: boolean;
  geodeId?: bigint;
  isCritical: boolean;
  isRare: boolean;
  transaction: TransactionResult;
}

/**
 * Eventos emitidos por el contrato de forja
 */
export interface ForgeEvents {
  GeodeForged: {
    user: Address;
    recipeId: bigint;
    geodeId: bigint;
  };
  GeodeHatched: {
    user: Address;
    geodeId: bigint;
    minerId: bigint;
    power: bigint;
    efficiency: bigint;
    isCritical: boolean;
  };
  ForgeFailed: {
    user: Address;
    recipeId: bigint;
    materialsUsed: bigint;
  };
  MaxSupplyReached: {
    recipeId: bigint;
    totalForged: bigint;
  };
}

/**
 * Interfaz principal del contrato de Forja
 * 
 * Define todas las operaciones que cualquier implementación
 * del sistema de forja debe soportar
 */
export interface IForgeContract extends IBlockchainContract<ForgeEvents> {
  /**
   * Forja una geoda usando una receta específica
   * 
   * @param recipeId - ID de la receta a usar
   * @param materials - Materiales proporcionados por el usuario
   * @param geodeType - (Opcional) Tipo de geoda/clase de Axie (0-8)
   * @param mementosToUse - (Opcional) Cantidad de mementos extra para reducir fallo
   * @param axieIds - (Opcional) Array de IDs de Axies a usar (requerido si material validation está habilitada)
   * @returns Resultado de la operación de forja
   * 
   * @throws Si la receta no existe o está deshabilitada
   * @throws Si los materiales son insuficientes
   * @throws Si se alcanzó el máximo supply
   * @throws Si axieIds es requerido y no se proporciona (material validation habilitada)
   */
  forgeRecipe(
    recipeId: number, 
    materials: MaterialInput[], 
    geodeType?: number, 
    mementosToUse?: number,
    axieIds?: bigint[]
  ): Promise<ForgeResult>;
  
  /**
   * Eclosiona una geoda para obtener un CoreMiner NFT
   * 
   * @param geodeId - ID de la geoda a eclosionar
   * @returns Resultado de la operación de eclosión
   * 
   * @throws Si la geoda no existe
   * @throws Si el usuario no es el dueño
   * @throws Si la geoda no está lista para eclosionar
   */
  hatchGeode(geodeId: bigint): Promise<HatchResult>;
  
  /**
   * Obtiene información de una receta específica
   * 
   * @param recipeId - ID de la receta
   * @returns Información completa de la receta
   */
  getRecipe(recipeId: number): Promise<Recipe>;
  
  /**
   * Obtiene todas las recetas disponibles
   * 
   * @param onlyEnabled - Si solo retornar recetas habilitadas
   * @returns Array de recetas
   */
  getAllRecipes(onlyEnabled?: boolean): Promise<Recipe[]>;
  
  /**
   * Verifica si un usuario puede forjar una receta
   * 
   * @param user - Dirección del usuario
   * @param recipeId - ID de la receta
   * @returns true si puede forjar, false si no
   */
  canForge(user: Address, recipeId: number): Promise<boolean>;
  
  /**
   * Verifica si una geoda está lista para eclosionar
   * 
   * @param geodeId - ID de la geoda
   * @returns true si está lista, false si no
   */
  canHatch(geodeId: bigint): Promise<boolean>;
  
  /**
   * Calcula el costo total de una receta en tokens
   * 
   * @param recipeId - ID de la receta
   * @returns Mapa de direcciones de token → cantidad requerida
   */
  calculateCost(recipeId: number): Promise<Map<Address, bigint>>;
  
  /**
   * Verifica si el usuario tiene todos los materiales necesarios
   * 
   * @param user - Dirección del usuario
   * @param recipeId - ID de la receta
   * @returns true si tiene todos los materiales, false si no
   */
  hasMaterials(user: Address, recipeId: number): Promise<boolean>;
  
  /**
   * Obtiene el tiempo de incubación restante de una geoda
   * 
   * @param geodeId - ID de la geoda
   * @returns Segundos restantes, 0 si ya está lista
   */
  getIncubationTime(geodeId: bigint): Promise<number>;
}

/**
 * Interfaz para el RecipeRegistry (DEPRECATED - usar IRecipeRegistry de './IRecipeRegistry')
 * Mantenida solo para compatibilidad temporal
 */

/**
 * Interfaz para el SupplyTracker
 */
export interface ISupplyTracker extends IBlockchainContract {
  /**
   * Obtiene el supply actual de una receta
   */
  getCurrentSupply(recipeId: number): Promise<bigint>;
  
  /**
   * Obtiene el supply máximo de una receta
   */
  getMaxSupply(recipeId: number): Promise<bigint>;
  
  /**
   * Verifica si aún hay supply disponible
   */
  hasSupplyAvailable(recipeId: number): Promise<boolean>;
  
  /**
   * Incrementa el contador de supply (solo ForgeFactory)
   */
  incrementSupply(recipeId: number): Promise<TransactionResult>;
}
