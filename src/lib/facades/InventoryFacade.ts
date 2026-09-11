/**
 * InventoryFacade - Facade para operaciones de inventario (geodas)
 *
 * @pattern Facade (GoF)
 * @principle Single Responsibility - Maneja SOLO operaciones de inventario
 * @principle Dependency Inversion - Depende de abstracciones (IContractManager)
 */

import type { Address } from "viem";
import {
  AXIE_CLASS_INFO,
  type AxieClass,
  CATEGORY_INFO,
  GeodeCategory,
  getGeodeName,
} from "../constants/geodes";
import type { ContractManager } from "../contracts/ContractManager";
import { createServiceLogger } from "../utils/logging/logger";
import { chainReadClient } from "../utils/network/chainReadClient";

const logger = createServiceLogger("InventoryFacade");

/**
 * Información completa de una geoda en inventario
 * Las geodas tienen poder de minado según whitepaper y pueden ir a staking
 */
export interface GeodeInventoryInfo {
  id: bigint;
  category: GeodeCategory;
  axieClass: AxieClass;
  categoryName: string;
  className: string;
  fullName: string;
  owner: string;
  createdAt: number;
  hatchTime: number;
  isHatched: boolean;
  canHatch: boolean;
  miningPower: number;
  efficiency: number;
  isStaked?: boolean;
}

export class InventoryFacade {
  constructor(private contractManager: ContractManager) {}

  async getUserGeodes(
    userAddress: Address,
    options?: {
      limit?: number;
      offset?: number;
      onProgress?: (geodes: GeodeInventoryInfo[]) => void;
    },
  ): Promise<GeodeInventoryInfo[]> {
    logger.info("Loading user geodes from V2 enumeration", { userAddress });

    const geodeContract = this.contractManager.getGeodeNFTV2();
    const balance = await chainReadClient.read<bigint>(
      () => geodeContract.balanceOf(userAddress),
      { label: "InventoryFacade.geodeBalance" },
    );
    if (balance === 0n) return [];

    const limit = options?.limit ?? Number(balance);
    const offset = options?.offset ?? 0;
    const tokenIds = await chainReadClient.read<bigint[]>(
      () => geodeContract.tokensOfOwner(userAddress),
      { label: "InventoryFacade.tokensOfOwner" },
    );

    const geodes: GeodeInventoryInfo[] = [];
    for (let index = offset; index < tokenIds.length && geodes.length < limit; index += 3) {
      const batch = tokenIds.slice(index, index + 3);
      const results = await Promise.all(
        batch.map((id) => this.loadGeodeV2(geodeContract, id, userAddress)),
      );
      for (const geode of results) {
        if (!geode) continue;
        geodes.push(geode);
        options?.onProgress?.([...geodes]);
        if (geodes.length >= limit) break;
      }
    }

    return geodes;
  }

  private async loadGeodeV2(
    geodeContract: ReturnType<typeof this.contractManager.getGeodeNFTV2>,
    id: bigint,
    userAddress: Address,
  ): Promise<GeodeInventoryInfo | null> {
    try {
      const [info, isHatched] = await Promise.all([
        chainReadClient.read<{
          category: bigint | number;
          axieClass: bigint | number;
        }>(() => geodeContract.getGeodeInfo(id), {
          label: `InventoryFacade.getGeodeInfo:${id.toString()}`,
        }),
        chainReadClient.read<boolean>(() => geodeContract.isHatched(id), {
          label: `InventoryFacade.isHatched:${id.toString()}`,
        }),
      ]);

      const category = Number(info.category) as GeodeCategory;
      const axieClass = Number(info.axieClass) as AxieClass;
      const categoryPowerMap: Record<GeodeCategory, number> = {
        [GeodeCategory.PETIT]: 75,
        [GeodeCategory.ALTO]: 125,
        [GeodeCategory.ANIMAL]: 165,
        [GeodeCategory.ULTRAMECH]: 165,
        [GeodeCategory.TANQUE]: 250,
      };
      const now = Math.floor(Date.now() / 1000);

      return {
        id,
        category,
        axieClass,
        categoryName: CATEGORY_INFO[category].name,
        className: AXIE_CLASS_INFO[axieClass].displayName,
        fullName: getGeodeName(category, axieClass),
        owner: userAddress,
        createdAt: now,
        hatchTime: now,
        isHatched,
        canHatch: !isHatched,
        miningPower: categoryPowerMap[category] || 75,
        efficiency: 80,
        isStaked: false,
      };
    } catch {
      return null;
    }
  }
}
