/**
 * Interfaz para el contrato AxieStakingManager
 * Gestiona el staking de Axies NFT para obtener bonos en mining
 */

import type { Address } from 'viem';

/**
 * Información de un Axie stakeado
 */
export interface StakedAxieInfo {
  owner: Address;
  axieId: bigint;
  stakedAt: bigint;
  bonusPercentage: number;
}

/**
 * Interfaz del contrato AxieStakingManager
 */
export interface IAxieStakingManager {
  /**
   * Stakea un Axie para obtener bonos de mining
   */
  stakeAxie(axieId: bigint): Promise<void>;

  /**
   * Retira un Axie stakeado
   */
  unstakeAxie(axieId: bigint): Promise<void>;

  /**
   * Verifica si un Axie está stakeado
   */
  isAxieStaked(axieId: bigint): Promise<boolean>;

  /**
   * Obtiene información de un Axie stakeado
   */
  getStakedAxieInfo(axieId: bigint): Promise<StakedAxieInfo>;

  /**
   * Obtiene todos los Axies stakeados por un usuario
   */
  getStakedAxies(owner: Address): Promise<bigint[]>;

  /**
   * Obtiene el bono de mining por tener Axies stakeados
   */
  getMiningBonus(owner: Address): Promise<number>;

  /**
   * Verifica si un Axie específico está aprobado para staking
   */
  isApprovedForStaking(axieId: bigint): Promise<boolean>;
}
