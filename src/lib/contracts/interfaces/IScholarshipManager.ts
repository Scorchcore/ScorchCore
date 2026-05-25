/**
 * Interface para ScholarshipManager
 * Sistema de préstamo de CoreMiners (Becas 2.0) con reward splitting
 */

import type { TransactionResponse } from "ethers";
import type { Address } from "viem";
import type { IBlockchainContract } from "./IBlockchainContract";

export interface ScholarshipOffer {
  owner: Address;
  scholar: Address;
  minerId: bigint;
  ownerShare: number; // Base 10000 (ej: 7000 = 70%)
  scholarShare: number; // Base 10000 (ej: 3000 = 30%)
  duration: bigint; // Duración en segundos
  startTime: bigint;
  active: boolean;
}

export interface IScholarshipManager extends IBlockchainContract {
  // ============================================
  // Scholarship Functions
  // ============================================

  /**
   * Crea una oferta de scholarship (owner presta su CoreMiner)
   * @param minerId - ID del CoreMiner
   * @param scholar - Address del scholar (0x0 para oferta pública)
   * @param ownerShare - % para owner (base 10000)
   * @param scholarShare - % para scholar (base 10000)
   * @param duration - Duración en segundos
   */
  createOffer(
    minerId: bigint,
    scholar: Address,
    ownerShare: number,
    scholarShare: number,
    duration: bigint,
  ): Promise<TransactionResponse>;

  /**
   * Scholar acepta una oferta pública
   * @param minerId - ID del CoreMiner en oferta
   */
  acceptOffer(minerId: bigint): Promise<TransactionResponse>;

  /**
   * Cancela una oferta (solo owner)
   * @param minerId - ID del CoreMiner
   */
  cancelOffer(minerId: bigint): Promise<TransactionResponse>;

  /**
   * Finaliza un préstamo activo (owner o scholar)
   * @param minerId - ID del CoreMiner
   */
  endLoan(minerId: bigint): Promise<TransactionResponse>;

  /**
   * Split de rewards automático (llamado por MiningPool)
   * @param minerId - ID del CoreMiner
   * @param totalRewards - Total de rewards a dividir
   */
  splitRewards(
    minerId: bigint,
    totalRewards: bigint,
  ): Promise<TransactionResponse>;

  // ============================================
  // View Functions
  // ============================================

  /**
   * Verifica si un CoreMiner está en préstamo activo
   * @param minerId - ID del CoreMiner
   */
  isInLoan(minerId: bigint): Promise<boolean>;

  /**
   * Obtiene información de una oferta/préstamo
   * @param minerId - ID del CoreMiner
   */
  getScholarship(minerId: bigint): Promise<ScholarshipOffer>;

  /**
   * Obtiene todos los CoreMiners que un usuario tiene en scholarship (como owner)
   * @param owner - Address del owner
   */
  getOwnedScholarships(owner: Address): Promise<bigint[]>;

  /**
   * Obtiene todos los CoreMiners que un usuario usa como scholar
   * @param scholar - Address del scholar
   */
  getScholarLoans(scholar: Address): Promise<bigint[]>;

  /**
   * Obtiene ofertas públicas disponibles
   */
  getPublicOffers(): Promise<bigint[]>;

  /**
   * Calcula cuánto corresponde a owner y scholar
   * @param minerId - ID del CoreMiner
   * @param totalRewards - Total de rewards
   */
  calculateSplit(
    minerId: bigint,
    totalRewards: bigint,
  ): Promise<{
    ownerAmount: bigint;
    scholarAmount: bigint;
  }>;

  /**
   * Verifica si un préstamo ha expirado
   * @param minerId - ID del CoreMiner
   */
  isExpired(minerId: bigint): Promise<boolean>;

  // ============================================
  // Admin Functions
  // ============================================

  /**
   * Establece shares mínimos/máximos permitidos
   * @param minOwnerShare - Mínimo % para owner
   * @param maxScholarShare - Máximo % para scholar
   */
  setShareLimits(
    minOwnerShare: number,
    maxScholarShare: number,
  ): Promise<TransactionResponse>;

  /**
   * Pausa/despausa el contrato
   */
  pause(): Promise<TransactionResponse>;
  unpause(): Promise<TransactionResponse>;
}

export default IScholarshipManager;
