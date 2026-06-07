/**
 * InventoryFacade - Facade para operaciones de inventario (geodas)
 *
 * @pattern Facade (GoF)
 * @principle Single Responsibility - Maneja SOLO operaciones de inventario
 * @principle Dependency Inversion - Depende de abstracciones (IContractManager)
 */

import type { Address } from "viem";
import { getDeploymentBlock } from "../config/deployment.config";
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

  // Para staking: las geodas tienen poder de minado
  miningPower: number;
  efficiency: number;
  isStaked?: boolean;
}

/**
 * Facade para operaciones de inventario
 * Encapsula toda la lógica de geodas del usuario
 */
export class InventoryFacade {
  constructor(private contractManager: ContractManager) {}

  /**
   * Obtiene todas las geodas del usuario.
   * Scans GeodeForged events and verifies ownership in batches to respect rate limits.
   */
  async getUserGeodes(
    userAddress: Address,
    options?: { onProgress?: (geodes: GeodeInventoryInfo[]) => void },
  ): Promise<GeodeInventoryInfo[]> {
    logger.info("📦 Cargando geodas del usuario", { userAddress });

    try {
      const geodeContract = this.contractManager.getGeodeNFT();
      const forgeContract = this.contractManager.getForgeFactory();

      const provider = this.contractManager.getProvider();
      if (!provider) {
        throw new Error("Provider no disponible");
      }

      const balance = await chainReadClient.read<bigint>(
        () => geodeContract.balanceOf(userAddress),
        { label: "InventoryFacade.geodeBalance" },
      );
      if (balance === 0n) {
        logger.info("Balance 0, no geodes in wallet");
        return [];
      }

      const currentBlock = await chainReadClient.read(
        () => provider.getBlockNumber(),
        { label: "InventoryFacade.currentBlock" },
      );
      const startBlock = getDeploymentBlock(currentBlock);

      logger.debug(
        `Buscando eventos desde bloque ${startBlock} hasta ${currentBlock} (balance: ${balance})`,
      );

      // Phase 1: Scan GeodeForged events (fast)
      let allForgedEvents = await this.searchForgedEventsInChunks(
        forgeContract,
        userAddress,
        startBlock,
        currentBlock,
      );

      logger.info(
        `✅ Encontrados ${allForgedEvents.length} eventos GeodeForged`,
      );

      // Fallback: scan GeodeNFT Transfer events if GeodeForged is empty
      if (allForgedEvents.length === 0) {
        logger.info("GeodeForged empty, trying Transfer events on GeodeNFT");
        allForgedEvents = await this.searchTransferEventsInChunks(
          geodeContract,
          userAddress,
          startBlock,
          currentBlock,
        );
        logger.info(
          `✅ Fallback: ${allForgedEvents.length} Transfer events found`,
        );
      }

      if (allForgedEvents.length === 0) {
        return [];
      }

      // Phase 2: Single batch scan for GeodeHatched events
      const hatchedGeodeIds = await this.batchCheckHatched(
        forgeContract,
        userAddress,
        startBlock,
        currentBlock,
      );
      logger.info(`Hatched geodes: ${hatchedGeodeIds.size}`);

      // Phase 3: Build event map with timestamps
      const geodeEventsMap = new Map<string, any>();
      const blockTimestampsCache = new Map<number, number>();

      for (const event of allForgedEvents as any[]) {
        // GeodeForged uses args.geodeId; ERC721 Transfer uses args.tokenId
        const geodeId = event.args?.geodeId ?? event.args?.tokenId;
        if (!geodeId) continue;

        let timestamp: number;
        if (blockTimestampsCache.has(event.blockNumber)) {
          timestamp = blockTimestampsCache.get(event.blockNumber)!;
        } else {
          try {
            const block = await chainReadClient.read<{ timestamp: number }>(
              () => event.getBlock(),
              { label: `InventoryFacade.block:${event.blockNumber}` },
            );
            timestamp = Number(block.timestamp);
            blockTimestampsCache.set(event.blockNumber, timestamp);
          } catch {
            timestamp = Math.floor(Date.now() / 1000);
          }
        }

        geodeEventsMap.set(geodeId.toString(), { ...event, timestamp });
      }

      const geodeIds = Array.from(geodeEventsMap.keys()).map((id) =>
        BigInt(id),
      );

      // Phase 4: Batch verify ownership + load data (respect rate limits)
      const BATCH_SIZE = 3;
      const geodes: GeodeInventoryInfo[] = [];

      for (let i = 0; i < geodeIds.length; i += BATCH_SIZE) {
        const batch = geodeIds.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (id) => {
            try {
              return await this.loadSingleGeode(
                geodeContract,
                id,
                userAddress,
                geodeEventsMap,
                hatchedGeodeIds,
              );
            } catch (error) {
              logger.warn(`Error cargando geoda ${id}`, { error });
              return null;
            }
          }),
        );
        for (const geode of batchResults) {
          if (geode) {
            geodes.push(geode);
            options?.onProgress?.(geodes);
          }
        }
      }

