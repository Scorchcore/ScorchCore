/**
 * Interfaz para contratos de Minería (MiningPool, MinerStatsManager, etc.)
 * Implementa Liskov Substitution Principle (LSP)
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Información de un minero
 */
export interface MinerInfo {
  tokenId: bigint;
  owner: Address;
  power: bigint;
  efficiency: bigint;
  durability: bigint;
  level: bigint;
  experience: bigint;
  isVoracious: boolean;
  lastFed: bigint;
  minerType: number;
  minerNameIndex: number;
  lastMined: bigint;
  forgeDate: bigint;
}

/**
 * Estadísticas de minería de un minero
 */
export interface MinerStats {
  tokenId: bigint;
  totalMined: bigint;
  totalRewards: bigint;
  cyclesCompleted: bigint;
  lastClaimTime: bigint;
  effectivePower: bigint;
  bonusMultiplier: bigint; // basis points (10000 = 100%)
}

/**
 * Información de un ciclo de minería
 */
export interface CycleInfo {
  cycleNumber: bigint;
  startTime: bigint;
  endTime: bigint;
  totalRewards: bigint;
  participantCount: bigint;
  isActive: boolean;
}

/**
 * Recompensas pendientes de un minero
 */
export interface PendingRewards {
  coreAmount: bigint;
  bonusAmount: bigint;
  totalAmount: bigint;
  lastUpdateTime: bigint;
}

/**
 * Eventos de minería
 */
export interface MiningEvents {
  MiningStarted: {
    user: Address;
    minerId: bigint;
    cycleNumber: bigint;
  };
  RewardsClaimed: {
    user: Address;
    minerId: bigint;
    amount: bigint;
    bonusAmount: bigint;
  };
  MinerFed: {
    minerId: bigint;
    timestamp: bigint;
  };
  CycleCompleted: {
    cycleNumber: bigint;
    totalRewards: bigint;
    participants: bigint;
  };
}

/**
 * Interfaz principal del contrato de Minería
 */
export interface IMiningContract extends IBlockchainContract<MiningEvents> {
  // ==========================================
  // Mining Operations
  // ==========================================
  
  /**
   * Inicia la minería con un CoreMiner NFT
   * 
   * @param minerId - ID del minero a usar
   * @returns Resultado de la transacción
   */
  startMining(minerId: bigint): Promise<TransactionResult>;
  
  /**
   * Detiene la minería de un minero
   * 
   * @param minerId - ID del minero
   * @returns Resultado de la transacción
   */
  stopMining(minerId: bigint): Promise<TransactionResult>;
  
  /**
   * Reclama las recompensas acumuladas
   * 
   * @param minerId - ID del minero
   * @returns Resultado de la transacción con cantidad reclamada
   */
  claimRewards(minerId: bigint): Promise<TransactionResult & { amount: bigint }>;
  
  /**
   * Obtiene las recompensas pendientes de un minero
   * 
   * @param minerId - ID del minero
   * @returns Recompensas pendientes
   */
  getPendingRewards(minerId: bigint): Promise<PendingRewards>;
  
  /**
   * Verifica si un minero está actualmente minando
   * 
   * @param minerId - ID del minero
   * @returns true si está minando, false si no
   */
  isMining(minerId: bigint): Promise<boolean>;
  
  /**
   * Obtiene información completa de un minero
   * 
   * @param minerId - ID del minero
   * @returns Información del minero
   */
  getMinerInfo(minerId: bigint): Promise<MinerInfo>;
  
  /**
   * Obtiene estadísticas de minería de un minero
   * 
   * @param minerId - ID del minero
   * @returns Estadísticas del minero
   */
  getMinerStats(minerId: bigint): Promise<MinerStats>;
  
  // ==========================================
  // Feeding System (from MinerStatsManager)
  // ==========================================
  
  /**
   * Alimenta un minero voraz
   * 
   * Actualiza lastFed y restaura efficiency si tenía hambre.
   * 
   * @param minerId - ID del minero
   * @returns Resultado de la transacción
   */
  feedMiner(minerId: bigint): Promise<TransactionResult>;
  
  /**
   * Verifica si un minero tiene hambre
   * 
   * @param minerId - ID del minero
   * @returns true si excedió el intervalo de alimentación
   */
  isHungry(minerId: bigint): Promise<boolean>;
  
