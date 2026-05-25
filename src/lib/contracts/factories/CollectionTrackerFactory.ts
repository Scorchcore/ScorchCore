/**
 * CollectionTrackerFactory
 * 
 * Factory para crear instancias de UserCollectionTracker
 * 
 * @pattern Factory Pattern
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { USERCOLLECTIONTRACKER_ABI } from '@/lib/abis/mining.abis';
import type { ICollectionTracker } from '../interfaces/ICollectionContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('CollectionTrackerFactory');

/**
 * Implementación de UserCollectionTracker
 */
class CollectionTrackerContract implements ICollectionTracker {
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

  async getMinerCount(user: Address, category: number, minerType: number): Promise<bigint> {
    try {
      const count = await this.contract.getMinerCount(user, category, minerType);
      return BigInt(count.toString());
    } catch (error) {
      logger.error('Error getting miner count', { error, user, category, minerType });
      throw error;
    }
  }

  async hasMinerCount(
    user: Address,
    category: number,
    minerType: number,
    requiredCount: number
  ): Promise<boolean> {
    try {
      const has = await this.contract.hasMinerCount(user, category, minerType, requiredCount);
      return has as boolean;
    } catch (error) {
      logger.error('Error checking miner count', { error, user, category, minerType, requiredCount });
      throw error;
    }
  }

  async addMiner(user: Address, category: number, minerType: number): Promise<TransactionResult> {
    try {
      logger.info('Adding miner', { user, category, minerType });
      const tx = await this.contract.addMiner(user, category, minerType);
      const receipt = await tx.wait();
      
      logger.info('Miner added', { txHash: receipt.hash });
      return {
        hash: receipt.hash,
        success: true,
        receipt,
      };
    } catch (error) {
      logger.error('Error adding miner', { error });
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  async removeMiner(user: Address, category: number, minerType: number): Promise<TransactionResult> {
    try {
      logger.info('Removing miner', { user, category, minerType });
      const tx = await this.contract.removeMiner(user, category, minerType);
      const receipt = await tx.wait();
      
      logger.info('Miner removed', { txHash: receipt.hash });
      return {
        hash: receipt.hash,
        success: true,
        receipt,
      };
    } catch (error) {
      logger.error('Error removing miner', { error });
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}

/**
 * Factory para crear instancias de CollectionTracker
 */
export class CollectionTrackerFactory {
  create(
    address: Address,
    chainId: number,
    providerOrSigner: ethers.Provider | ethers.Signer
  ): ICollectionTracker {
    logger.info('Creating CollectionTracker instance', { address, chainId });

    const contract = new ethers.Contract(
      address,
      USERCOLLECTIONTRACKER_ABI,
      providerOrSigner
    );

    return new CollectionTrackerContract(address, chainId, contract);
  }
}
