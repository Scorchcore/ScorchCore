/**
 * Factory para GeodeStakingManager
 * Maneja el staking de Geodas NFT con poder específico por categoría
 */

import { Contract } from 'ethers';
import type { Signer, Provider } from 'ethers';
import { GeodeStakingManagerABI } from '@/lib/abis';
import type { Address } from 'viem';

export class GeodeStakingManagerFactory {
  /**
   * Crea una instancia del contrato GeodeStakingManager
   */
  static create(
    address: Address,
    signerOrProvider: Signer | Provider
  ): Contract {
    return new Contract(address, GeodeStakingManagerABI, signerOrProvider);
  }

  /**
   * Método legacy para compatibilidad con ContractManager
   */
  static createGeodeStakingManager(config: {
    address: Address;
    chainId: number;
    signerOrProvider: Signer | Provider;
  }): Contract {
    return GeodeStakingManagerFactory.create(config.address, config.signerOrProvider);
  }
}

export default GeodeStakingManagerFactory;
