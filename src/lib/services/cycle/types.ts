/**
 * Tipos compartidos para el módulo Cycle
 * 
 * Interfaces para gestión de ciclos de minería con lockup y bonos
 */

import type { Address } from 'viem';
import type { CycleDuration, CycleSummary } from '@/lib/contracts/interfaces/ICycleContract';

/**
 * Nombres legibles de duraciones
 */
export const CYCLE_DURATION_NAMES: Record<CycleDuration, string> = {
  0: 'Corto (1 semana)',
  1: 'Estándar (2 semanas)',
  2: 'Comprometido (1 mes)',
  3: 'Estratégico (2 meses)',
  4: 'Máster (3 meses)',
};

/**
 * Información de un ciclo activo (extiende CycleSummary del contrato)
 */
export interface ActiveCycle extends CycleSummary {
  minerIds: bigint[];
  durationName: string;
  canClaim: boolean;
}

/**
 * Opciones para crear un ciclo
 */
export interface StartCycleOptions {
  minerIds: bigint[];
  duration: CycleDuration;
}

/**
 * Resultado de iniciar un ciclo
 */
export interface StartCycleResult {
  cycleId: bigint;
  transactionHash: string;
  success: boolean;
}

/**
 * Resultado de finalizar un ciclo
 */
export interface EndCycleResult {
  transactionHash: string;
  success: boolean;
}

/**
 * Información de bonus por duración
 */
export interface CycleBonusInfo {
  duration: CycleDuration;
  durationName: string;
  durationSeconds: number;
  durationDays: number;
  bonusPercentage: number;
  bonusDisplay: string;
}

/**
 * Estado de un miner en relación a ciclos
 */
export interface MinerCycleStatus {
  minerId: bigint;
  isLocked: boolean;
  lockedInCycleId?: bigint;
  canStartCycle: boolean;
}

/**
 * Resumen de ciclos del usuario
 */
export interface UserCyclesSummary {
  activeCycles: ActiveCycle[];
  totalMinersLocked: number;
  averageBonus: number;
  nextCycleToEnd?: ActiveCycle;
}
