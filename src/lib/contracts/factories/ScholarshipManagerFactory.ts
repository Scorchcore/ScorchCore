/**
 * Factory para ScholarshipManager
 * Sistema de préstamo de CoreMiners (Becas 2.0) con reward splitting automático
 */

import { Contract } from 'ethers';
import type { Signer, Provider } from 'ethers';
import { ScholarshipManagerABI } from '@/lib/abis';
import type { Address } from 'viem';

export class ScholarshipManagerFactory {
  /**
   * Crea una instancia del contrato ScholarshipManager
   */
  static create(
    address: Address,
    signerOrProvider: Signer | Provider
  ): Contract {
    return new Contract(address, ScholarshipManagerABI, signerOrProvider);
  }

  /**
   * Método legacy para compatibilidad con ContractManager
   */
  static createScholarshipManager(config: {
    address: Address;
    chainId: number;
    signerOrProvider: Signer | Provider;
  }): Contract {
    return ScholarshipManagerFactory.create(config.address, config.signerOrProvider);
  }
}

export default ScholarshipManagerFactory;
