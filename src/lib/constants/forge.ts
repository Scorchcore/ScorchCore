/**
 * Forge Constants
 * 
 * Constantes específicas del módulo de forja:
 * - Costos de forja por tipo de geoda
 * - Probabilidades de éxito/crítico/fallo
 * - Sistema de mementos
 * - Costos de reparación
 * - Max supplies por categoría
 */

/**
 * Tipos de Geoda (sincronizado con contrato)
 */
export enum GeodeType {
  PETIT = 0,
  ALTO = 1,
  ANIMAL = 2,
  ULTRAMECH = 3,
  TANQUE = 4,
}

/**
 * Costos de forja por tipo de geoda
 */
export interface ForgeCosts {
  axs: string;
  slp: string;
  memento: string;
}

/**
 * Costos de forja definidos por tipo de geoda
 * 
 * **IMPORTANTE:** Estos valores deben coincidir con el contrato ForgeFactory.
 * Si cambian en el contrato, actualizar aquí.
 */
export const GEODE_COSTS: Record<GeodeType, ForgeCosts> = {
  [GeodeType.PETIT]: {
    axs: '0.1',
    slp: '5000',
    memento: '5',
  },
  [GeodeType.ALTO]: {
    axs: '0.5',
    slp: '10000',
    memento: '10',
  },
  [GeodeType.ANIMAL]: {
    axs: '2.5',
    slp: '25000',
    memento: '25',
  },
  [GeodeType.ULTRAMECH]: {
    axs: '5',
    slp: '50000',
    memento: '50',
  },
  [GeodeType.TANQUE]: {
    axs: '10',
    slp: '100000',
    memento: '100',
  },
} as const;

// ==========================================
// Sistema de Mementos
// ==========================================

/**
 * Cantidad de mementos necesarios por cada 1% de reducción de probabilidad de fallo
 * 
 * @example
 * Para reducir 5% de probabilidad de fallo: 5 * 10 = 50 mementos
 */
export const MEMENTOS_PER_PERCENT = 10;

/**
 * Máximo % de reducción de fallo con mementos
 */
export const MAX_MEMENTO_REDUCTION_PERCENT = 10; // 10% máximo

// ==========================================
// Probabilidades de Forja
// ==========================================

/**
 * Probabilidades de resultado por tipo de geoda
 * 
 * - NORMAL: Probabilidad base de éxito
 * - CRITICAL: Probabilidad de resultado crítico (mayor power/efficiency)
 * - FAILURE: Probabilidad de fallo (se pierde la geoda)
 */
export const FORGE_PROBABILITIES = {
  PETIT: {
    NORMAL: 0.25,      // 25%
    FAILURE: 0.10,     // 10%
  },
  ALTO: {
    NORMAL: 0.20,      // 20%
    FAILURE: 0.20,     // 20%
  },
  ANIMAL: {
    NORMAL: 0.20,      // 20%
    CRITICAL: 0.001,   // 0.1%
  },
  ULTRAMECH: {
    NORMAL: 0.20,      // 20%
    CRITICAL: 0.005,   // 0.5%
  },
  TANQUE: {
    NORMAL: 0.20,      // 20%
    CRITICAL: 0.007,   // 0.7%
  },
  EPIC: {
    NORMAL: 0.01,      // 1%
    CRITICAL: 0.01,    // 1%
  },
} as const;

// ==========================================
// Sistema de Críticos
// ==========================================

/**
 * Probabilidad base de resultado crítico
 * 
 * @constant {number} 1% (base 1000)
 */
export const CRITICAL_CHANCE = 10; // 1% en base 1000

/**
 * Multiplicador de power en resultado crítico
 * 
 * @constant {number} 150% del power base
 */
export const CRITICAL_POWER_MULTIPLIER = 150;

/**
 * Bonus de efficiency en resultado crítico
 * 
 * @constant {number} +20% de efficiency adicional
 */
export const CRITICAL_EFFICIENCY_BONUS = 20;

// ==========================================
// Costos de Reparación
// ==========================================

/**
 * Costos de reparación como % de producción mensual
 * 
 * Mientras mayor la categoría, menor el costo de reparación.
 */
export const REPAIR_COSTS = {
  PETIT: 0.06,          // 6%
  ALTO: 0.05,           // 5%
  ANIMAL: 0.05,         // 5%
  ULTRAMECH: 0.05,      // 5%
  TANQUE: 0.04,         // 4%
  EPIC: 0.04,           // 4%
  LEGENDARY: 0.03,      // 3%
} as const;

// ==========================================
// Max Supplies
// ==========================================

/**
 * Supply máximo por categoría de CoreMiner
 * 
 * Datos del protocolo oficial (GENERAL DATA SCORCHCORE PROTOCOL.csv)
 */
export const MAX_SUPPLY = {
  PETIT: 90000,        // 10,000 × 9 tipos
  ALTO: 67500,         // 7,500 × 9 tipos  
  ANIMAL: 45000,       // 5,000 × 9 tipos
  ULTRAMECH: 45000,    // 5,000 × 9 tipos
  TANQUE: 45000,       // 5,000 × 9 tipos
  TOTAL: 292500,       // Total de CoreMiners
} as const;

// ==========================================
// Nombres y Labels
// ==========================================

/**
 * Nombres de etapas de Geodas (del CSV)
 */
export const GEODE_STAGE_NAMES = {
  PETIT: 'Petit',
  ALTO: 'Alto',
  ANIMAL: 'Animal',
  ULTRAMECH: 'Ultramech',
  TANQUE: 'Tanque',
} as const;

/**
 * Nombres de rareza
 */
export const RARITY_NAMES = {
  COMMON: 'Común',
  UNCOMMON: 'Poco Común',
  RARE: 'Raro',
  VERY_RARE: 'Ultra Raro',
  EPIC: 'Épico',
  LEGENDARY: 'Legendario',
} as const;

// ==========================================
// Tipos Helper
// ==========================================

export type GeodeStage = keyof typeof GEODE_STAGE_NAMES;
export type RarityLevel = keyof typeof RARITY_NAMES;

/**
 * Helper para obtener el costo de forja por tipo
 */
export function getForgeCost(geodeType: GeodeType): ForgeCosts {
  return GEODE_COSTS[geodeType];
}

/**
 * Helper para calcular mementos necesarios para reducir % de fallo
 */
export function calculateMementosForReduction(percentReduction: number): number {
  const clamped = Math.min(percentReduction, MAX_MEMENTO_REDUCTION_PERCENT);
  return clamped * MEMENTOS_PER_PERCENT;
}

/**
 * Helper para obtener probabilidades de forja por tipo
 */
export function getForgeProbabilities(geodeType: GeodeType) {
  const key = GeodeType[geodeType] as keyof typeof FORGE_PROBABILITIES;
  return FORGE_PROBABILITIES[key];
}
