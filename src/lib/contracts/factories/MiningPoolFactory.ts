/**
 * MiningPoolFactory - Factory para crear instancias de MiningPool
 * 
 * @pattern Factory Method (GoF)
 * @principle Open/Closed - Extensible sin modificar código existente
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import type { 
  IMiningContract, 
  MinerInfo, 
  MinerStats, 
  PendingRewards,
  MiningEvents 
} from '../interfaces/IMiningContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import type { ContractConfig } from './BaseContractFactory';
import type { EventCallback, EventUnsubscribe } from '../types/TransactionTypes';
import { MININGPOOL_ABI } from '@/lib/abis';

/**
 * Implementación concreta de IMiningContract
 */
class MiningPoolContract implements IMiningContract {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: ethers.Contract
  ) {}

  async getStatus() {
    try {
      const isDeployed = await this.isDeployed();
      return {
        address: this.address,
        chainId: this.chainId,
        isDeployed,
        isConnected: true,
      };
    } catch (error) {
      throw new Error(`Error getting MiningPool status: ${error}`);
    }
  }

  async isDeployed(): Promise<boolean> {
    try {
      const provider = this.contract.runner?.provider;
      if (!provider) return false;
      const code = await provider.getCode(this.address);
      return code !== '0x';
    } catch {
      return false;
    }
  }

  on(eventName: string, callback: (event: MiningEvents) => void): () => void {
    this.contract.on(eventName, callback as any);
    return () => this.contract.off(eventName, callback as any);
  }

  async startMining(minerId: bigint): Promise<TransactionResult> {
    const transaction = await this.contract.startMining(minerId);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async stopMining(minerId: bigint): Promise<TransactionResult> {
    const transaction = await this.contract.stopMining(minerId);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async claimRewards(minerId: bigint): Promise<TransactionResult & { amount: bigint }> {
    const transaction = await this.contract.claimRewards(minerId);
    const transactionReceipt = await transaction.wait();
    
    // Extraer cantidad del evento RewardsClaimed
    const rewardsClaimedLog = transactionReceipt.logs.find((log: any) => {
      try {
        const parsedLog = this.contract.interface.parseLog(log);
        return parsedLog?.name === 'RewardsClaimed';
      } catch {
        return false;
      }
    });

    let rewardAmount = 0n;
    if (rewardsClaimedLog) {
      const parsedEvent = this.contract.interface.parseLog(rewardsClaimedLog);
      rewardAmount = parsedEvent?.args?.amount || 0n;
    }

    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
      amount: rewardAmount,
    };
  }

  async getPendingRewards(minerId: bigint): Promise<PendingRewards> {
    const result = await this.contract.getPendingRewards(minerId);
    return {
      coreAmount: result.coreAmount || result[0] || 0n,
      bonusAmount: result.bonusAmount || result[1] || 0n,
      totalAmount: result.totalAmount || result[2] || 0n,
      lastUpdateTime: result.lastUpdateTime || result[3] || 0n,
    };
  }

  async isMining(minerId: bigint): Promise<boolean> {
    return await this.contract.isMining(minerId);
  }

  async getMinerInfo(minerId: bigint): Promise<MinerInfo> {
    const info = await this.contract.getMinerInfo(minerId);
    return {
      tokenId: info.tokenId || info[0] || 0n,
      owner: info.owner || info[1] || '0x0',
      power: info.power || info[2] || 0n,
      efficiency: info.efficiency || info[3] || 0n,
      durability: info.durability || info[4] || 0n,
      level: info.level || info[5] || 0n,
      experience: info.experience || info[6] || 0n,
      isVoracious: info.isVoracious || info[7] || false,
      lastFed: info.lastFed || info[8] || 0n,
      minerType: info.minerType || info[9] || 0,
      minerNameIndex: info.minerNameIndex || info[10] || 0,
      lastMined: info.lastMined || info[11] || 0n,
      forgeDate: info.forgeDate || info[12] || 0n,
    };
  }

  async getMinerStats(minerId: bigint): Promise<MinerStats> {
    const stats = await this.contract.getMinerStats(minerId);
    return {
      tokenId: stats.tokenId || stats[0] || 0n,
      totalMined: stats.totalMined || stats[1] || 0n,
      totalRewards: stats.totalRewards || stats[2] || 0n,
      cyclesCompleted: stats.cyclesCompleted || stats[3] || 0n,
      lastClaimTime: stats.lastClaimTime || stats[4] || 0n,
      effectivePower: stats.effectivePower || stats[5] || 0n,
      bonusMultiplier: stats.bonusMultiplier || stats[6] || 0n,
    };
  }

  // ==========================================
  // Feeding System Methods
  // ==========================================

  async feedMiner(minerId: bigint): Promise<TransactionResult> {
    const transaction = await this.contract.feedMiner(minerId);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async isHungry(minerId: bigint): Promise<boolean> {
    return await this.contract.isHungry(minerId);
  }

  async isStarving(minerId: bigint): Promise<boolean> {
    return await this.contract.isStarving(minerId);
  }

  async needsFeeding(minerId: bigint, feedInterval: number): Promise<boolean> {
    return await this.contract.needsFeeding(minerId, feedInterval);
  }

  async getTimeUntilHungry(minerId: bigint): Promise<number> {
    const time = await this.contract.getTimeUntilHungry(minerId);
    return Number(time);
  }

  async getTimeUntilStarving(minerId: bigint): Promise<number> {
    const time = await this.contract.getTimeUntilStarving(minerId);
    return Number(time);
  }

  async applyHungerPenalty(minerId: bigint): Promise<TransactionResult> {
    const transaction = await this.contract.applyHungerPenalty(minerId);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async setVoracious(minerId: bigint, voracious: boolean): Promise<TransactionResult> {
    const transaction = await this.contract.setVoracious(minerId, voracious);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async getFeedingConfig(): Promise<{
    feedingInterval: number;
    hungerGracePeriod: number;
    hungerPenalty: number;
    voraciousBonus: number;
  }> {
    const [feedingInterval, hungerGracePeriod, hungerPenalty, voraciousBonus] = await Promise.all([
      this.contract.feedingInterval(),
      this.contract.hungerGracePeriod(),
      this.contract.hungerPenalty(),
      this.contract.voraciousBonus(),
    ]);

    return {
      feedingInterval: Number(feedingInterval),
      hungerGracePeriod: Number(hungerGracePeriod),
      hungerPenalty: Number(hungerPenalty),
      voraciousBonus: Number(voraciousBonus),
    };
  }

  async getStats(minerId: bigint): Promise<MinerStats> {
    return this.getMinerStats(minerId);
  }

  async updateStats(minerId: bigint, rewardsClaimed: bigint): Promise<TransactionResult> {
    const transaction = await this.contract.updateStats(minerId, rewardsClaimed);
    const transactionReceipt = await transaction.wait();
    return {
      hash: transactionReceipt.hash,
      success: transactionReceipt.status === 1,
      receipt: transactionReceipt,
    };
  }

  async getEffectivePower(minerId: bigint): Promise<bigint> {
    return await this.contract.getEffectivePower(minerId);
  }
}

/**
 * Factory para crear contratos de MiningPool
 */
export class MiningPoolFactory {
  /**
   * Crea una instancia de MiningPool
   */
  createMiningPool(config: Omit<ContractConfig, 'abi'> & { abi?: readonly any[] }): IMiningContract {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      MININGPOOL_ABI,
      signerOrProvider
    );

    return new MiningPoolContract(
      address as Address,
      config.chainId,
      contract
    );
  }
}

export default MiningPoolFactory;
