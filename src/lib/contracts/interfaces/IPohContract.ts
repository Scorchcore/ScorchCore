/**
 * Interfaz para el contrato ProofOfHumanityOracle
 * Sistema de verificación anti-bot
 * 
 * @pattern Strategy Pattern (GoF)
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Nivel de verificación PoH
 */
export enum VerificationLevel {
  NONE = 0,
  BASIC = 1,
  STANDARD = 2,
  ADVANCED = 3,
}

/**
 * Datos de verificación de un usuario
 */
export interface VerificationData {
  verified: boolean;
  level: VerificationLevel;
  timestamp: bigint;
  expiresAt: bigint;
}

/**
 * Eventos del contrato ProofOfHumanityOracle
 */
export interface PohOracleEvents {
  HumanityVerified: {
    wallet: Address;
    verificationLevel: number;
    timestamp: bigint;
  };
  HumanityRevoked: {
    wallet: Address;
    reason: string;
  };
}

/**
 * Interfaz del contrato ProofOfHumanityOracle
 * Gestiona verificaciones de humanidad para prevenir bots
 */
export interface IPohContract extends IBlockchainContract {
  /**
   * Verifica si una wallet está verificada como humano
   */
  isHuman(wallet: Address): Promise<boolean>;

  /**
   * Obtiene el nivel de verificación de una wallet
   */
  getVerificationLevel(wallet: Address): Promise<number>;

  /**
   * Obtiene el timestamp de verificación
   */
  getVerificationTime(wallet: Address): Promise<bigint>;

  /**
   * Obtiene todos los datos de verificación de una wallet
   */
  getVerificationData(wallet: Address): Promise<VerificationData>;

  /**
   * Verifica una wallet como humana (solo VERIFIER_ROLE)
   */
  verifyHuman(wallet: Address, level: number): Promise<TransactionResult>;

  /**
   * Revoca la verificación de una wallet (solo admin)
   */
  revokeVerification(wallet: Address, reason: string): Promise<TransactionResult>;

  /**
   * Obtiene la duración de la verificación en segundos (propiedad pública)
   */
  verificationDuration(): Promise<bigint>;

  /**
   * Total de wallets verificadas
   */
  totalVerified(): Promise<bigint>;

  /**
   * Obtiene el VERIFIER_ROLE hash
   */
  VERIFIER_ROLE(): Promise<string>;

  /**
   * Verifica si el contrato está pausado
   */
  paused(): Promise<boolean>;
}
