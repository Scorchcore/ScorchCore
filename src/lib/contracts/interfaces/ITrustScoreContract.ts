/**
 * ITrustScoreContract - Interfaz para TrustScoreManager
 * 
 * @pattern Strategy Pattern - Diferentes niveles de acceso basados en score
 * @principle ISP - Interfaz específica para TrustScore
 * 
 * Sistema de puntuación de confianza:
 * - Rango: 0-1000 puntos
 * - Niveles: 0 (Basic), 1 (Intermediate), 2 (Advanced), 3 (Elite)
 * - Decay automático por inactividad
 * - Oracle actualiza scores basado en análisis off-chain
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Estructura de TrustScore del contrato
 */
export interface TrustScoreData {
  score: bigint;           // Score actual (0-1000)
  lastUpdate: bigint;      // Timestamp de última actualización
  accountAge: bigint;      // Edad de la cuenta en días
  totalActivity: bigint;   // Total de transacciones/interacciones
  flagged: boolean;        // Marcado como sospechoso
}

/**
 * Niveles de acceso basados en TrustScore
 */
export enum TrustScoreLevel {
  BASIC = 0,         // 0-200 puntos
  INTERMEDIATE = 1,  // 201-400 puntos
  ADVANCED = 2,      // 401-700 puntos
  ELITE = 3,         // 701-1000 puntos
}

/**
 * Umbrales de score para cada nivel
 */
export const TRUST_SCORE_THRESHOLDS = {
  LEVEL_0: 0,
  LEVEL_1: 201,
  LEVEL_2: 401,
  LEVEL_3: 701,
  MAX_SCORE: 1000,
} as const;

/**
 * Información de TrustScore para UI (completa con metadatos calculados)
 */
export interface TrustScoreUIInfo {
  user: Address;
  score: number;                // Score con decay aplicado
  rawScore: number;             // Score sin decay
  level: TrustScoreLevel;       // Nivel de acceso
  levelName: string;            // Nombre del nivel
  lastUpdate: number;           // Timestamp en segundos
  accountAge: number;           // Edad en días
  totalActivity: number;        // Total de actividad
  flagged: boolean;             // Si está marcado
  isStale: boolean;             // Si necesita actualización
  daysUntilDecay: number;       // Días hasta siguiente decay
  nextLevelScore: number | null; // Score necesario para siguiente nivel
  percentToNextLevel: number;   // Porcentaje hacia siguiente nivel
}

/**
 * Eventos del contrato TrustScoreManager
 */
export interface TrustScoreEvents {
  ScoreUpdated: {
    user: Address;
    newScore: bigint;
    accountAge: bigint;
    timestamp: bigint;
  };
  UserFlagged: {
    user: Address;
    reason: string;
  };
  UserUnflagged: {
    user: Address;
  };
}

/**
 * Interfaz del contrato TrustScoreManager
 * Basada en el contrato real desplegado
 */
export interface ITrustScoreContract extends IBlockchainContract<TrustScoreEvents> {
  /**
   * Obtiene el score actual de un usuario (con decay aplicado)
   * 
   * @param user - Dirección del usuario
   * @returns Score actual (0-1000)
   */
  getScore(user: Address): Promise<bigint>;

  /**
   * Verifica si un usuario tiene el score mínimo requerido
   * 
   * @param user - Dirección del usuario
   * @param minScore - Score mínimo requerido
   * @returns true si el usuario cumple el requisito
   */
  hasMinimumScore(user: Address, minScore: bigint): Promise<boolean>;

  /**
   * Obtiene el nivel de acceso de un usuario (0-3)
   * 
   * @param user - Dirección del usuario
   * @returns Nivel de acceso
   */
  getAccessLevel(user: Address): Promise<number>;

  /**
   * Obtiene los datos completos de TrustScore
   * 
   * @param user - Dirección del usuario
   * @returns Estructura TrustScoreData completa
   */
  getTrustScore(user: Address): Promise<TrustScoreData>;

  /**
   * Verifica si el score de un usuario está desactualizado
   * 
   * @param user - Dirección del usuario
   * @returns true si el score necesita actualización
   */
  isScoreStale(user: Address): Promise<boolean>;

  /**
   * Actualiza el score de un usuario (solo ORACLE_ROLE)
   * 
   * @param user - Dirección del usuario
   * @param score - Nuevo score (0-1000)
   * @param accountAge - Edad de la cuenta en días
   * @param totalActivity - Total de actividad
   * @returns Resultado de la transacción
   */
  updateScore(
    user: Address,
    score: bigint,
    accountAge: bigint,
    totalActivity: bigint
  ): Promise<TransactionResult>;

  /**
   * Marca un usuario como sospechoso (solo ORACLE_ROLE)
   * 
   * @param user - Dirección del usuario
   * @param reason - Razón del flag
   * @returns Resultado de la transacción
   */
  flagUser(user: Address, reason: string): Promise<TransactionResult>;

  /**
   * Quita el flag de un usuario (solo ADMIN)
   * 
   * @param user - Dirección del usuario
   * @returns Resultado de la transacción
   */
  unflagUser(user: Address): Promise<TransactionResult>;

  /**
   * Obtiene la tasa de decay (puntos perdidos por día)
   * 
   * @returns Tasa de decay
   */
  scoreDecayRate(): Promise<bigint>;

  /**
   * Obtiene la edad máxima antes de requerir actualización
   * 
   * @returns Edad máxima en segundos
   */
  maxScoreAge(): Promise<bigint>;

  /**
   * Obtiene el score máximo posible
   * 
   * @returns Score máximo (1000)
   */
  MAX_SCORE(): Promise<bigint>;
}

/**
 * Helper para obtener nombre del nivel
 */
export function getTrustScoreLevelName(level: TrustScoreLevel): string {
  switch (level) {
    case TrustScoreLevel.BASIC:
      return 'Basic';
    case TrustScoreLevel.INTERMEDIATE:
      return 'Intermediate';
    case TrustScoreLevel.ADVANCED:
      return 'Advanced';
    case TrustScoreLevel.ELITE:
      return 'Elite';
    default:
      return 'Unknown';
  }
}

/**
 * Helper para obtener color del nivel
 */
export function getTrustScoreLevelColor(level: TrustScoreLevel): string {
  switch (level) {
    case TrustScoreLevel.BASIC:
      return 'gray';
    case TrustScoreLevel.INTERMEDIATE:
      return 'blue';
    case TrustScoreLevel.ADVANCED:
      return 'purple';
    case TrustScoreLevel.ELITE:
      return 'gold';
    default:
      return 'gray';
  }
}
