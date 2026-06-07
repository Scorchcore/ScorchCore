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
import {
  chainReadClient,
  isRangeTooLargeError,
} from "../utils/network/chainReadClient";

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
   * Obtiene geodas del usuario con carga bajo demanda (streaming).
   * Escanea eventos chunk por chunk desde el más reciente, verificando
   * ownership inmediatamente y deteniéndose al alcanzar el límite.
   */
  async getUserGeodes(
    userAddress: Address,
    options?: {
      limit?: number;
      offset?: number;
      onProgress?: (geodes: GeodeInventoryInfo[]) => void;
    },
  ): Promise<GeodeInventoryInfo[]> {
    logger.info("📦 Cargando geodas del usuario (streaming)", { userAddress });

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

      const limit = options?.limit ?? Number(balance);
      const offset = options?.offset ?? 0;
      const targetCount = limit + offset;

      logger.debug(
        `Streaming desde bloque ${startBlock} hasta ${currentBlock} (balance: ${balance}, target: ${targetCount})`,
      );

      const allGeodes = await this.streamGeodesFromEvents(
        geodeContract,
        forgeContract,
        userAddress,
        startBlock,
        currentBlock,
        targetCount,
        options?.onProgress,
      );

      const result = allGeodes.slice(offset, offset + limit);
      logger.info(`✅ Cargadas ${result.length} geodas (offset=${offset}, limit=${limit})`);
      return result;
    } catch (error) {
      logger.error("Error cargando geodas del usuario", error);
      throw error;
    }
  }

  /**
   * Escanea eventos chunk por chunk desde el más reciente.
   * Para cada chunk extrae geodeIds, verifica ownership y carga datos.
   * Se detiene tan pronto como tiene targetCount geodas verificadas.
   */
  private async streamGeodesFromEvents(
    geodeContract: ReturnType<typeof this.contractManager.getGeodeNFT>,
    forgeContract: ReturnType<typeof this.contractManager.getForgeFactory>,
    userAddress: Address,
    startBlock: number,
    currentBlock: number,
    targetCount: number,
    onProgress?: (geodes: GeodeInventoryInfo[]) => void,
  ): Promise<GeodeInventoryInfo[]> {
    const geodes: GeodeInventoryInfo[] = [];
    const seenGeodeIds = new Set<string>();
    const blockTimestampsCache = new Map<number, number>();

    const trySource = async (
      label: string,
      createFilter: (ethersContract: any) => any,
      contract: ReturnType<typeof this.contractManager.getGeodeNFT> | ReturnType<typeof this.contractManager.getForgeFactory>,
    ) => {
      let chunkSize = 50000;
      const minChunkSize = 499;
      let to = currentBlock;

      while (to >= startBlock && geodes.length < targetCount) {
        const from = Math.max(startBlock, to - chunkSize);

        try {
          const events = await chainReadClient.read(
            async () => {
              const ethersContract = (contract as any).contract;
              if (!ethersContract?.filters) return [];
              const filter = createFilter(ethersContract);
              if (!filter) return [];
              return await ethersContract.queryFilter(filter, from, to);
            },
            { label: `InventoryFacade.${label}:${from}-${to}`, kind: "event" },
          );

          const candidates: { id: bigint; event: any }[] = [];
          for (const event of events as any[]) {
            const geodeId = event.args?.geodeId ?? event.args?.tokenId;
            if (!geodeId || seenGeodeIds.has(geodeId.toString())) continue;
            seenGeodeIds.add(geodeId.toString());
            candidates.push({ id: BigInt(geodeId), event });
          }

          if (candidates.length > 0) {
            const BATCH_SIZE = 3;
            for (let i = 0; i < candidates.length && geodes.length < targetCount; i += BATCH_SIZE) {
              const batch = candidates.slice(i, i + BATCH_SIZE);
              const batchResults = await Promise.all(
                batch.map(({ id, event }) =>
                  this.loadSingleGeodeStreamed(
                    geodeContract,
                    forgeContract,
                    id,
                    userAddress,
                    event,
                    blockTimestampsCache,
                  ),
                ),
              );

              for (const geode of batchResults) {
                if (geode) {
                  geodes.push(geode);
                  onProgress?.([...geodes]);
                  if (geodes.length >= targetCount) break;
                }
              }
            }
          }

          to = from - 1;
        } catch (error) {
          if (isRangeTooLargeError(error) && chunkSize > minChunkSize) {
            chunkSize = Math.max(minChunkSize, Math.floor(chunkSize / 2));
            continue;
          }
          throw error;
        }
      }
    };

    // Phase 1: GeodeForged events (newest first)
    await trySource(
      "GeodeForged",
      (c: any) => c.filters.GeodeForged?.(userAddress) ?? null,
      forgeContract,
    );

    // Phase 2: Transfer events fallback
    if (geodes.length < targetCount) {
      await trySource(
        "Transfer",
        (c: any) => c.filters.Transfer?.(null, userAddress) ?? null,
        geodeContract,
      );
    }

    return geodes;
  }

  private async loadSingleGeodeStreamed(
    geodeContract: ReturnType<typeof this.contractManager.getGeodeNFT>,
    forgeContract: ReturnType<typeof this.contractManager.getForgeFactory>,
    id: bigint,
    userAddress: Address,
    event: any,
    blockTimestampsCache: Map<number, number>,
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

    const info = await chainReadClient.read<{
      category: bigint | number;
      axieClass: bigint | number;
    }>(() => geodeContract.getGeodeInfo(id), {
      label: `InventoryFacade.getGeodeInfo:${id.toString()}`,
    });

    const category = Number(info.category) as GeodeCategory;
    const axieClass = Number(info.axieClass) as AxieClass;

    const forgeDate = timestamp;
    const creator = event.args?.user || userAddress;

    const categoryInfo = CATEGORY_INFO[category];
    const classInfo = AXIE_CLASS_INFO[axieClass];
    const fullName = getGeodeName(category, axieClass);

    const hatchTime = forgeDate + 60;
    const now = Math.floor(Date.now() / 1000);
    const canHatch = now >= hatchTime;

    let isHatched = false;
    if (canHatch) {
      try {
        const hatched = await chainReadClient.read(
          () => (forgeContract as any).isGeodeHatched?.(id),
          { label: `InventoryFacade.isHatched:${id.toString()}` },
        );
        isHatched = !!hatched;
      } catch {
        isHatched = false;
      }
    }

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
      canHatch,
      miningPower: categoryPowerMap[category] || 75,
      efficiency: 80,
      isStaked: false,
    };
  }
}
