/**
 * NFTFacade - Facade para operaciones con NFTs (Miners y Axies)
 *
 * Unifica el acceso a CoreMiner NFT y Axie NFT bajo una única interfaz.
 * Implementa el patrón Facade para simplificar operaciones complejas.
 *
 * @pattern Facade (GoF)
 * @principle SRP - Responsabilidad única: gestión de NFTs
 */

import { Contract } from "ethers";
import type { Address } from "viem";
import { getDeploymentBlock } from "@/lib/config/deployment.config";
import type { ContractManager } from "@/lib/contracts/ContractManager";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import { chainReadClient } from "@/lib/utils/network/chainReadClient";

const logger = createServiceLogger("NFTFacade");
const RONIN_TESTNET_ID = 202601;
const MOCK_AXIE_NFT_ADDRESS = "0xC1cc4ac6f5d6Bf893EF44f6eDA0Dc7d019222b38";
const MOCK_AXIE_NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function axieClass(uint256 tokenId) view returns (uint8)",
] as const;
const AXIE_CLASS_NAMES = [
  "Beast",
  "Aqua",
  "Bird",
  "Reptile",
  "Bug",
  "Plant",
  "Mech",
  "Dusk",
  "Dawn",
] as const;

/**
 * Información de un Core Miner NFT
 * REFACTORIZADO: Interfaz simplificada que usa datos del contrato + assets locales
 */
export interface CoreMinerNFT {
  tokenId: bigint;
  name: string;

  // Datos del contrato CoreMinerNFT.sol
  category: number; // 0-4: PETIT, ALTO, ANIMAL, ULTRAMECH, TANK
  minerType: number; // 0-8: Beast, Aqua, Bird, Reptile, Bug, Plant, Mech, Dusk, Dawn
  minerIndex: number; // 0-6: índice específico del miner

  // Assets locales
  videoUrl?: string; // Ruta al video local: /assets/miners/PETIT/PETIT AQUA/GOTA RAPIDA.mp4

  // Stats de minería
  miningPower: number;
  efficiency: number;

  // Estado
  owner: string;
  isMining: boolean;
  totalMined?: bigint;

  metadata: {
    name: string;
    description: string;
    image?: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
      display_type?: string;
    }>;
  };
}

/**
 * Información de un Axie NFT
 */
export interface AxieNFT {
  tokenId: string;
  owner: string;
  isStaked: boolean;
  metadata: {
    id: string;
    name: string;
    image: string;
    class: string;
    genes: string;
    stats: {
      hp: number;
      speed: number;
      skill: number;
      morale: number;
    };
  };
}

/**
 * Facade para gestionar operaciones con NFTs
 */
export class NFTFacade {
  constructor(private contractManager: ContractManager) {}

  /**
   * Obtiene todos los Core Miners de una wallet
   *
   * @param address - Dirección de la wallet
   * @returns Array de Core Miners NFT
   */
  async getMinersFromWallet(
    address: Address,
    options?: { onProgress?: (miners: CoreMinerNFT[]) => void },
  ): Promise<CoreMinerNFT[]> {
    logger.info("Obteniendo mineros de wallet", { address });

    try {
      const provider = this.contractManager.getProvider();
      if (!provider) {
        throw new Error("Provider not available");
      }

      const minerContract = this.contractManager.getCoreMinerNFT();

      const balance = await chainReadClient.read<bigint>(
        () => minerContract.balanceOf(address),
        { label: "NFTFacade.minerBalance" },
      );
      if (balance === 0n) {
        logger.info("Balance 0, no miners in wallet");
        return [];
      }

      const currentBlock = await chainReadClient.read(
        () => provider.getBlockNumber(),
        { label: "NFTFacade.currentBlock" },
      );
      const fromBlock = getDeploymentBlock(currentBlock);

      logger.debug("Scanning MinerMinted events", {
        fromBlock,
        currentBlock,
        balance: balance.toString(),
      });

      // Phase 1: Scan events to collect candidate tokenIds (fast, no ownerOf)
      const candidateTokenIds: bigint[] = [];
      await chainReadClient.readEventChunks({
        label: "NFTFacade.MinerMinted",
        fromBlock,
        toBlock: currentBlock,
        direction: "desc",
        query: async (from, to) => {
          const filter = minerContract.contract.filters.MinerMinted(address);
          const events = await minerContract.contract.queryFilter(
            filter,
            from,
            to,
          );
          for (const event of events) {
            const tokenId = event.args?.tokenId;
            if (tokenId) candidateTokenIds.push(tokenId);
          }
          return events;
        },
      });

      logger.info("Candidate tokenIds from events", {
        count: candidateTokenIds.length,
      });

      // Phase 2: Batch verify ownership + load data in parallel (with concurrency limit)
      const BATCH_SIZE = 5;
      const miners: CoreMinerNFT[] = [];

      for (let i = 0; i < candidateTokenIds.length; i += BATCH_SIZE) {
        const batch = candidateTokenIds.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (tokenId) => {
            try {
              const owner = await chainReadClient.read<string>(
                () => minerContract.ownerOf(tokenId),
                { label: `NFTFacade.ownerOf:${tokenId.toString()}` },
              );
              if (owner.toLowerCase() !== address.toLowerCase()) return null;
              return await this.getMinerData(tokenId, address);
            } catch {
              logger.debug(`Token ${tokenId} burned or nonexistent`);
              return null;
            }
          }),
        );
        for (const miner of batchResults) {
          if (miner) {
            miners.push(miner);
            options?.onProgress?.(miners);
          }
        }
      }