  /**
   * Verifica si un minero está sufriendo hambre crítica (starvation)
   * 
   * @param minerId - ID del minero
   * @returns true si está en período de penalización
   */
  isStarving(minerId: bigint): Promise<boolean>;
  
  /**
   * Verifica si un minero necesita ser alimentado
   * 
   * @param minerId - ID del minero
   * @param feedInterval - Intervalo de alimentación en segundos
   * @returns true si necesita alimentación
   */
  needsFeeding(minerId: bigint, feedInterval: number): Promise<boolean>;
  
  /**
   * Obtiene el tiempo restante hasta que el minero tenga hambre
   * 
   * @param minerId - ID del minero
   * @returns Segundos restantes, 0 si ya tiene hambre
   */
  getTimeUntilHungry(minerId: bigint): Promise<number>;
  
  /**
   * Obtiene el tiempo restante hasta hambre crítica
   * 
   * @param minerId - ID del minero
   * @returns Segundos restantes hasta starvation
   */
  getTimeUntilStarving(minerId: bigint): Promise<number>;
  
  /**
   * Aplica penalización de hambre a un minero
   * 
   * @param minerId - ID del minero
   * @returns Resultado de la transacción
   */
  applyHungerPenalty(minerId: bigint): Promise<TransactionResult>;
  
  /**
   * Activa o desactiva el estado voraz de un minero
   * 
   * @param minerId - ID del minero
   * @param voracious - true para activar, false para desactivar
   * @returns Resultado de la transacción
   */
  setVoracious(minerId: bigint, voracious: boolean): Promise<TransactionResult>;
  
  /**
   * Obtiene la configuración de feeding
   * 
   * @returns Configuración actual del sistema de alimentación
   */
  getFeedingConfig(): Promise<{
    feedingInterval: number;
    hungerGracePeriod: number;
    hungerPenalty: number;
    voraciousBonus: number;
  }>;
  
  /**
   * Obtiene estadísticas de un minero
   */
  getStats(minerId: bigint): Promise<MinerStats>;
  
  /**
   * Actualiza las estadísticas después de minar
   */
  updateStats(minerId: bigint, rewardsClaimed: bigint): Promise<TransactionResult>;
  
  /**
   * Obtiene el poder efectivo de un minero (incluyendo bonos)
   */
  getEffectivePower(minerId: bigint): Promise<bigint>;
}

/**
 * Interfaz para el BonusCalculator
 */
export interface IBonusCalculator extends IBlockchainContract {
  /**
   * Calcula el multiplicador de bonus para un minero
   * 
   * @param minerId - ID del minero
   * @returns Multiplicador en basis points (10000 = 100%)
   */
  calculateBonus(minerId: bigint): Promise<bigint>;
  
  /**
   * Calcula bonus de colección para un usuario
   * 
   * @param user - Dirección del usuario
   * @returns Multiplicador de bonus de colección
   */
  calculateCollectionBonus(user: Address): Promise<bigint>;
}

/**
 * Interfaz para el RewardsCalculator
 */
export interface IRewardsCalculator extends IBlockchainContract {
  /**
   * Calcula recompensas para un minero
   * 
   * @param minerId - ID del minero
   * @param timeElapsed - Tiempo transcurrido en segundos
   * @returns Cantidad de CORE tokens a recibir
   */
  calculateRewards(minerId: bigint, timeElapsed: bigint): Promise<bigint>;
  
  /**
   * Calcula recompensas con bonos incluidos
   */
  calculateRewardsWithBonus(minerId: bigint, timeElapsed: bigint): Promise<bigint>;
}

/**
 * Interfaz para el CycleManager
 */
export interface ICycleManager extends IBlockchainContract {
  /**
   * Obtiene el ciclo actual
   */
  getCurrentCycle(): Promise<CycleInfo>;
  
  /**
   * Verifica si hay un ciclo activo
   */
  hasActiveCycle(): Promise<boolean>;
  
  /**
   * Inicia un nuevo ciclo de minería (solo admin)
   */
  startNewCycle(duration: bigint, rewards: bigint): Promise<TransactionResult>;
  
  /**
   * Finaliza el ciclo actual (solo admin)
   */
  endCurrentCycle(): Promise<TransactionResult>;
}