      logger.info(`✅ Cargadas ${geodes.length} geodas activas`);
      return geodes;
    } catch (error) {
      logger.error("Error cargando geodas del usuario", error);
      throw error;
    }
  }

  private async searchTransferEventsInChunks(
    geodeContract: ReturnType<typeof this.contractManager.getGeodeNFT>,
    userAddress: Address,
    startBlock: number,
    currentBlock: number,
  ): Promise<unknown[]> {
    logger.debug("searchTransferEventsInChunks start", {
      geodeContractAddress: (geodeContract as any).address,
      userAddress,
      startBlock,
      currentBlock,
    });
    return chainReadClient.readEventChunks({
      label: "InventoryFacade.GeodeNFT.Transfer",
      fromBlock: startBlock,
      toBlock: currentBlock,
      direction: "desc",
      query: async (from, to) => {
        logger.debug(`Buscando Transfer chunk: bloques ${from} - ${to}`);
        const ethersContract = (geodeContract as any).contract;
        if (!ethersContract?.filters?.Transfer) {
          logger.warn("GeodeNFT missing Transfer filter");
          return [];
        }
        // ERC721 Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
        // Filter for transfers TO the user (minting or receiving)
        const filter = ethersContract.filters.Transfer(null, userAddress);
        const events = await ethersContract.queryFilter(filter, from, to);
        logger.debug(`Transfer chunk result: ${events.length} events`);
        return events;
      },
    });
  }

  private async searchForgedEventsInChunks(
    forgeContract: ReturnType<typeof this.contractManager.getForgeFactory>,
    userAddress: Address,
    startBlock: number,
    currentBlock: number,
  ): Promise<unknown[]> {
    logger.debug("searchForgedEventsInChunks start", {
      forgeContractAddress: (forgeContract as any).address,
      userAddress,
      startBlock,
      currentBlock,
    });
    return chainReadClient.readEventChunks({
      label: "InventoryFacade.GeodeForged",
      fromBlock: startBlock,
      toBlock: currentBlock,
      direction: "desc",
      query: async (from, to) => {
        logger.debug(`Buscando chunk: bloques ${from} - ${to}`);
        const ethersContract = (forgeContract as any).contract;
        if (!ethersContract?.filters?.GeodeForged) {
          logger.warn("ForgeContract missing GeodeForged filter");
          return [];
        }
        const filter = ethersContract.filters.GeodeForged(userAddress);
        logger.debug("Filter created", { filterTopics: filter?.topics });
        const events = await ethersContract.queryFilter(filter, from, to);
        logger.debug(`Chunk result: ${events.length} events`);
        for (const ev of events) {
          logger.debug("Event args", {
            geodeId: (ev as any).args?.geodeId?.toString?.(),
            user: (ev as any).args?.user,
          });
        }
        return events;
      },
    });
  }

  private async loadSingleGeode(
    geodeContract: ReturnType<typeof this.contractManager.getGeodeNFT>,
    id: bigint,
    userAddress: Address,
    geodeEventsMap: Map<string, any>,
    hatchedGeodeIds: Set<string>,
  ): Promise<GeodeInventoryInfo | null> {
    let owner: string;
    try {
      owner = await chainReadClient.read(() => geodeContract.ownerOf(id), {
        label: `InventoryFacade.ownerOf:${id.toString()}`,
      });
    } catch (ownerError) {
      const msg = ownerError instanceof Error ? ownerError.message : "";
      if (
        msg.includes("invalid token ID") ||
        msg.includes("nonexistent token")
      ) {
        return null;
      }
      throw ownerError;
    }

    if (owner.toLowerCase() !== userAddress.toLowerCase()) return null;

    const info = await chainReadClient.read<{
      category: bigint | number;
      axieClass: bigint | number;
    }>(() => geodeContract.getGeodeInfo(id), {
      label: `InventoryFacade.getGeodeInfo:${id.toString()}`,
    });

    const category = Number(info.category) as GeodeCategory;
    const axieClass = Number(info.axieClass) as AxieClass;

    const event = geodeEventsMap.get(id.toString());
    const forgeDate = event?.timestamp || Math.floor(Date.now() / 1000);
    const creator = event?.args?.user || userAddress;

    const categoryInfo = CATEGORY_INFO[category];
    const classInfo = AXIE_CLASS_INFO[axieClass];
    const fullName = getGeodeName(category, axieClass);

    const hatchTime = forgeDate + 60;
    const now = Math.floor(Date.now() / 1000);
    const isHatched = hatchedGeodeIds.has(id.toString());

    const categoryPowerMap: Record<GeodeCategory, number> = {
      [GeodeCategory.PETIT]: 75,
      [GeodeCategory.ALTO]: 125,
      [GeodeCategory.ANIMAL]: 165,
      [GeodeCategory.ULTRAMECH]: 165,
      [GeodeCategory.TANQUE]: 250,
    };

    return {
      id,
      category,
      axieClass,
      categoryName: categoryInfo.name,
      className: classInfo.displayName,
      fullName,
      owner: creator,
      createdAt: forgeDate,
      hatchTime,
      isHatched,
      canHatch: now >= hatchTime,
      miningPower: categoryPowerMap[category] || 75,
      efficiency: 80,
      isStaked: false,
    };
  }

  private async batchCheckHatched(
    forgeContract: ReturnType<typeof this.contractManager.getForgeFactory>,
    userAddress: Address,
    startBlock: number,
    currentBlock: number,
  ): Promise<Set<string>> {
    const hatched = new Set<string>();
    try {
      const ethersContract = (forgeContract as any).contract;
      if (!ethersContract?.filters?.GeodeHatched) return hatched;

      const filter = ethersContract.filters.GeodeHatched(userAddress);
      const events = await chainReadClient.readEventChunks({
        label: "InventoryFacade.GeodeHatched.batch",
        fromBlock: startBlock,
        toBlock: currentBlock,
        direction: "desc",
        query: (from, to) => ethersContract.queryFilter(filter, from, to),
      });

      for (const event of events as any[]) {
        const geodeId = event.args?.geodeId;
        if (geodeId) hatched.add(geodeId.toString());
      }
    } catch (error) {
      logger.warn("Error batch-checking hatched geodes", { error });
    }
    return hatched;
  }
}