      logger.info("Miners loaded", { count: miners.length });
      return miners;
    } catch (error) {
      logger.error("Error obteniendo mineros", error);
      throw error;
    }
  }

  /**
   * Obtiene datos completos de un minero específico
   * REFACTORIZADO: Usa datos locales en lugar de IPFS
   */
  private async getMinerData(
    tokenId: bigint,
    owner: Address,
  ): Promise<CoreMinerNFT | null> {
    try {
      const minerContract = this.contractManager.getCoreMinerNFT();
      const minerData = await chainReadClient.read<{
        category: bigint | number;
        minerType: bigint | number;
        minerIndex: bigint | number;
      }>(() => minerContract.getMinerData(tokenId), {
        label: `NFTFacade.getMinerData:${tokenId.toString()}`,
      });

      // Usar datos locales en lugar de IPFS
      const { getLocalMinerName, getLocalMinerVideo, getLocalMinerType } =
        await import("@/lib/utils/data/localMinerData");

      const { getMinerPower } = await import(
        "@/lib/services/LocalMetadataService"
      );

      // Extraer datos del contrato
      const category = Number(minerData.category);
      const minerType = Number(minerData.minerType);
      const minerIndex = Number(minerData.minerIndex);

      // Generar nombre, video y poder desde metadata local
      const realMinerName = await getLocalMinerName(
        category,
        minerType,
        minerIndex,
      );
      const videoUrl = await getLocalMinerVideo(
        category,
        minerType,
        minerIndex,
      );
      const power = await getMinerPower(category, minerType, minerIndex); // ✅ Poder real desde metadata
      const typeString = getLocalMinerType(minerType);

      logger.info("Miner data loaded", {
        tokenId: tokenId.toString(),
        name: realMinerName,
        category,
        minerType: typeString,
        minerIndex,
        power,
        videoUrl,
      });

      // Mapear datos del contrato a la estructura CoreMinerNFT
      return {
        tokenId,
        name: realMinerName,

        // Datos del contrato
        category,
        minerType,
        minerIndex,

        // Assets locales
        videoUrl,

        // Stats
        miningPower: power, // ✅ Ahora viene de metadata JSON
        efficiency: 100,

        // Estado
        owner,
        isMining: false,

        // Metadata
        metadata: {
          name: realMinerName,
          description: `${typeString} CoreMiner`,
          attributes: [
            { trait_type: "Category", value: category },
            { trait_type: "Type", value: typeString },
            { trait_type: "Power", value: power },
            { trait_type: "Index", value: minerIndex },
          ],
        },
      };
    } catch (error) {
      logger.warn(`Error obteniendo datos del minero ${tokenId}`, { error });
      return null;
    }
  }

  /**
   * Obtiene todos los Axies de una wallet
   *
   * @param address - Dirección de la wallet
   * @returns Array de Axies NFT
   */
  async getAxiesFromWallet(address: Address): Promise<AxieNFT[]> {
    logger.info("Obteniendo Axies de wallet", { address });

    try {
      // Validar que hay provider disponible
      const provider = this.contractManager.getProvider();
      if (!provider) {
        logger.warn("No provider available, returning empty axies array");
        return [];
      }

      // El contrato de Axie oficial solo existe en Mainnet (2020)
      // En Testnet (202601) no existe, así que retornamos array vacío
      const chainId = this.contractManager.getChainId();
      if (chainId === RONIN_TESTNET_ID) {
        return this.getMockAxiesFromWallet(address);
      }

      if (chainId !== 2020) {
        logger.info("Axie contract not available on testnet, skipping", {
          chainId,
        });
        return [];
      }

      const axieContract = this.contractManager.getAxieContract();

      // Obtener balance de Axies
      const balance = await chainReadClient.read(
        () => axieContract.balanceOf(address),
        { label: "NFTFacade.axieBalance" },
      );
      logger.debug("Balance de Axies obtenido", {
        balance: balance.toString(),
      });

      if (balance === 0n) {
        return [];
      }

      // Obtener todos los token IDs
      const axies: AxieNFT[] = [];
      for (let i = 0n; i < balance; i++) {
        try {
          const tokenId = await chainReadClient.read(
            () => axieContract.tokenOfOwnerByIndex(address, i),
            { label: `NFTFacade.axieByIndex:${i.toString()}` },
          );

          // Obtener datos del Axie
          const axieData = await chainReadClient.read(
            () => axieContract.getAxie(tokenId),
            { label: `NFTFacade.getAxie:${tokenId.toString()}` },
          );

          // Parsear genes para obtener la clase
          const axieClass = this.parseAxieClass(axieData.genes);

          // Verificar si el Axie está stakeado
          const isStaked = await this.isAxieStaked(tokenId);

          axies.push({
            tokenId: tokenId.toString(),
            owner: address,
            isStaked,
            metadata: {
              id: tokenId.toString(),
              name: `Axie #${tokenId}`,
              image: `https://axieinfinity.com/axie/${tokenId}`,
              class: axieClass,
              genes: axieData.genes.toString(),
              stats: {
                hp: 0,
                speed: 0,
                skill: 0,
                morale: 0,
              },
            },
          });
        } catch (error) {
          logger.warn("Error obteniendo Axie por índice", { index: i, error });
        }
      }

      logger.info("Axies obtenidos exitosamente", { count: axies.length });
      return axies;
    } catch (error) {
      logger.error("Error obteniendo Axies", error);
      return [];
    }
  }

  private async getMockAxiesFromWallet(address: Address): Promise<AxieNFT[]> {
    const provider = this.contractManager.getProvider();
    if (!provider) {
      logger.warn("No provider available, returning empty mock axies array");
      return [];
    }

    const mockAxieContract = new Contract(
      MOCK_AXIE_NFT_ADDRESS,
      MOCK_AXIE_NFT_ABI,
      provider,
    );

    const balance = await chainReadClient.read<bigint>(
      () => mockAxieContract.balanceOf(address),
      { label: "NFTFacade.mockAxieBalance" },
    );

    if (balance === 0n) {
      return [];
    }

    const axies: AxieNFT[] = [];
    for (let i = 0n; i < balance; i++) {
      try {
        const tokenId = await chainReadClient.read<bigint>(
          () => mockAxieContract.tokenOfOwnerByIndex(address, i),
          { label: `NFTFacade.mockAxieByIndex:${i.toString()}` },
        );
        const owner = await chainReadClient.read<string>(
          () => mockAxieContract.ownerOf(tokenId),
          { label: `NFTFacade.mockAxieOwner:${tokenId.toString()}` },
        );
        const classId = Number(
          await chainReadClient.read<bigint>(
            () => mockAxieContract.axieClass(tokenId),
            { label: `NFTFacade.mockAxieClass:${tokenId.toString()}` },
          ),
        );
        const className = AXIE_CLASS_NAMES[classId] ?? "Unknown";

        axies.push({
          tokenId: tokenId.toString(),
          owner,
          isStaked: false,
          metadata: {
            id: tokenId.toString(),
            name: `Fake ${className} Axie #${tokenId}`,
            image: "",
            class: className,
            genes: classId.toString(),
            stats: {
              hp: 0,
              speed: 0,
              skill: 0,
              morale: 0,
            },
          },
        });
      } catch (error) {
        logger.warn("Error obteniendo fake Axie por índice", {
          index: i,
          error,
        });
      }
    }

    logger.info("Fake Axies obtenidos exitosamente", { count: axies.length });
    return axies;
  }

  // Helper methods

  private mapMinerTypeToStage(minerType: number): number {
    // 0-8 son PETIT (stage 0)
    if (minerType <= 8) return 0;
    return 0;
  }

  /**
   * Verifica si un Axie está stakeado
   */
  private async isAxieStaked(axieId: bigint): Promise<boolean> {
    try {
      const stakingManager = this.contractManager.getAxieStakingManager();
      const stakeInfo = await chainReadClient.read(
        () => stakingManager.getStakeInfo(axieId),
        { label: `NFTFacade.axieStake:${axieId.toString()}` },
      );
      return stakeInfo.isStaked;
    } catch (error) {
      logger.warn("Error verificando staking de Axie", {
        axieId: axieId.toString(),
        error,
      });
      return false;
    }
  }

  /**
   * Parsea los genes de un Axie para obtener su clase
   * Los genes de Axie codifican la clase en bits específicos
   */
  private parseAxieClass(genes: bigint): string {
    // Simplificación: extraer clase de los genes
    // En Axie, la clase está codificada en los bits 0-3
    const classId = Number(genes & 0xfn) % 9;

    const classes = [
      "Beast",
      "Aquatic",
      "Plant",
      "Bird",
      "Bug",
      "Reptile",
      "Mech",
      "Dawn",
      "Dusk",
    ];
    return classes[classId] || "Unknown";
  }

  private mapMinerTypeToAxieType(minerType: number): number {
    // minerType ya representa el AxieType (0-8)
    return minerType;
  }

  private calculateRarity(power: bigint, efficiency: bigint): string {
    const totalStats = Number(power) + Number(efficiency);

    if (totalStats >= 800) return "legendary";
    if (totalStats >= 600) return "epic";
    if (totalStats >= 400) return "rare";
    return "common";
  }
}
