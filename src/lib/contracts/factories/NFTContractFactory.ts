// @ts-nocheck
/**
 * Concrete Factory para contratos NFT
 * Implementa Abstract Factory pattern para GeodeNFT, CoreMinerNFT, IdNFT
 *
 * Patrón: Concrete Factory (GoF)
 */

import { ethers, type Contract } from "ethers";
import type { Address } from "viem";
import type { IGeodeNFT, ICoreMinerNFT } from "../interfaces/INFTContract";
import type { TransactionResult } from "../interfaces/IBlockchainContract";
import type { CoreMinerInfo } from "../interfaces/INFTContract";
import {
  BaseContractFactory,
  type ContractConfig,
} from "./BaseContractFactory";
import type {
  GeodeInfo,
  MinerData,
  MinerStats,
  NFTOwner,
  ApprovedAddress,
} from "../types/NFTTypes";
import { GEODENFT_ABI, COREMINERNFT_ABI } from "@/lib/abis";

/**
 * Implementación base para contratos NFT
 */
abstract class BaseNFTContract {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    protected contract: Contract,
  ) {}

  async getStatus() {
    return {
      address: this.address,
      isConnected: true,
      chainId: this.chainId,
    };
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

  on(eventName: string, callback: (event: unknown) => void): () => void {
    this.contract.on(eventName, callback);
    return () => this.contract.off(eventName, callback);
  }

  async ownerOf(tokenId: bigint): Promise<NFTOwner> {
    return (await this.contract.ownerOf(tokenId)) as NFTOwner;
  }

  async balanceOf(owner: string): Promise<bigint> {
    return await this.contract.balanceOf(owner);
  }

  async tokenURI(tokenId: bigint): Promise<string> {
    return await this.contract.tokenURI(tokenId);
  }

  async totalSupply(): Promise<bigint> {
    return await this.contract.totalSupply();
  }

  async approve(to: string, tokenId: bigint): Promise<TransactionResult> {
    const tx = await this.contract.approve(to, tokenId);
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }

  async setApprovalForAll(
    operator: string,
    approved: boolean,
  ): Promise<TransactionResult> {
    const tx = await this.contract.setApprovalForAll(operator, approved);
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }

  async getApproved(tokenId: bigint): Promise<ApprovedAddress> {
    return (await this.contract.getApproved(tokenId)) as ApprovedAddress;
  }

  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return await this.contract.isApprovedForAll(owner, operator);
  }

  async transferFrom(
    from: string,
    to: string,
    tokenId: bigint,
  ): Promise<TransactionResult> {
    const tx = await this.contract.transferFrom(from, to, tokenId);
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }

  async tokenByIndex(index: bigint): Promise<bigint> {
    return await this.contract.tokenByIndex(index);
  }

  async tokenOfOwnerByIndex(owner: string, index: bigint): Promise<bigint> {
    return await this.contract.tokenOfOwnerByIndex(owner, index);
  }

  async tokensOfOwner(owner: string): Promise<bigint[]> {
    const balance = await this.balanceOf(owner);
    const tokens: bigint[] = [];
    for (let i = 0; i < Number(balance); i++) {
      tokens.push(await this.tokenOfOwnerByIndex(owner, BigInt(i)));
    }
    return tokens;
  }
}

/**
 * Implementación concreta de IGeodeNFT
 */
class GeodeNFTContract extends BaseNFTContract implements IGeodeNFT {
  async getGeodeInfo(tokenId: bigint): Promise<GeodeInfo> {
    // GeodeNFT solo tiene getGeodeData que retorna (category, geodeType)
    const data = await this.contract.getGeodeData(tokenId);
    return {
      tokenId,
      category: Number(data[0]), // category
      axieClass: Number(data[1]), // geodeType (que es axieClass)
      forgeDate: 0n, // No disponible en contrato, debe obtenerse del evento
      creator: "", // No disponible en contrato, debe obtenerse del evento
      isHatched: false, // No disponible en contrato
    };
  }

  async getGeodeCategory(tokenId: bigint): Promise<number> {
    return Number(await this.contract.getGeodeCategory(tokenId));
  }

