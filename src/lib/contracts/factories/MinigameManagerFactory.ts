/**
 * Factory para MinigameManager
 * Minijuegos F2P con sistema de recompensas en fCORE
 */

import { Contract } from 'ethers';
import type { Signer, Provider } from 'ethers';
import { MinigameManagerABI } from '@/lib/abis';
import type { Address } from 'viem';

export class MinigameManagerFactory {
  /**
   * Crea una instancia del contrato MinigameManager
   */
  static create(
    address: Address,
    signerOrProvider: Signer | Provider
  ): Contract {
    return new Contract(address, MinigameManagerABI, signerOrProvider);
  }

  /**
   * Método legacy para compatibilidad con ContractManager
   */
  static createMinigameManager(config: {
    address: Address;
    chainId: number;
    signerOrProvider: Signer | Provider;
  }): Contract {
    return MinigameManagerFactory.create(config.address, config.signerOrProvider);
  }
}

export default MinigameManagerFactory;
