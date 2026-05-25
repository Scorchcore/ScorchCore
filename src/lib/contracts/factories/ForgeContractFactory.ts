// @ts-nocheck
/**
 * Concrete Factory para contratos de Forja
 * Implementa Abstract Factory y Factory Method patterns
 *
 * Patrón: Concrete Factory (GoF)
 */

import type { Address } from "viem";
import {
  BaseContractFactory,
  type ContractConfig,
} from "./BaseContractFactory";
import type {
  IForgeContract,
  IRecipeRegistry,
  ISupplyTracker,
  ForgeResult,
  HatchResult,
  MaterialInput,
  ForgeEvents,
  Recipe,
} from "../interfaces";
import {
  FORGEFACTORY_ABI,
  RECIPEREGISTRY_ABI,
  SUPPLYTRACKER_ABI,
} from "@/lib/abis";
import type { Contract } from "ethers";

/**
 * Implementación concreta de IForgeContract
 * Wrapper alrededor del contrato Ethers.js
 */
class ForgeContract implements IForgeContract {
  constructor(
    public readonly address: Address,
    public readonly chainId: number,
    private contract: Contract,
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

  on(eventName: string, callback: (event: ForgeEvents) => void): () => void {
    this.contract.on(eventName, callback);
    return () => this.contract.off(eventName, callback);
  }

  async forgeRecipe(
    recipeId: number,
    materials: MaterialInput[],
    geodeType: number = 0,
    mementosToUse: number = 0,
    axieIds: bigint[] = [],
  ): Promise<ForgeResult> {
    // ForgeFactory.forgeGeode(category, geodeType, mementosToUse, axieIds)
    // recipeId es 1-indexed (1=Common, 2=Rare, 3=Epic, 4=Legendary, 5=Mythic)
    // category = recipeId - 1 (0-indexed)
    const category = recipeId - 1;

    // geodeType = clase de Axie (0=Beast, 1=Aqua, ..., 8=Dawn)
    // mementosToUse = cantidad de mementos extra para reducir riesgo de fallo
    // axieIds = array de IDs de Axies (requerido si material validation está habilitada)
    const tx = await this.contract.forgeGeode(
      category,
      geodeType,
      mementosToUse,
      axieIds,
    );
    const receipt = await tx.wait();

    // Extraer geodeId del evento GeodeForged
    const geodeId = receipt.logs
      ?.map((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          if (parsed?.name === "GeodeForged") {
            return parsed.args.geodeId;
          }
        } catch {}
        return null;
      })
      .find((id: any) => id !== null);

    return {
      success: receipt.status === 1,
      geodeId: geodeId || 0n,
      isCritical: false,
      isRare: false,
      transaction: {
        hash: tx.hash,
        success: receipt.status === 1,
        receipt,
      },
    };
  }

  async hatchGeode(geodeId: bigint): Promise<HatchResult> {
    const tx = await this.contract.hatchGeode(geodeId);
    const receipt = await tx.wait();
    return {
      success: receipt.status === 1,
      minerId: receipt.events?.[0]?.args?.tokenId ?? BigInt(0),
      category: 0,
      minerType: 0,
      minerIndex: 0,
      isCritical: false,
      finalPower: 0,
      transaction: {
        hash: tx.hash,
        success: receipt.status === 1,
        receipt,
      },
    };
  }

  async getRecipe(recipeId: number): Promise<Recipe> {
    const recipe = await this.contract.getRecipe(recipeId);
    return {
      id: recipeId,
      name: `Recipe ${recipeId}`,
      enabled: recipe.enabled,
      maxSupply: recipe.maxSupply,
      currentSupply: recipe.currentSupply,
      materials: [],
      chances: { success: 0, critical: 0, rare: 0 },
    };
  }

  async getAllRecipes(onlyEnabled?: boolean): Promise<Recipe[]> {
    // Implementación simplificada
    return [];
  }

  async canForge(user: string, recipeId: number): Promise<boolean> {
    return await this.contract.canForge(user, recipeId);
  }

  async canHatch(geodeId: bigint): Promise<boolean> {
    return await this.contract.canHatch(geodeId);
  }

  async calculateCost(recipeId: number): Promise<Map<Address, bigint>> {
    return new Map() as Map<Address, bigint>;
  }

  async hasMaterials(user: string, recipeId: number): Promise<boolean> {
    return await this.contract.hasMaterials(user, recipeId);
  }

  async getIncubationTime(geodeId: bigint): Promise<number> {
    const time = await this.contract.getIncubationTime(geodeId);
    return Number(time);
  }
}

/**
 * Factory concreta para crear contratos de Forja
 *
 * Patrón: Concrete Factory (GoF)
 */
export class ForgeContractFactory extends BaseContractFactory<IForgeContract> {
  /**
   * Implementación del Factory Method
   * Crea una instancia concreta de IForgeContract
   */
  createContract(config: ContractConfig): IForgeContract {
    const ethersContract = this.createEthersContract(config);
    return new ForgeContract(config.address, config.chainId, ethersContract);
  }

  /**
   * Factory method específico para ForgeFactory
   */
  createForgeFactory(config: Omit<ContractConfig, "abi">): IForgeContract {
    return this.createContract({
      ...config,
      abi: FORGEFACTORY_ABI,
    });
  }

  /**
   * Factory method para RecipeRegistry
   */
  createRecipeRegistry(config: Omit<ContractConfig, "abi">): IRecipeRegistry {
    const ethersContract = this.createEthersContract({
      ...config,
      abi: RECIPEREGISTRY_ABI,
    });

    // Implementación simplificada de IRecipeRegistry
    return {
      address: config.address,
      chainId: config.chainId,
      getStatus: async () => ({
        address: config.address as any,
        isConnected: true,
        chainId: config.chainId,
      }),
      isDeployed: async () => true,
      on:
        (eventName: string, callback: (...args: unknown[]) => void) => () => {},
      getRecipe: async (recipeId: number) => ({
        id: recipeId,
        name: `Recipe ${recipeId}`,
        enabled: true,
        maxSupply: BigInt(1000),
        currentSupply: BigInt(0),
        materials: [],
        chances: { success: 8000, critical: 1000, rare: 500 },
      }),
      registerRecipe: async (recipe: Omit<Recipe, "id" | "currentSupply">) => ({
        hash: "0x",
        success: true,
      }),
      toggleRecipe: async (recipeId: number, enabled: boolean) => ({
        hash: "0x",
        success: true,
      }),
    } as IRecipeRegistry;
  }

  /**
   * Factory method para SupplyTracker
   */
  createSupplyTracker(config: Omit<ContractConfig, "abi">): ISupplyTracker {
    const ethersContract = this.createEthersContract({
      ...config,
      abi: SUPPLYTRACKER_ABI,
    });

    return {
      address: config.address,
      chainId: config.chainId,
      getStatus: async () => ({
        address: config.address as any,
        isConnected: true,
        chainId: config.chainId,
      }),
      isDeployed: async () => true,
      on:
        (eventName: string, callback: (...args: unknown[]) => void) => () => {},
      getCurrentSupply: async (recipeId: number) => BigInt(0),
      getMaxSupply: async (recipeId: number) => BigInt(1000),
      hasSupplyAvailable: async (recipeId: number) => true,
      incrementSupply: async (recipeId: number) => ({
        hash: "0x",
        success: true,
      }),
    } as ISupplyTracker;
  }
}

/**
 * Singleton instance
 * Reutilizable en toda la aplicación
 */
export const forgeContractFactory = new ForgeContractFactory();
