/**
 * Mining Constants
 * 
 * Constantes específicas del módulo de minería:
 * - Emisiones y recompensas
 * - Sistema de alimentación (feeding)
 * - Configuraciones de ciclos
 * - Thresholds y límites
 */

import { parseUnits } from 'ethers';

// ==========================================
// Emisiones y Recompensas
// ==========================================

/**
 * Tasa base de emisión de CORE tokens por hora
 * 
 * **IMPORTANTE:** Este valor debe coincidir con la configuración
 * del contrato MiningPool en blockchain.
 * 
 * @constant {bigint} 100 CORE/hora
 */
export const BASE_EMISSION_RATE = parseUnits('100', 18);

/**
 * Tasa de emisión por hora en formato legible
 */
export const BASE_EMISSION_RATE_DISPLAY = '100 CORE/hora';

// ==========================================
// Sistema de Alimentación (Feeding)
// ==========================================

/**
 * Threshold de hambre para alertas
 * Si el nivel de hambre supera este valor (0-100), el minero necesita alimentación urgente
 * 
 * @constant {number} 70% - Nivel crítico de hambre
 */
export const HUNGER_THRESHOLD = 70;

/**
 * Configuración del sistema de alimentación para mineros voraces
 * 
 * **NOTA:** Estos son valores por defecto del contrato.
 * Los valores reales deben consultarse desde `getFeedingConfig()`.
 */
export const DEFAULT_FEEDING_CONFIG = {
  /**
   * Intervalo entre alimentaciones (segundos)
   * @default 86400 (24 horas)
   */
  feedingInterval: 24 * 60 * 60, // 24h
  
  /**
   * Período de gracia antes de penalización (segundos)
   * @default 43200 (12 horas)
   */
  hungerGracePeriod: 12 * 60 * 60, // 12h
  
  /**
   * Penalización de efficiency cuando está hambriento (%)
   * @default 10 (10% de reducción)
   */
  hungerPenalty: 10,
  
  /**
   * Bonus de power para mineros voraces bien alimentados (%)
   * @default 20 (20% de incremento)
   */
  voraciousBonus: 20,
} as const;

/**
 * Estados de hambre
 */
export const HUNGER_STATES = {
  SATISFIED: 'satisfied',     // 0-49: Satisfecho
  HUNGRY: 'hungry',           // 50-69: Tiene hambre
  VERY_HUNGRY: 'very_hungry', // 70-89: Muy hambriento
  STARVING: 'starving',       // 90-100: Muriendo de hambre
} as const;

export type HungerState = typeof HUNGER_STATES[keyof typeof HUNGER_STATES];

/**
 * Helper para obtener estado de hambre según nivel
 */
export function getHungerState(hungerLevel: number): HungerState {
  if (hungerLevel >= 90) return HUNGER_STATES.STARVING;
  if (hungerLevel >= 70) return HUNGER_STATES.VERY_HUNGRY;
  if (hungerLevel >= 50) return HUNGER_STATES.HUNGRY;
  return HUNGER_STATES.SATISFIED;
}

/**
 * Emojis por estado de hambre
 */
export const HUNGER_EMOJIS = {
  [HUNGER_STATES.SATISFIED]: '😊',
  [HUNGER_STATES.HUNGRY]: '😐',
  [HUNGER_STATES.VERY_HUNGRY]: '😰',
  [HUNGER_STATES.STARVING]: '💀',
} as const;

// ==========================================
// Configuración de Mineros Voraces
// ==========================================

/**
 * Configuración específica para mineros con trait Voracious
 */
export const VORACIOUS_CONFIG = {
  /**
   * Bonus de power cuando está bien alimentado
   */
  powerBonus: 25, // +25%
  
  /**
   * Período entre alimentaciones (días)
   */
  feedingPeriodDays: 7,
  
  /**
   * Axies requeridos por alimentación
   */
  axiesPerFeeding: 2,
  
  /**
   * Penalización de efficiency si no se alimenta
   */
  efficiencyPenalty: 50, // -50%
} as const;

// ==========================================
// Ciclos de Minería
// ==========================================

/**
 * Duración de ciclos en segundos
 */
export const CYCLE_DURATIONS = {
  SHORT: 7 * 24 * 60 * 60,      // 1 semana
  STANDARD: 14 * 24 * 60 * 60,  // 2 semanas
  COMMITTED: 30 * 24 * 60 * 60, // 1 mes
  STRATEGIC: 60 * 24 * 60 * 60, // 2 meses
  MASTER: 90 * 24 * 60 * 60,    // 3 meses
} as const;

/**
 * Bonus de commitment por ciclo (%)
 */
export const CYCLE_BONUSES = {
  SHORT: 0,       // Sin bonus
  STANDARD: 5,    // +5%
  COMMITTED: 10,  // +10%
  STRATEGIC: 15,  // +15%
  MASTER: 20,     // +20%
} as const;

// ==========================================
// Límites y Thresholds
// ==========================================

/**
 * Durabilidad mínima para minar sin penalización
 */
export const MIN_DURABILITY_THRESHOLD = 50; // 50%

/**
 * Efficiency mínima efectiva
 */
export const MIN_EFFICIENCY = 0;

/**
 * Efficiency máxima
 */
export const MAX_EFFICIENCY = 10000; // 100% en basis points

/**
 * Durabilidad máxima
 */
export const MAX_DURABILITY = 10000; // 100% en basis points

// ==========================================
// Constantes de Cálculo
// ==========================================

/**
 * Basis points (para conversiones de porcentaje)
 */
export const BASIS_POINTS = 10000; // 100% = 10000 BP

/**
 * Segundos por hora (para cálculos de recompensas)
 */
export const SECONDS_PER_HOUR = 3600;

/**
 * Horas por día
 */
export const HOURS_PER_DAY = 24;

/**
 * Días por semana
 */
export const DAYS_PER_WEEK = 7;
