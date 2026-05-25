/**
 * Interface para CoreMinerStakingManager
 * Staking flexible de CoreMiners sin lock obligatorio
 */

import type { TransactionResponse } from "ethers";
import type { Address } from "viem";
import type { IBlockchainContract } from "./IBlockchainContract";

export interface ICoreMinerStakingManager extends IBlockchainContract {
  // ============================================
  // Staking Functions
  // ============================================

  /**
   * Stakea un CoreMiner NFT
   * @param minerId - ID del CoreMiner
   */
  stake(minerId: bigint): Promise<TransactionResponse>;

  /**
   * Unstakea un CoreMiner NFT
   * @param minerId - ID del CoreMiner
   */
  unstake(minerId: bigint): Promise<TransactionResponse>;

  /**
   * Unstakea múltiples CoreMiners
   * @param minerIds - Array de IDs de CoreMiners
   */
  batchUnstake(minerIds: bigint[]): Promise<TransactionResponse>;

  // ============================================
  // View Functions
  // ============================================

  /**
   * Obtiene el poder total de staking de un usuario
   * @param user - Address del usuario
   * @returns Poder total (suma de todos los miners stakeados)
   */
  getUserStakingPower(user: Address): Promise<bigint>;

  /**
   * Obtiene todos los CoreMiners stakeados por un usuario
   * @param user - Address del usuario
   * @returns Array de IDs de CoreMiners
   */
  getStakedMiners(user: Address): Promise<bigint[]>;

  /**
   * Verifica si un CoreMiner específico está stakeado
   * @param minerId - ID del CoreMiner
   */
  isStaked(minerId: bigint): Promise<boolean>;

  /**
   * Obtiene información de staking de un CoreMiner
   * @param minerId - ID del CoreMiner
   * @returns Struct con owner, timestamp, power
   */
  getStakeInfo(minerId: bigint): Promise<{
    owner: Address;
    stakedAt: bigint;
    power: bigint;
  }>;

  /**
   * Obtiene el poder de mining de un CoreMiner
   * @param minerId - ID del CoreMiner
   */
  getMinerPower(minerId: bigint): Promise<bigint>;

  /**
   * Verifica si un CoreMiner puede ser unstakeado
   * @param minerId - ID del CoreMiner
   */
  canUnstake(minerId: bigint): Promise<boolean>;

  // ============================================
  // Admin Functions
  // ============================================

  /**
   * Pausa/despausa el contrato
   */
  pause(): Promise<TransactionResponse>;
  unpause(): Promise<TransactionResponse>;
}

export default ICoreMinerStakingManager;
