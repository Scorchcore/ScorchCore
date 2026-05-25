/**
 * SetRegistryFactory
 * 
 * Factory para crear instancias de SetRegistry
 * 
 * @pattern Factory Pattern
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { SETREGISTRY_ABI } from '@/lib/abis/mining.abis';
import type { ISetRegistry } from '../interfaces/ICollectionContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('SetRegistryFactory');

/**
 * Implementación de SetRegistry
 */
class SetRegistryContract implements ISetRegistry {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: ethers.Contract
  ) {}

  async getStatus(): Promise<{ address: Address; isConnected: boolean; chainId: number; }> {
    try {
      const isDeployed = await this.isDeployed();
      return {
        address: this.address,
        isConnected: isDeployed,
        chainId: this.chainId,
      };
    } catch (error) {
      return {
        address: this.address,
        isConnected: false,
        chainId: this.chainId,
      };
    }
  }

  async isDeployed(): Promise<boolean> {
    try {
      if (!this.contract.runner?.provider) return false;
      const code = await this.contract.runner.provider.getCode(this.address);
      return code !== undefined && code !== '0x';
    } catch (error) {
      return false;
    }
  }

  on(eventName: string, callback: (event: unknown) => void): () => void {
    this.contract.on(eventName, callback);
    return () => {
      this.contract.off(eventName, callback);
    };
  }

  async totalSets(): Promise<bigint> {
    try {
      const total = await this.contract.totalSets();
      return BigInt(total.toString());
    } catch (error) {
      logger.error('Error getting total sets', { error });
      throw error;
    }
  }

  async getSetInfo(setId: number): Promise<{
    name: string;
    bonusPercentage: number;
    isActive: boolean;
    requiredTypesCount: number;
  }> {
    try {
      const [name, bonusPercentage, isActive, requiredTypesCount] = 
        await this.contract.getSetInfo(setId);
      
      return {
        name: name as string,
        bonusPercentage: Number(bonusPercentage),
        isActive: isActive as boolean,
        requiredTypesCount: Number(requiredTypesCount),
      };
    } catch (error) {
      logger.error('Error getting set info', { error, setId });
      throw error;
    }
  }

  async getSetRequirements(setId: number): Promise<{
    categories: number[];
    types: number[];
    counts: number[];
  }> {
    try {
      const [categories, types, counts] = await this.contract.getSetRequirements(setId);
      
      return {
        categories: (categories as any[]).map(c => Number(c)),
        types: (types as any[]).map(t => Number(t)),
        counts: (counts as any[]).map(c => Number(c)),
      };
    } catch (error) {
      logger.error('Error getting set requirements', { error, setId });
      throw error;
    }
  }

  async isSetActive(setId: number): Promise<boolean> {
    try {
      const isActive = await this.contract.isSetActive(setId);
      return isActive as boolean;
    } catch (error) {
      logger.error('Error checking if set is active', { error, setId });
      throw error;
    }
  }

  async createSet(
    name: string,
    categories: number[],
    types: number[],
    counts: number[],
    bonusPercentage: number
  ): Promise<TransactionResult> {
    try {
      logger.info('Creating set', { name, bonusPercentage });
      const tx = await this.contract.createSet(name, categories, types, counts, bonusPercentage);
      const receipt = await tx.wait();
      
      logger.info('Set created', { txHash: receipt.hash });
      return {
        hash: receipt.hash,
        success: true,
        receipt,
      };
    } catch (error) {
      logger.error('Error creating set', { error });
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async updateSetStatus(setId: number, isActive: boolean): Promise<TransactionResult> {
    try {
      logger.info('Updating set status', { setId, isActive });
      const tx = await this.contract.updateSetStatus(setId, isActive);
      const receipt = await tx.wait();
      
      logger.info('Set status updated', { txHash: receipt.hash });
      return {
        hash: receipt.hash,
        success: true,
        receipt,
      };
    } catch (error) {
      logger.error('Error updating set status', { error });
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async updateSetBonus(setId: number, newBonus: number): Promise<TransactionResult> {
    try {
      logger.info('Updating set bonus', { setId, newBonus });
      const tx = await this.contract.updateSetBonus(setId, newBonus);
      const receipt = await tx.wait();
      
      logger.info('Set bonus updated', { txHash: receipt.hash });
      return {
        hash: receipt.hash,
        success: true,
        receipt,
      };
    } catch (error) {
      logger.error('Error updating set bonus', { error });
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}

/**
 * Factory para crear instancias de SetRegistry
 */
export class SetRegistryFactory {
  create(
    address: Address,
    chainId: number,
    providerOrSigner: ethers.Provider | ethers.Signer
  ): ISetRegistry {
    logger.info('Creating SetRegistry instance', { address, chainId });

    const contract = new ethers.Contract(
      address,
      SETREGISTRY_ABI,
      providerOrSigner
    );

    return new SetRegistryContract(address, chainId, contract);
  }
}
