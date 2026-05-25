// @ts-nocheck
/**
 * MinerStatsManagerFactory - Factory para crear instancias de MinerStatsManager
 *
 * @pattern Factory Method (GoF)
 * @principle Open/Closed - Extensible sin modificar código existente
 */

import { ethers } from "ethers";
import type { Address } from "viem";
import type { IMinerStatsManager } from "../interfaces/IMinerStatsManager";
import type { TransactionResult } from "../interfaces/IBlockchainContract";
import type { ContractConfig } from "./BaseContractFactory";
import type { EventUnsubscribe } from "../types/TransactionTypes";
import type { MinerStatsEvents } from "../interfaces/IMinerStatsManager";
import { MINERSTATSMANAGER_ABI } from "@/lib/abis/mining.abis";

/**
 * Implementación concreta de IMinerStatsManager
 */
class MinerStatsManagerContract implements IMinerStatsManager {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: ethers.Contract,
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
      throw new Error(`Error getting MinerStatsManager status: ${error}`);
    }
  }

  async isDeployed(): Promise<boolean> {
    try {
      const provider = this.contract.runner?.provider;
      if (!provider) return false;
      const code = await provider.getCode(this.address);
      return code !== "0x";
    } catch {
      return false;
    }
  }

  on(
    eventName: string,
    callback: (event: MinerStatsEvents) => void,
  ): EventUnsubscribe {
    this.contract.on(eventName, callback);
    return () => this.contract.off(eventName, callback);
  }

  async initializeStats(tokenId: bigint): Promise<TransactionResult> {
    const tx = await this.contract.initializeStats(tokenId);
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async getStats(tokenId: bigint): Promise<DynamicStats> {
    const stats = await this.contract.getStats(tokenId);
    return {
      durability: Number(stats.durability || stats[0]),
      efficiency: Number(stats.efficiency || stats[1]),
      experience: Number(stats.experience || stats[2]),
      level: Number(stats.level || stats[3]),
      lastMined: Number(stats.lastMined || stats[4]),
      lastRepaired: Number(stats.lastRepaired || stats[5]),
      isVoracious: Boolean(stats.isVoracious ?? stats[6]),
      lastFed: Number(stats.lastFed || stats[7]),
    };
  }

  async getCondition(
    tokenId: bigint,
  ): Promise<{ durability: number; efficiency: number }> {
    const condition = await this.contract.getCondition(tokenId);
    return {
      durability: Number(condition.durability || condition[0]),
      efficiency: Number(condition.efficiency || condition[1]),
    };
  }

  async repairMiner(
    tokenId: bigint,
    amount: number,
  ): Promise<TransactionResult> {
    const tx = await this.contract.repairMiner(tokenId, amount);
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async gainExperience(
    tokenId: bigint,
    amount: number,
  ): Promise<TransactionResult> {
    const tx = await this.contract.gainExperience(tokenId, amount);
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async updateAfterMining(
    tokenId: bigint,
    miningDuration: number,
  ): Promise<TransactionResult> {
    const tx = await this.contract.updateAfterMining(tokenId, miningDuration);
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async feedMiner(tokenId: bigint): Promise<TransactionResult> {
    const tx = await this.contract.feedMiner(tokenId);
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async setVoracious(
    tokenId: bigint,
    voracious: boolean,
  ): Promise<TransactionResult> {
    const tx = await this.contract.setVoracious(tokenId, voracious);
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async updateLastMined(tokenId: bigint): Promise<TransactionResult> {
    const tx = await this.contract.updateLastMined(tokenId);
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async needsRepair(tokenId: bigint, threshold: number): Promise<boolean> {
    return await this.contract.needsRepair(tokenId, threshold);
  }

  async needsFeeding(tokenId: bigint, feedInterval: number): Promise<boolean> {
    return await this.contract.needsFeeding(tokenId, feedInterval);
  }

  async isHungry(tokenId: bigint): Promise<boolean> {
    return await this.contract.isHungry(tokenId);
  }

  async isStarving(tokenId: bigint): Promise<boolean> {
    return await this.contract.isStarving(tokenId);
  }

  async applyHungerPenalty(tokenId: bigint): Promise<TransactionResult> {
    const tx = await this.contract.applyHungerPenalty(tokenId);
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async getEffectiveMultiplier(
    tokenId: bigint,
    basePower: bigint,
  ): Promise<bigint> {
    return await this.contract.getEffectiveMultiplier(tokenId, basePower);
  }

  async getTimeUntilHungry(tokenId: bigint): Promise<number> {
    const time = await this.contract.getTimeUntilHungry(tokenId);
    return Number(time);
  }

  async getTimeUntilStarving(tokenId: bigint): Promise<number> {
    const time = await this.contract.getTimeUntilStarving(tokenId);
    return Number(time);
  }

  async setFeedingConfig(config: FeedingConfig): Promise<TransactionResult> {
    const tx = await this.contract.setFeedingConfig(
      config.feedingInterval,
      config.hungerGracePeriod,
      config.hungerPenalty,
      config.voraciousBonus,
    );
    const receipt = await tx.wait();
    return {
      hash: receipt.hash,
      success: receipt.status === 1,
      receipt,
    };
  }

  async getFeedingConfig(): Promise<FeedingConfig> {
    const [feedingInterval, hungerGracePeriod, hungerPenalty, voraciousBonus] =
      await Promise.all([
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
}

/**
 * Factory para crear contratos de MinerStatsManager
 */
export class MinerStatsManagerFactory {
  /**
   * Crea una instancia de MinerStatsManager
   */
  createMinerStatsManager(
    config: Omit<ContractConfig, "abi"> & { abi?: readonly any[] },
  ): IMinerStatsManager {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      config.abi || MINERSTATSMANAGER_ABI,
      signerOrProvider,
    );

    return new MinerStatsManagerContract(
      address as Address,
      config.chainId,
      contract,
    );
  }
}

export default MinerStatsManagerFactory;
