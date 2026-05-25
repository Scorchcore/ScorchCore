/**
 * Interfaz para MinerStatsManager
 * Gestiona estadísticas dinámicas de los mineros
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Estadísticas dinámicas de un minero
 */
export interface DynamicStats {
  durability: number;
  efficiency: number;
  experience: number;
  level: number;
  lastMined: number;
  lastRepaired: number;
  isVoracious: boolean;
  lastFed: number;
}

/**
 * Configuración del sistema de alimentación
 */
export interface FeedingConfig {
  feedingInterval: number;      // Segundos entre alimentaciones
  hungerGracePeriod: number;    // Período de gracia antes de penalización
  hungerPenalty: number;        // Penalización de efficiency (%)
  voraciousBonus: number;       // Bonus de power cuando está voraz (%)
}

/**
 * Eventos de MinerStatsManager
 */
export interface MinerStatsEvents {
  StatsInitialized: {
    tokenId: bigint;
  };
  DurabilityChanged: {
    tokenId: bigint;
    oldDurability: number;
    newDurability: number;
  };
  EfficiencyChanged: {
    tokenId: bigint;
    oldEfficiency: number;
    newEfficiency: number;
  };
  ExperienceGained: {
    tokenId: bigint;
    amount: number;
    newLevel: number;
  };
  MinerRepaired: {
    tokenId: bigint;
    newDurability: number;
  };
  MinerFed: {
    tokenId: bigint;
    timestamp: number;
  };
  VoraciousToggled: {
    tokenId: bigint;
    isVoracious: boolean;
  };
  HungerPenaltyApplied: {
    tokenId: bigint;
    efficiencyLoss: number;
  };
  FeedingConfigUpdated: {
    feedingInterval: number;
    gracePeriod: number;
    penalty: number;
    bonus: number;
  };
}

/**
 * Interfaz principal para MinerStatsManager
 */
export interface IMinerStatsManager extends IBlockchainContract<MinerStatsEvents> {
  /**
   * Inicializa las estadísticas de un minero
   */
  initializeStats(tokenId: bigint): Promise<TransactionResult>;
  
  /**
   * Obtiene todas las stats de un minero
   */
  getStats(tokenId: bigint): Promise<DynamicStats>;
  
  /**
   * Obtiene solo durability y efficiency
   */
  getCondition(tokenId: bigint): Promise<{ durability: number; efficiency: number }>;
  
  /**
   * Repara un minero
   */
  repairMiner(tokenId: bigint, amount: number): Promise<TransactionResult>;
  
  /**
   * Gana experiencia
   */
  gainExperience(tokenId: bigint, amount: number): Promise<TransactionResult>;
  
  /**
   * Actualiza durability y efficiency después de minar
   */
  updateAfterMining(tokenId: bigint, miningDuration: number): Promise<TransactionResult>;
  
  /**
   * Alimenta un minero
   */
  feedMiner(tokenId: bigint): Promise<TransactionResult>;
  
  /**
   * Activa/desactiva estado voraz
   */
  setVoracious(tokenId: bigint, voracious: boolean): Promise<TransactionResult>;
  
  /**
   * Actualiza timestamp de última minería
   */
  updateLastMined(tokenId: bigint): Promise<TransactionResult>;
  
  /**
   * Verifica si necesita reparación
   */
  needsRepair(tokenId: bigint, threshold: number): Promise<boolean>;
  
  /**
   * Verifica si necesita alimentación
   */
  needsFeeding(tokenId: bigint, feedInterval: number): Promise<boolean>;
  
  /**
   * Verifica si tiene hambre
   */
  isHungry(tokenId: bigint): Promise<boolean>;
  
  /**
   * Verifica si está en hambre crítica
   */
  isStarving(tokenId: bigint): Promise<boolean>;
  
  /**
   * Aplica penalización de hambre
   */
  applyHungerPenalty(tokenId: bigint): Promise<TransactionResult>;
  
  /**
   * Calcula el multiplicador efectivo considerando stats y hunger
   */
  getEffectiveMultiplier(tokenId: bigint, basePower: bigint): Promise<bigint>;
  
  /**
   * Obtiene tiempo hasta hambre
   */
  getTimeUntilHungry(tokenId: bigint): Promise<number>;
  
  /**
   * Obtiene tiempo hasta hambre crítica
   */
  getTimeUntilStarving(tokenId: bigint): Promise<number>;
  
  /**
   * Configura parámetros de alimentación
   */
  setFeedingConfig(config: FeedingConfig): Promise<TransactionResult>;
  
  /**
   * Obtiene configuración actual
   */
  getFeedingConfig(): Promise<FeedingConfig>;
}
