/**
 * Interfaz para el contrato CycleManager
 * Gestiona ciclos de minería con lockup periods y bonos
 * 
 * @pattern Strategy Pattern (GoF)
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Duración del ciclo de minería
 */
export const CycleDuration = {
  SHORT: 0,        // 1 semana - 0% bonus
  STANDARD: 1,     // 2 semanas - 0% bonus
  COMMITTED: 2,    // 1 mes - 2% bonus
  STRATEGIC: 3,    // 2 meses - 3% bonus
  MASTER: 4,       // 3 meses - 5% bonus
} as const;

export type CycleDuration = typeof CycleDuration[keyof typeof CycleDuration];

/**
 * Información de un ciclo de minería
 */
export interface MiningCycle {
  user: Address;
  minerIds: bigint[];
  duration: CycleDuration;
  startTime: bigint;
  endTime: bigint;
  bonusPercentage: number; // Basis points (100 = 1%, 200 = 2%)
  isActive: boolean;
  claimed: boolean;
}

/**
 * Resumen de un ciclo para UI
 */
export interface CycleSummary {
  cycleId: bigint;
  minerCount: number;
  duration: CycleDuration;
  bonusPercentage: number;
  startTime: number;
  endTime: number;
  timeRemaining: number;
  isFinished: boolean;
  isActive: boolean;
  claimed: boolean;
}

/**
 * Eventos del contrato CycleManager
 */
export interface CycleEvents {
  CycleStarted: {
    user: Address;
    cycleId: bigint;
    duration: CycleDuration;
    minerCount: bigint;
    endTime: bigint;
  };
  CycleEnded: {
    user: Address;
    cycleId: bigint;
  };
  CycleClaimed: {
    user: Address;
    cycleId: bigint;
    rewards: bigint;
  };
}

/**
 * Interfaz del contrato CycleManager
 * 
 * @pattern Strategy Pattern - Permite diferentes estrategias de ciclo
 */
export interface ICycleContract extends IBlockchainContract<CycleEvents> {
  // ==========================================
  // Cycle Management
  // ==========================================
  
  /**
   * Inicia un nuevo ciclo de minería
   * 
   * @param minerIds - Array de IDs de miners a bloquear
   * @param duration - Duración del ciclo
   * @returns ID del ciclo creado
   */
  startCycle(
    minerIds: bigint[],
    duration: CycleDuration
  ): Promise<TransactionResult>;
  
  /**
   * Finaliza un ciclo y desbloquea los miners
   * 
   * @param cycleId - ID del ciclo a finalizar
   */
  endCycle(cycleId: bigint): Promise<TransactionResult>;
  
  /**
   * Obtiene información de un ciclo
   * 
   * @param cycleId - ID del ciclo
   * @returns Información del ciclo
   */
  getCycle(cycleId: bigint): Promise<MiningCycle>;
  
  /**
   * Obtiene los ciclos activos de un usuario
   * 
   * @param user - Dirección del usuario
   * @returns Array de IDs de ciclos activos
   */
  getUserActiveCycles(user: Address): Promise<bigint[]>;
  
  /**
   * Obtiene el bonus para una duración específica
   * 
   * @param duration - Duración del ciclo
   * @returns Bonus en basis points (200 = 2%)
   */
  getCycleBonus(duration: CycleDuration): Promise<number>;
  
  /**
   * Obtiene la duración en segundos
   * 
   * @param duration - Duración del ciclo
   * @returns Duración en segundos
   */
  getCycleDurationSeconds(duration: CycleDuration): Promise<bigint>;
  
  /**
   * Verifica si un ciclo ha terminado
   * 
   * @param cycleId - ID del ciclo
   * @returns true si el ciclo ha terminado
   */
  isCycleFinished(cycleId: bigint): Promise<boolean>;
  
  /**
   * Verifica si un miner está bloqueado en un ciclo
   * 
   * @param minerId - ID del miner
   * @returns true si está bloqueado
   */
  isMinerLocked(minerId: bigint): Promise<boolean>;
  
  /**
   * Marca un ciclo como reclamado (solo MiningPool)
   * 
   * @param cycleId - ID del ciclo
   */
  markCycleClaimed(cycleId: bigint): Promise<TransactionResult>;
  
  /**
   * Obtiene el total de ciclos creados
   * 
   * @returns Total de ciclos
   */
  getTotalCycles(): Promise<bigint>;
}
