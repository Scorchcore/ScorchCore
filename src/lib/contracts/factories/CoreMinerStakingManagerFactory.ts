/**
 * Factory para CoreMinerStakingManager
 * Maneja el staking flexible de CoreMiners (sin lock obligatorio)
 */

import { Contract } from 'ethers';
import type { Signer, Provider } from 'ethers';
import { CoreMinerStakingManagerABI } from '@/lib/abis';
import type { Address } from 'viem';

export class CoreMinerStakingManagerFactory {
  /**
   * Crea una instancia del contrato CoreMinerStakingManager
   */
  static create(
    address: Address,
    signerOrProvider: Signer | Provider
  ): Contract {
    return new Contract(address, CoreMinerStakingManagerABI, signerOrProvider);
  }

  /**
   * Método legacy para compatibilidad con ContractManager
   */
  static createCoreMinerStakingManager(config: {
    address: Address;
    chainId: number;
    signerOrProvider: Signer | Provider;
  }): Contract {
    return CoreMinerStakingManagerFactory.create(config.address, config.signerOrProvider);
  }
}

export default CoreMinerStakingManagerFactory;
