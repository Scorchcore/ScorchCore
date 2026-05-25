/**
 * ICollectionContract
 * 
 * Interfaces para Collection/Set Bonuses
 * UserCollectionTracker y SetRegistry
 * 
 * @pattern Interface Segregation Principle
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Información de un Set de colección
 */
export interface CollectionSet {
  id: number;
  name: string;
  requiredCategories: number[];
  requiredTypes: number[];
  requiredCounts: number[];
  bonusPercentage: number;      // En basis points (150 = 1.50%)
  isActive: boolean;
  emoji?: string;                // Para UI
  description?: string;          // Para UI
}

/**
 * Progreso de un usuario hacia completar un set
 */
export interface SetProgress {
  setId: number;
  setName: string;
  bonusPercentage: number;
  isCompleted: boolean;
  progress: number;              // Porcentaje 0-100
  requirements: Array<{
    category: number;
    type: number;
    required: number;
    owned: number;
    categoryName: string;
    typeName: string;
  }>;
}

/**
 * Resumen de bonuses activos de un usuario
 */
export interface UserBonusSummary {
  totalBonus: number;            // Suma de todos los bonuses activos
  completedSets: number[];       // IDs de sets completados
  activeBonuses: Array<{
    setId: number;
    setName: string;
    bonus: number;
  }>;
  nextSetProgress?: SetProgress; // Set más cercano a completar
}

/**
 * Interface para UserCollectionTracker
 */
export interface ICollectionTracker extends IBlockchainContract {
  /**
   * Obtiene la cantidad de miners que tiene un usuario
   * @param user - Dirección del usuario
   * @param category - Categoría del miner (0-3)
   * @param minerType - Tipo del miner (0-8)
   */
  getMinerCount(user: Address, category: number, minerType: number): Promise<bigint>;
  
  /**
   * Verifica si un usuario tiene la cantidad requerida
   * @param user - Dirección del usuario
   * @param category - Categoría del miner
   * @param minerType - Tipo del miner
   * @param requiredCount - Cantidad requerida
   */
  hasMinerCount(
    user: Address,
    category: number,
    minerType: number,
    requiredCount: number
  ): Promise<boolean>;
  
  /**
   * Agrega un miner al tracking (solo TRACKER_ROLE)
   */
  addMiner(user: Address, category: number, minerType: number): Promise<TransactionResult>;
  
  /**
   * Remueve un miner del tracking (solo TRACKER_ROLE)
   */
  removeMiner(user: Address, category: number, minerType: number): Promise<TransactionResult>;
}

/**
 * Interface para SetRegistry
 */
export interface ISetRegistry extends IBlockchainContract {
  /**
   * Obtiene el total de sets definidos
   */
  totalSets(): Promise<bigint>;
  
  /**
   * Obtiene información de un set
   * @param setId - ID del set
   */
  getSetInfo(setId: number): Promise<{
    name: string;
    bonusPercentage: number;
    isActive: boolean;
    requiredTypesCount: number;
  }>;
  
  /**
   * Obtiene los requisitos de un set
   * @param setId - ID del set
   */
  getSetRequirements(setId: number): Promise<{
    categories: number[];
    types: number[];
    counts: number[];
  }>;
  
  /**
   * Verifica si un set está activo
   * @param setId - ID del set
   */
  isSetActive(setId: number): Promise<boolean>;
  
  /**
   * Crea un nuevo set (solo ADMIN)
   */
  createSet(
    name: string,
    categories: number[],
    types: number[],
    counts: number[],
    bonusPercentage: number
  ): Promise<TransactionResult>;
  
  /**
   * Actualiza el estado de un set (solo ADMIN)
   */
  updateSetStatus(setId: number, isActive: boolean): Promise<TransactionResult>;
  
  /**
   * Actualiza el bonus de un set (solo ADMIN)
   */
  updateSetBonus(setId: number, newBonus: number): Promise<TransactionResult>;
}

/**
 * Sets predefinidos en el contrato
 */
export const PREDEFINED_SETS = [
  {
    id: 0,
    name: 'Cazador Nocturno',
    emoji: '🌙',
    description: '1 Bestia + 1 Ave + 1 Dusk',
    bonusPercentage: 150, // 1.50%
  },
  {
    id: 1,
    name: 'Ecosistema Acuático',
    emoji: '🌊',
    description: '2 Aqua + 1 Planta',
    bonusPercentage: 200, // 2.00%
  },
  {
    id: 2,
    name: 'Maquinaria Avanzada',
    emoji: '⚙️',
    description: '2 Mech + 1 Ultramech',
    bonusPercentage: 150, // 1.50%
  },
] as const;