  async getGeodeClass(tokenId: bigint): Promise<number> {
    return Number(await this.contract.getGeodeClass(tokenId));
  }

  async getGeodeName(tokenId: bigint): Promise<string> {
    return await this.contract.getGeodeName(tokenId);
  }

  async isHatched(tokenId: bigint): Promise<boolean> {
    return await this.contract.isHatched(tokenId);
  }
}

/**
 * Implementación concreta de ICoreMinerNFT
 */
class CoreMinerNFTContract extends BaseNFTContract implements ICoreMinerNFT {
  async getMinerData(tokenId: bigint): Promise<CoreMinerInfo> {
    // El contrato retorna (category, minerType, minerIndex, power)
    const data = await this.contract.getMinerData(tokenId);

    return {
      tokenId,
      category: Number(data[0]), // uint8 category
      minerType: Number(data[1]), // uint8 minerType
      minerIndex: Number(data[2]), // uint8 minerIndex
      power: BigInt(data[3]), // uint16 power
      // Valores por defecto para campos que no están en getMinerData básico
      efficiency: 100n,
      durability: 100n,
      level: 1n,
      experience: 0n,
      isVoracious: false,
      lastFed: 0n,
      minerNameIndex: Number(data[2]), // Usar minerIndex como minerNameIndex (deprecated)
      forgeDate: 0n,
    };
  }

  async getMinerStats(tokenId: bigint): Promise<MinerStats> {
    const stats = await this.contract.getMinerStats(tokenId);
    return {
      power: stats.power,
      efficiency: stats.efficiency,
      durability: stats.durability,
      lastMined: stats.lastMined,
      forgeDate: stats.forgeDate,
    };
  }

  async getMinersOfOwner(owner: string): Promise<bigint[]> {
    return await this.contract.getMinersOfOwner(owner);
  }

  async needsFeeding(tokenId: bigint, feedInterval: bigint): Promise<boolean> {
    return await this.contract.needsFeeding(tokenId, feedInterval);
  }

  async getEffectivePower(tokenId: bigint): Promise<bigint> {
    return await this.contract.getEffectivePower(tokenId);
  }

  async feedMiner(tokenId: bigint): Promise<TransactionResult> {
    const tx = await this.contract.feedMiner(tokenId);
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }

  async addExperience(
    tokenId: bigint,
    amount: bigint,
  ): Promise<TransactionResult> {
    const tx = await this.contract.addExperience(tokenId, amount);
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }

  async reduceDurability(
    tokenId: bigint,
    amount: bigint,
  ): Promise<TransactionResult> {
    const tx = await this.contract.reduceDurability(tokenId, amount);
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }

  async repairMiner(
    tokenId: bigint,
    amount: bigint,
  ): Promise<TransactionResult> {
    const tx = await this.contract.repairMiner(tokenId, amount);
    const receipt = await tx.wait();
    return { hash: tx.hash, success: receipt.status === 1, receipt };
  }
}

/**
 * Factory concreta para contratos NFT
 */
export class NFTContractFactory extends BaseContractFactory {
  /**
   * Crea una instancia de GeodeNFT
   */
  createGeodeNFT(config: Omit<ContractConfig, "abi">): IGeodeNFT {
    const ethersContract = this.createEthersContract({
      ...config,
      abi: GEODENFT_ABI,
    });
    return new GeodeNFTContract(config.address, config.chainId, ethersContract);
  }

  /**
   * Crea una instancia de CoreMinerNFT
   */
  createCoreMinerNFT(config: Omit<ContractConfig, "abi">): ICoreMinerNFT {
    const ethersContract = this.createEthersContract({
      ...config,
      abi: COREMINERNFT_ABI,
    });
    return new CoreMinerNFTContract(
      config.address,
      config.chainId,
      ethersContract,
    );
  }

  /**
   * Factory Method - Implementación genérica
   */
  createContract(config: ContractConfig): IGeodeNFT | ICoreMinerNFT | IIdNFT {
    // Determinar tipo basado en ABI o usar GeodeNFT por defecto
    return this.createGeodeNFT(config);
  }
}

/**
 * Singleton instance
 */
export const nftContractFactory = new NFTContractFactory();
