/**
 * Servicio para interactuar con CoreMiner NFTs
 * Gestiona la carga y metadatos de los mineros
 */

import { ethers } from 'ethers';
import { CORE_MINER_ABI } from '@/lib/abis';
import type { CoreMiner } from '@/types/game';
import { MinerType, GeodeStage, AxieType, Rarity } from '@/types/game';

interface MinerMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
}

interface CoreMinerNFT extends CoreMiner {
  metadata: MinerMetadata;
}

export class MinerService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private metadataCache: Map<string, MinerMetadata> = new Map();

  constructor(contractAddress: string, provider: ethers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress,
      CORE_MINER_ABI,
      provider
    );
  }

  /**
   * Obtiene todos los mineros de una wallet
   */
  async getMinersFromWallet(walletAddress: string): Promise<CoreMinerNFT[]> {
    try {
      // 1. Obtener balance de mineros
      const balance = await this.contract.balanceOf(walletAddress);
      const balanceNumber = Number(balance);

      if (balanceNumber === 0) {
        return [];
      }

      // 2. Obtener todos los token IDs
      const tokenIds: bigint[] = [];
      for (let i = 0; i < balanceNumber; i++) {
        const tokenId = await this.contract.tokenOfOwnerByIndex(walletAddress, i);
        tokenIds.push(tokenId);
      }

      // 3. Obtener datos de cada minero
      const miners = await Promise.all(
        tokenIds.map(tokenId => this.getMinerData(tokenId, walletAddress))
      );

      return miners.filter(miner => miner !== null) as CoreMinerNFT[];
    } catch (error) {
      console.error('Error fetching miners from wallet:', error);
      throw new Error('Failed to fetch miners from wallet');
    }
  }

  /**
   * Obtiene los datos completos de un minero
   */
  private async getMinerData(
    tokenId: bigint,
    owner: string
  ): Promise<CoreMinerNFT | null> {
    try {
      // 1. Obtener datos on-chain (ahora incluye minerNameIndex)
      const minerData = await this.contract.getMinerData(tokenId);

      // 2. Extraer minerType y minerNameIndex
      const minerType = Number(minerData.minerType);
      const minerNameIndex = Number(minerData.minerNameIndex);

      // 3. Obtener nombre real del miner usando el helper
      const { getMinerName } = await import('@/lib/utils/minerNames');
      const realMinerName = getMinerName(minerType, minerNameIndex);

      // 4. Obtener metadatos
      const metadata = await this.getMinerMetadata(tokenId, minerData);

      // 5. Determinar stage y axieType desde minerType
      const { stage, axieType } = this.getMinerTypeMapping(minerType);

      return {
        tokenId,
        name: realMinerName, // ← Ahora usamos el nombre real
        stage,
        axieType,
        rarity: this.calculateRarity(minerData.power, minerData.efficiency) as any,
        miningPower: Number(minerData.power),
        efficiency: Number(minerData.efficiency),
        collectionBonus: 0, // TODO: Calcular desde contratos
        repairCost: 3, // 3% por defecto
        owner,
        isMining: false, // TODO: Verificar si está en MiningScheduler
        lastClaimTime: 0, // TODO: Obtener desde MiningScheduler
        totalMined: 0n, // TODO: Obtener desde MiningScheduler
        durability: minerData.durability,
        level: minerData.level,
        experience: minerData.experience,
        isVoracious: minerData.isVoracious,
        lastFed: Number(minerData.lastFed),
        minerType: minerData.minerType as MinerType,
        metadata,
      };
    } catch (error) {
      console.error(`Error fetching miner ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * Mapea minerType del contrato a stage y axieType
   */
  private getMinerTypeMapping(minerType: number): { stage: GeodeStage; axieType: AxieType } {
    // Por ahora retornamos valores por defecto basados en minerType
    // TODO: Cuando se implemente el sistema completo, esto debe leer desde el contrato
    const axieTypeMap: Record<number, AxieType> = {
      0: AxieType.BEAST,
      1: AxieType.AQUATIC,
      2: AxieType.BIRD,
      3: AxieType.REPTILE,
      4: AxieType.BUG,
      5: AxieType.PLANT,
      6: AxieType.MECH,
      7: AxieType.DUSK,
      8: AxieType.DAWN,
    };
    
    return {
      stage: GeodeStage.PETIT, // Por defecto, hasta tener el dato del contrato
      axieType: axieTypeMap[minerType] || AxieType.BEAST,
    };
  }

  /**
   * Obtiene metadatos de un minero
   */
  private async getMinerMetadata(
    tokenId: bigint,
    minerData: any
  ): Promise<MinerMetadata> {
    const tokenIdStr = tokenId.toString();

    // Verificar cache
    const cached = this.metadataCache.get(tokenIdStr);
    if (cached) {
      return cached;
    }

    try {
      // Obtener URI del token
      const tokenURI = await this.contract.tokenURI(tokenId);

      // Si es IPFS, obtener metadatos
      if (tokenURI.startsWith('ipfs://')) {
        const metadata = await this.fetchIPFSMetadata(tokenURI);
        this.metadataCache.set(tokenIdStr, metadata);
        return metadata;
      }

      // Si es HTTP, fetch directo
      if (tokenURI.startsWith('http')) {
        const response = await fetch(tokenURI);
        const metadata = await response.json();
        this.metadataCache.set(tokenIdStr, metadata);
        return metadata;
      }

      // Fallback: generar metadatos desde datos on-chain
      return this.generateMetadataFromChainData(tokenId, minerData);
    } catch (error) {
      console.error(`Error fetching metadata for miner ${tokenId}:`, error);
      return this.generateMetadataFromChainData(tokenId, minerData);
    }
  }

  /**
   * Obtiene metadatos desde IPFS
   */
  private async fetchIPFSMetadata(ipfsURI: string): Promise<MinerMetadata> {
    // Convertir ipfs:// a gateway HTTP
    const httpURL = ipfsURI.replace(
      'ipfs://',
      'https://gateway.pinata.cloud/ipfs/'
    );

    const response = await fetch(httpURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch IPFS metadata: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Genera metadatos desde datos on-chain (fallback)
   */
  private generateMetadataFromChainData(
    tokenId: bigint,
    minerData: any
  ): MinerMetadata {
    const minerTypeName = this.getMinerTypeName(minerData.minerType);
    const rarity = this.calculateRarity(minerData.power, minerData.efficiency);

    return {
      name: `CoreMiner ${minerTypeName} #${tokenId}`,
      description: `Un poderoso minero de tipo ${minerTypeName} con habilidades únicas.`,
      image: this.getMinerImage(minerData.minerType, rarity),
      attributes: [
        {
          trait_type: 'Type',
          value: minerTypeName,
        },
        {
          trait_type: 'Rarity',
          value: rarity,
        },
        {
          trait_type: 'Power',
          value: Number(minerData.power),
          display_type: 'number',
        },
        {
          trait_type: 'Efficiency',
          value: Number(minerData.efficiency),
          display_type: 'number',
        },
        {
          trait_type: 'Durability',
          value: Number(minerData.durability),
          display_type: 'number',
        },
        {
          trait_type: 'Level',
          value: Number(minerData.level),
          display_type: 'number',
        },
        {
          trait_type: 'Experience',
          value: Number(minerData.experience),
          display_type: 'number',
        },
        {
          trait_type: 'Is Voracious',
          value: minerData.isVoracious ? 'Yes' : 'No',
        },
      ],
    };
  }

  /**
   * Obtiene el nombre del tipo de minero
   */
  private getMinerTypeName(minerType: number): string {
    const types: Record<number, string> = {
      0: 'Bestia',
      1: 'Ave',
      2: 'Oscuridad',
      3: 'Aqua',
      4: 'Planta',
      5: 'Mech',
      6: 'Ultramech',
      7: 'Reptil',
      8: 'Dawn',
      9: 'Dusk',
      10: 'Bicho',
      11: 'Tanque',
    };
    return types[minerType] || 'Unknown';
  }

  /**
   * Calcula la rareza basada en stats
   */
  private calculateRarity(power: bigint, efficiency: bigint): Rarity {
    const totalStats = Number(power) + Number(efficiency);

    if (totalStats >= 180) return Rarity.LEGENDARY;
    if (totalStats >= 150) return Rarity.EPIC;
    if (totalStats >= 120) return Rarity.VERY_RARE;
    if (totalStats >= 90) return Rarity.RARE;
    if (totalStats >= 60) return Rarity.UNCOMMON;
    return Rarity.COMMON;
  }

  /**
   * Obtiene la URL de la imagen del minero
   */
  private getMinerImage(minerType: number, rarity: string): string {
    // URLs de IPFS para imágenes base
    const baseImages: Record<number, string> = {
      0: 'ipfs://QmBestia/miner-bestia.gif',
      1: 'ipfs://QmAve/miner-ave.gif',
      2: 'ipfs://QmOscuridad/miner-oscuridad.gif',
      3: 'ipfs://QmAqua/miner-aqua.gif',
      4: 'ipfs://QmPlanta/miner-planta.gif',
      5: 'ipfs://QmMech/miner-mech.gif',
      6: 'ipfs://QmUltramech/miner-ultramech.gif',
      7: 'ipfs://QmReptil/miner-reptil.gif',
      8: 'ipfs://QmDawn/miner-dawn.gif',
      9: 'ipfs://QmDusk/miner-dusk.gif',
      10: 'ipfs://QmBicho/miner-bicho.gif',
      11: 'ipfs://QmTanque/miner-tanque.gif',
    };

    // Convertir a gateway HTTP para mejor performance
    const ipfsURL = baseImages[minerType] || baseImages[0];
    return ipfsURL.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }

  /**
   * Obtiene mineros por tipo
   */
  async getMinersByType(
    walletAddress: string,
    minerType: MinerType
  ): Promise<CoreMinerNFT[]> {
    const allMiners = await this.getMinersFromWallet(walletAddress);
    return allMiners.filter(miner => miner.minerType === minerType);
  }

  /**
   * Obtiene mineros por rareza
   */
  async getMinersByRarity(
    walletAddress: string,
    rarity: string
  ): Promise<CoreMinerNFT[]> {
    const allMiners = await this.getMinersFromWallet(walletAddress);
    return allMiners.filter(
      miner => miner.metadata.attributes.find(
        attr => attr.trait_type === 'Rarity' && attr.value === rarity
      )
    );
  }

  /**
   * Obtiene mineros voraces
   */
  async getVoraciousMiners(walletAddress: string): Promise<CoreMinerNFT[]> {
    const allMiners = await this.getMinersFromWallet(walletAddress);
    return allMiners.filter(miner => miner.isVoracious);
  }

  /**
   * Obtiene mineros que necesitan alimentación
   */
  async getMinersNeedingFeed(walletAddress: string): Promise<CoreMinerNFT[]> {
    const allMiners = await this.getMinersFromWallet(walletAddress);
    const now = Math.floor(Date.now() / 1000);
    const feedingPeriod = 7 * 24 * 60 * 60; // 7 días

    return allMiners.filter(
      miner => miner.isVoracious && (now - miner.lastFed) >= feedingPeriod
    );
  }

  /**
   * Calcula el poder total de minería
   */
  calculateTotalMiningPower(miners: CoreMinerNFT[]): number {
    return miners.reduce((total, miner) => total + miner.miningPower, 0);
  }

  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.metadataCache.clear();
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createMinerService(
  contractAddress: string,
  provider: ethers.Provider
): MinerService {
  return new MinerService(contractAddress, provider);
}
