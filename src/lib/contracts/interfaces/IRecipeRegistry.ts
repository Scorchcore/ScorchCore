/**
 * IRecipeRegistry Interface
 *
 * Interface para interactuar con el contrato RecipeRegistry
 * Gestiona configuración y administración de recetas de forja
 *
 * @pattern Interface Segregation Principle
 */

import type { Address } from "viem";
import type { IBlockchainContract } from "./IBlockchainContract";
import type { Recipe as BaseRecipe } from "./SharedTypes";

/**
 * Extensión de Recipe para UI de RecipeRegistry
 * Agrega campos específicos para visualización
 */
export interface RecipeInfo extends BaseRecipe {
  categoryName: string;
  typeName: string;
  remaining: bigint;
  progress: number;
}

/**
 * Resultado de operación de transacción
 */
export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Interface principal de RecipeRegistry
 */
export interface IRecipeRegistry extends IBlockchainContract {
  /**
   * Obtiene el rol de administrador por defecto
   */
  DEFAULT_ADMIN_ROLE(): Promise<string>;

  /**
   * Verifica si una dirección tiene el rol de admin
   * @param account - Dirección a verificar
   */
  hasAdminRole(account: Address): Promise<boolean>;

  /**
   * Establece el supply máximo de una receta (solo admin)
   * @param category - Categoría (0-2)
   * @param minerType - Tipo de miner (0-8)
   * @param minerIndex - Índice del miner (0-99)
   * @param maxSupply - Supply máximo
   */
  setRecipeMaxSupply(
    category: number,
    minerType: number,
    minerIndex: number,
    maxSupply: bigint,
  ): Promise<TransactionResult>;

  /**
   * Establece el supply máximo de múltiples recetas en batch (solo admin)
   * @param categories - Array de categorías
   * @param minerTypes - Array de tipos
   * @param minerIndexes - Array de índices
   * @param maxSupplies - Array de supplies
   */
  batchSetRecipeMaxSupply(
    categories: number[],
    minerTypes: number[],
    minerIndexes: number[],
    maxSupplies: bigint[],
  ): Promise<TransactionResult>;

  /**
   * Obtiene el supply máximo de una receta
   * @param category - Categoría
   * @param minerType - Tipo de miner
   * @param minerIndex - Índice del miner
   */
  getRecipeMaxSupply(
    category: number,
    minerType: number,
    minerIndex: number,
  ): Promise<bigint>;

  /**
   * Verifica si una receta está activa
   * @param category - Categoría
   * @param minerType - Tipo de miner
   * @param minerIndex - Índice del miner
   */
  isRecipeActive(
    category: number,
    minerType: number,
    minerIndex: number,
  ): Promise<boolean>;

  /**
   * Establece el estado activo/inactivo de una receta (solo admin)
   * @param category - Categoría
   * @param minerType - Tipo de miner
   * @param minerIndex - Índice del miner
   * @param isActive - true para activar, false para desactivar
   */
  setRecipeStatus(
    category: number,
    minerType: number,
    minerIndex: number,
    isActive: boolean,
  ): Promise<TransactionResult>;

  /**
   * Obtiene el admin role hash para verificaciones
   */
  getRoleAdmin(role: string): Promise<string>;

  /**
   * Otorga un rol a una cuenta (solo admin)
   * @param role - Rol a otorgar
   * @param account - Dirección que recibirá el rol
   */
  grantRole(role: string, account: Address): Promise<TransactionResult>;

  /**
   * Revoca un rol de una cuenta (solo admin)
   * @param role - Rol a revocar
   * @param account - Dirección que perderá el rol
   */
  revokeRole(role: string, account: Address): Promise<TransactionResult>;

  /**
   * Verifica si una cuenta tiene un rol específico
   * @param role - Rol a verificar
   * @param account - Dirección a verificar
   */
  hasRole(role: string, account: Address): Promise<boolean>;
}

/**
 * Constantes de categorías
 */
export enum RecipeCategory {
  COMMON = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
}

/**
 * Constantes de tipos de miner
 */
export enum MinerType {
  BEAST = 0,
  AQUA = 1,
  BIRD = 2,
  REPTILE = 3,
  BUG = 4,
  PLANT = 5,
  MECH = 6,
  DUSK = 7,
  DAWN = 8,
}

/**
 * Nombres de categorías para UI
 */
export const CATEGORY_NAMES: Record<RecipeCategory, string> = {
  [RecipeCategory.COMMON]: "Common",
  [RecipeCategory.RARE]: "Rare",
  [RecipeCategory.EPIC]: "Epic",
  [RecipeCategory.LEGENDARY]: "Legendary",
};

/**
 * Nombres de tipos para UI
 */
export const MINER_TYPE_NAMES: Record<MinerType, string> = {
  [MinerType.BEAST]: "Beast",
  [MinerType.AQUA]: "Aqua",
  [MinerType.BIRD]: "Bird",
  [MinerType.REPTILE]: "Reptile",
  [MinerType.BUG]: "Bug",
  [MinerType.PLANT]: "Plant",
  [MinerType.MECH]: "Mech",
  [MinerType.DUSK]: "Dusk",
  [MinerType.DAWN]: "Dawn",
};

/**
 * Emojis para tipos de miner
 */
export const MINER_TYPE_EMOJIS: Record<MinerType, string> = {
  [MinerType.BEAST]: "🐉",
  [MinerType.AQUA]: "🐟",
  [MinerType.BIRD]: "🦅",
  [MinerType.REPTILE]: "🦎",
  [MinerType.BUG]: "🦋",
  [MinerType.PLANT]: "🌿",
  [MinerType.MECH]: "🤖",
  [MinerType.DUSK]: "🌆",
  [MinerType.DAWN]: "🌅",
};

/**
 * Colores para categorías
 */
export const CATEGORY_COLORS: Record<RecipeCategory, string> = {
  [RecipeCategory.COMMON]: "gray",
  [RecipeCategory.RARE]: "blue",
  [RecipeCategory.EPIC]: "purple",
  [RecipeCategory.LEGENDARY]: "gold",
};
