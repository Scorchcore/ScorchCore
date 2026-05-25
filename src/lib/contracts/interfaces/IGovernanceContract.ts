/**
 * Interfaces para contratos de gobernanza y anti-bot
 * ProofOfHumanityOracle, TrustScoreManager
 * Implementa Liskov Substitution Principle (LSP)
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Nivel de verificación de humanidad
 */
export enum VerificationLevel {
  NONE = 0,
  BASIC = 1,
  VERIFIED = 2,
  ADVANCED = 3,
}

/**
 * Estado de verificación de humanidad
 */
export interface HumanityStatus {
  user: Address;
  level: VerificationLevel;
  verifiedAt: bigint;
  expiresAt: bigint;
  isValid: boolean;
  verifier: Address;
}

/**
 * Eventos de verificación
 */
export interface GovernanceEvents {
  HumanityVerified: {
    user: Address;
    level: VerificationLevel;
    expiresAt: bigint;
  };
  VerificationRevoked: {
    user: Address;
    reason: string;
  };
  TrustScoreUpdated: {
    user: Address;
    oldScore: bigint;
    newScore: bigint;
  };
}

/**
 * Interfaz para el contrato ProofOfHumanityOracle
 */
export interface IProofOfHumanityOracle extends IBlockchainContract<GovernanceEvents> {
  /**
   * Verifica si un usuario está verificado como humano
   */
  isVerified(user: Address): Promise<boolean>;
  
  /**
   * Obtiene el nivel de verificación de un usuario
   */
  getVerificationLevel(user: Address): Promise<VerificationLevel>;
  
  /**
   * Obtiene el estado completo de verificación
   */
  getHumanityStatus(user: Address): Promise<HumanityStatus>;
  
  /**
   * Verifica un usuario como humano (solo verifier)
   */
  verify(
    user: Address,
    level: VerificationLevel,
    duration: bigint
  ): Promise<TransactionResult>;
  
  /**
   * Revoca la verificación de un usuario (solo verifier)
   */
  revoke(user: Address, reason: string): Promise<TransactionResult>;
  
  /**
   * Renueva la verificación antes de que expire
   */
  renew(user: Address, duration: bigint): Promise<TransactionResult>;
  
  /**
   * Verifica si una dirección es un verifier autorizado
   */
  isVerifier(account: Address): Promise<boolean>;
}

/**
 * Información de TrustScore
 */
export interface TrustScoreInfo {
  user: Address;
  score: bigint; // 0-10000 (basis points)
  level: number; // 0-5
  positiveActions: bigint;
  negativeActions: bigint;
  lastUpdate: bigint;
  decayRate: bigint;
}

/**
 * Acción que afecta el TrustScore
 */
export interface TrustScoreAction {
  actionType: string;
  impact: bigint; // puede ser positivo o negativo
  timestamp: bigint;
  description: string;
}

/**
 * Interfaz para el contrato TrustScoreManager
 */
export interface ITrustScoreManager extends IBlockchainContract<GovernanceEvents> {
  /**
   * Obtiene el TrustScore de un usuario
   */
  getTrustScore(user: Address): Promise<bigint>;
  
  /**
   * Obtiene información completa del TrustScore
   */
  getTrustScoreInfo(user: Address): Promise<TrustScoreInfo>;
  
  /**
   * Obtiene el nivel de confianza (0-5)
   */
  getTrustLevel(user: Address): Promise<number>;
  
  /**
   * Registra una acción positiva (solo contratos autorizados)
   */
  recordPositiveAction(
    user: Address,
    actionType: string,
    impact: bigint
  ): Promise<TransactionResult>;
  
  /**
   * Registra una acción negativa (solo contratos autorizados)
   */
  recordNegativeAction(
    user: Address,
    actionType: string,
    impact: bigint
  ): Promise<TransactionResult>;
  
  /**
   * Aplica decay al score (reduce con el tiempo)
   */
  applyDecay(user: Address): Promise<TransactionResult>;
  
  /**
   * Obtiene el historial de acciones de un usuario
   */
  getActionHistory(user: Address, limit: number): Promise<TrustScoreAction[]>;
  
  /**
   * Verifica si un usuario tiene un TrustScore mínimo
   */
  hasSufficientTrust(user: Address, minimumScore: bigint): Promise<boolean>;
  
  /**
   * Obtiene el multiplicador de recompensas basado en TrustScore
   */
  getRewardMultiplier(user: Address): Promise<bigint>; // basis points
  
  /**
   * Obtiene el descuento en fees basado en TrustScore
   */
  getFeeDiscount(user: Address): Promise<bigint>; // basis points
}

/**
 * Configuración del sistema de confianza
 */
export interface TrustSystemConfig {
  minScoreForForging: bigint;
  minScoreForMining: bigint;
  decayEnabled: boolean;
  decayRate: bigint;
  maxScore: bigint;
  initialScore: bigint;
}

/**
 * Interfaz extendida para configuración del sistema
 */
export interface ITrustScoreManagerConfig extends ITrustScoreManager {
  /**
   * Obtiene la configuración del sistema
   */
  getConfig(): Promise<TrustSystemConfig>;
  
  /**
   * Actualiza la configuración (solo admin)
   */
  updateConfig(config: Partial<TrustSystemConfig>): Promise<TransactionResult>;
  
  /**
   * Habilita o deshabilita el sistema de decay
   */
  toggleDecay(enabled: boolean): Promise<TransactionResult>;
}
