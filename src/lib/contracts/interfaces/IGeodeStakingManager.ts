/**
 * Interface para GeodeStakingManager
 * Staking de Geodas NFT con poder específico por categoría
 */

import type { TransactionResponse } from "ethers";
import type { Address } from "viem";
import type { IBlockchainContract } from "./IBlockchainContract";

export interface IGeodeStakingManager extends IBlockchainContract {
  // ============================================
  // Staking Functions
  // ============================================

  /**
   * Stakea una Geoda NFT
   * @param geodeId - ID del token Geoda
   * NOTA: El contrato usa stakeGeode(), no stake()
   */
  stakeGeode(geodeId: bigint): Promise<TransactionResponse>;

  /**
   * Unstakea una Geoda NFT
   * @param geodeId - ID del token Geoda
   * NOTA: El contrato usa unstakeGeode(), no unstake()
   */
  unstakeGeode(geodeId: bigint): Promise<TransactionResponse>;

  /**
   * Unstakea múltiples Geodas
   * @param geodeIds - Array de IDs de Geodas
   */
  batchUnstake(geodeIds: bigint[]): Promise<TransactionResponse>;

  // ============================================
  // View Functions
  // ============================================

  /**
   * Obtiene el poder total de staking de un usuario
   * @param user - Address del usuario
   * @returns Poder total (suma de todas las geodas stakeadas)
   */
  getUserStakingPower(user: Address): Promise<bigint>;

  /**
   * Obtiene todas las Geodas stakeadas por un usuario
   * @param user - Address del usuario
   * @returns Array de IDs de Geodas
   * NOTA: El contrato usa getUserStakedGeodes(), no getUserStakes()
   */
  getUserStakedGeodes(user: Address): Promise<bigint[]>;

  /**
   * Verifica si una Geoda específica está stakeada
   * @param geodeId - ID del token Geoda
   */
  isStaked(geodeId: bigint): Promise<boolean>;

  /**
   * Obtiene información de staking de una Geoda
   * @param geodeId - ID del token Geoda
   * @returns Struct con owner, timestamp, power, active
   * NOTA: El contrato usa getStake(), no getStakeInfo()
   */
  getStake(geodeId: bigint): Promise<{
    owner: Address;
    geodeId: bigint;
    stakedAt: bigint;
    power: bigint;
    active: boolean;
  }>;

  /**
   * Obtiene el poder total de staking de todos los usuarios
   */
  getTotalStakingPower(): Promise<bigint>;

  /**
   * Obtiene el poder de staking de un usuario específico
   * @param user - Address del usuario
   */
  getUserStakingPower(user: Address): Promise<bigint>;

  /**
   * Constantes de poder por categoría (view functions)
   */
  PETIT_POWER(): Promise<bigint>;
  ALTO_POWER(): Promise<bigint>;
  ANIMAL_POWER(): Promise<bigint>;

  // ============================================
  // Admin Functions
  // ============================================

  /**
   * Actualiza el poder de una categoría
   * @param category - Categoría (0=PETIT, 1=ALTO, 2=ANIMAL)
   * @param newPower - Nuevo valor de poder
   */
  setCategoryPower(
    category: number,
    newPower: bigint,
  ): Promise<TransactionResponse>;

  /**
   * Pausa/despausa el contrato
   */
  pause(): Promise<TransactionResponse>;
  unpause(): Promise<TransactionResponse>;
}

export default IGeodeStakingManager;
