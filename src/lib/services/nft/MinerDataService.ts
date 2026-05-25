/**
 * MinerDataService - Enriquece datos de mineros con info de contratos
 *
 * ✅ IMPLEMENTADO: Resolución de data crítica de mineros
 * - ✅ collectionBonus: Calculado desde sinergias de sets
 * - ✅ isMining: Verificado desde MiningPool
 * - ✅ lastClaimTime: Obtenido desde sesión de minería
 * - ✅ totalMined: Leído desde stats del minero
 *
 * @pattern Service Layer (DDD)
 */

import type { Address } from "viem";
import { ContractManager } from "@/lib/contracts/ContractManager";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import type {
  MinerChainData,
  EnrichedMinerData,
  MinerEnrichmentData,
} from "./types";
import type { AxieType } from "@/types/game";

const log = createServiceLogger("MinerDataService");

export class MinerDataService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Enriquece datos de un minero con información de contratos
   *
   * Implementación completa de data enriquecida:
   * - collectionBonus: Calculado desde sinergias de sets completos
   * - isMining: Estado actual verificado en MiningPool
   * - lastClaimTime: Timestamp desde sesión activa de minería
   * - totalMined: Estadísticas históricas del minero
   *
   * @param minerId - ID del minero
   * @param owner - Dirección del propietario (para calcular collection bonus)
   * @returns Datos enriquecidos con info blockchain
   */
  async enrichMinerData(
    minerId: bigint,
    owner?: Address,
  ): Promise<MinerEnrichmentData> {
    try {
      const miningContract = this.contractManager.getMiningPool();

      // Ejecutar consultas en paralelo para optimizar
      const [isMining, sessionData, minerStats, collectionBonus] =
        await Promise.all([
          this.checkIsMining(minerId),
          this.getMiningSession(minerId),
          this.getMinerStats(minerId),
          owner ? this.calculateCollectionBonus(owner) : Promise.resolve(0),
        ]);

      return {
        collectionBonus,
        isMining,
        lastClaimTime: sessionData?.lastClaim || 0,
        totalMined: minerStats?.totalRewards || 0n,
      };
    } catch (error) {
      log.error("Failed to enrich miner data", error, {
        minerId: minerId.toString(),
        owner,
      });

      // Retornar valores por defecto en caso de error
      return {
        collectionBonus: 0,
        isMining: false,
        lastClaimTime: 0,
        totalMined: 0n,
      };
    }
  }

  /**
   * Verifica si un minero está minando actualmente
   */
  private async checkIsMining(minerId: bigint): Promise<boolean> {
    try {
      const miningContract = this.contractManager.getMiningPool();
      return await miningContract.isMining(minerId);
    } catch (error) {
      log.debug("Failed to check mining status", {
        minerId: minerId.toString(),
      });
      return false;
    }
  }

  /**
   * Obtiene datos de la sesión de minería
   */
  private async getMiningSession(minerId: bigint): Promise<{
    lastClaim: number;
    isActive: boolean;
  } | null> {
    try {
      const miningContract = this.contractManager.getMiningPool();
      const minerInfo = await miningContract.getMinerInfo(minerId);

      return {
        lastClaim: Number(minerInfo.lastMined),
        isActive: await miningContract.isMining(minerId),
      };
    } catch (error) {
      log.debug("Failed to get mining session", {
        minerId: minerId.toString(),
      });
      return null;
    }
  }

  /**
   * Obtiene estadísticas del minero
   */
  private async getMinerStats(minerId: bigint): Promise<{
    totalRewards: bigint;
  } | null> {
    try {
      const miningContract = this.contractManager.getMiningPool();
      const stats = await miningContract.getMinerStats(minerId);

      return {
        totalRewards: stats.totalRewards || 0n,
      };
    } catch (error) {
      log.debug("Failed to get miner stats", { minerId: minerId.toString() });
      return null;
    }
  }

  /**
   * Calcula collection bonus basado en sinergias de sets
   *
   * Implementa el sistema de sinergias completo:
   * 1. Obtiene todos los mineros del owner
   * 2. Extrae minerType de cada uno
   * 3. Detecta sets completos (usando SYNERGY_SETS)
   * 4. Calcula bonus total acumulado
   *
   * @param owner - Dirección del propietario
   * @returns Bonus de colección en porcentaje (0-100)
   */
  private async calculateCollectionBonus(owner: Address): Promise<number> {
    try {
      const { calculateTotalSynergyBonus } = await import(
        "@/lib/constants/synergySets"
      );
      const gameTypesModule = await import("@/types/game");
      const gameTypes = gameTypesModule;

      // Obtener contrato de CoreMiner NFT
      const minerContract = this.contractManager.getCoreMinerNFT();

      // Obtener todos los token IDs del owner
      const minerIds = await minerContract.tokensOfOwner(owner);

      if (minerIds.length === 0) {
        return 0;
      }

      // Mapeo de minerType (number) a AxieType (enum string)
      const minerTypeToAxieType: Record<number, AxieType> = {
        0: gameTypes.AxieType.BEAST,
        1: gameTypes.AxieType.AQUATIC,
        2: gameTypes.AxieType.BIRD,
        3: gameTypes.AxieType.REPTILE,
        4: gameTypes.AxieType.BUG,
        5: gameTypes.AxieType.PLANT,
        6: gameTypes.AxieType.MECH,
        7: gameTypes.AxieType.MECH, // ULTRAMECH mapped to MECH
        8: gameTypes.AxieType.DUSK,
        9: gameTypes.AxieType.DAWN,
        10: gameTypes.AxieType.PLANT, // TANQUE mapped to PLANT
      };

      // Obtener minerType de cada minero en paralelo
      const minerDataPromises = minerIds.map(async (minerId: bigint) => {
        try {
          const minerData = await minerContract.getMinerData(minerId);
          const minerTypeNum = Number(minerData.minerType);
          return minerTypeToAxieType[minerTypeNum] || null;
        } catch {
          return null;
        }
      });

      const minerTypes = (await Promise.all(minerDataPromises)).filter(
        (type: AxieType | null): type is AxieType => type !== null,
      );

      if (minerTypes.length === 0) {
        return 0;
      }

      // Calcular bonus total de sinergias
      const synergyBonus = calculateTotalSynergyBonus(minerTypes);

      log.debug("Collection bonus calculated", {
        owner,
        minersCount: minerIds.length,
        synergyBonus,
      });

      return synergyBonus;
    } catch (error) {
      log.debug("Failed to calculate collection bonus", { owner });
      return 0;
    }
  }

  /**
   * Enriquece múltiples mineros en batch
   *
   * @param miners - Array de {minerId, owner}
   * @returns Map de minerId → enrichment data
   */
  async enrichMinersBatch(
    miners: Array<{ minerId: bigint; owner?: Address }>,
  ): Promise<Map<bigint, MinerEnrichmentData>> {
    const enrichmentMap = new Map<bigint, MinerEnrichmentData>();

    // Procesar en paralelo para optimizar
    const enrichments = await Promise.all(
      miners.map(({ minerId, owner }) =>
        this.enrichMinerData(minerId, owner).then((data) => ({
          minerId,
          data,
        })),
      ),
    );

    enrichments.forEach(({ minerId, data }) => {
      enrichmentMap.set(minerId, data);
    });

    return enrichmentMap;
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createMinerDataService(
  contractManager: ContractManager,
): MinerDataService {
  return new MinerDataService(contractManager);
}
