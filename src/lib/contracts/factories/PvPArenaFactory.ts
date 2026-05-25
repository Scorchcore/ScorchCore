/**
 * Factory para PvPArena
 * "Asalto al Núcleo" - Sistema PvP con steal temporal de poder
 */

import { Contract } from 'ethers';
import type { Signer, Provider } from 'ethers';
import { PvPArenaABI } from '@/lib/abis';
import type { Address } from 'viem';

export class PvPArenaFactory {
  /**
   * Crea una instancia del contrato PvPArena
   */
  static create(
    address: Address,
    signerOrProvider: Signer | Provider
  ): Contract {
    return new Contract(address, PvPArenaABI, signerOrProvider);
  }

  /**
   * Método legacy para compatibilidad con ContractManager
   */
  static createPvPArena(config: {
    address: Address;
    chainId: number;
    signerOrProvider: Signer | Provider;
  }): Contract {
    return PvPArenaFactory.create(config.address, config.signerOrProvider);
  }
}

export default PvPArenaFactory;
