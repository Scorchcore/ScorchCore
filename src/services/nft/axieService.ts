/**
 * Servicio para interactuar con Axies NFT
 * Permite cargar Axies desde la wallet del usuario
 */

import { ethers } from 'ethers';
import type { StakedAxie } from '@/types/game';
import { AXIE_ABI } from '@/lib/abis';

interface AxieMetadata {
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
}

interface AxieNFT {
  tokenId: string;
  owner: string;
  metadata: AxieMetadata;
  isStaked: boolean;
}

// Dirección del contrato de Axie en Ronin
const AXIE_CONTRACT_ADDRESS = '0x32950db2a7164aE833121501C797D79E7B79d74C';

export class AxieService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private cache: Map<string, AxieMetadata> = new Map();

  constructor(provider: ethers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      AXIE_CONTRACT_ADDRESS,
      AXIE_ABI,
      provider
    );
  }

  /**
   * Obtiene todos los Axies de una wallet
   */
  async getAxiesFromWallet(walletAddress: string): Promise<AxieNFT[]> {
    try {
      // Verificar si el contrato está desplegado
      const code = await this.contract.runner?.provider?.getCode(await this.contract.getAddress());
      if (!code || code === '0x') {
        console.warn('⚠️ MockAxieNFT no está desplegado en esta red');
        return [];
      }

      // 1. Obtener balance de Axies
      const balance = await this.contract.balanceOf(walletAddress);
      const balanceNumber = Number(balance);

      if (balanceNumber === 0) {
        return [];
      }

      // 2. Obtener todos los token IDs
      const tokenIds: string[] = [];
      for (let i = 0; i < balanceNumber; i++) {
        const tokenId = await this.contract.tokenOfOwnerByIndex(walletAddress, i);
        tokenIds.push(tokenId.toString());
      }

      // 3. Obtener metadatos de cada Axie
      const axies = await Promise.all(
        tokenIds.map(tokenId => this.getAxieData(tokenId, walletAddress))
      );

      return axies.filter(axie => axie !== null) as AxieNFT[];
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar Axies (contrato no disponible):', error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  }

  /**
   * Obtiene los datos de un Axie específico
   */
  private async getAxieData(
    tokenId: string,
    owner: string
  ): Promise<AxieNFT | null> {
    try {
      // Verificar cache primero
      const cachedMetadata = this.cache.get(tokenId);
      if (cachedMetadata) {
        return {
          tokenId,
          owner,
          metadata: cachedMetadata,
          isStaked: false, // Se verificará después
        };
      }

      // Obtener metadatos desde la API de Axie
      const metadata = await this.fetchAxieMetadata(tokenId);

      if (!metadata) {
        return null;
      }

      // Guardar en cache
      this.cache.set(tokenId, metadata);

      return {
        tokenId,
        owner,
        metadata,
        isStaked: false,
      };
    } catch (error) {
      console.error(`Error fetching Axie ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * Obtiene metadatos desde la API de Axie Infinity
   */
  private async fetchAxieMetadata(tokenId: string): Promise<AxieMetadata | null> {
    try {
      // Usar la API oficial de Axie Infinity
      const response = await fetch(
        `https://api.axie.technology/getaxies/${tokenId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        id: tokenId,
        name: data.name || `Axie #${tokenId}`,
        image: data.image || `https://axiecdn.axieinfinity.com/axies/${tokenId}/axie/axie-full-transparent.png`,
        class: data.class || 'Unknown',
        genes: data.genes || '',
        stats: {
          hp: data.stats?.hp || 0,
          speed: data.stats?.speed || 0,
          skill: data.stats?.skill || 0,
          morale: data.stats?.morale || 0,
        },
      };
    } catch (error) {
      console.error(`Error fetching metadata for Axie ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * Verifica si un Axie está stakeado en el contrato
   */
  async isAxieStaked(
    tokenId: string,
    stakingContractAddress: string
  ): Promise<boolean> {
    try {
      const owner = await this.contract.ownerOf(tokenId);
      return owner.toLowerCase() === stakingContractAddress.toLowerCase();
    } catch (error) {
      console.error(`Error checking if Axie ${tokenId} is staked:`, error);
      return false;
    }
  }

  /**
   * Obtiene Axies disponibles para stakear (no stakeados)
   */
  async getAvailableAxies(
    walletAddress: string,
    stakingContractAddress: string
  ): Promise<AxieNFT[]> {
    const allAxies = await this.getAxiesFromWallet(walletAddress);

    // Verificar cuáles están stakeados
    const axiesWithStakeStatus = await Promise.all(
      allAxies.map(async axie => {
        const isStaked = await this.isAxieStaked(
          axie.tokenId,
          stakingContractAddress
        );
        return { ...axie, isStaked };
      })
    );

    // Retornar solo los no stakeados
    return axiesWithStakeStatus.filter(axie => !axie.isStaked);
  }

  /**
   * Obtiene Axies stakeados
   */
  async getStakedAxies(
    walletAddress: string,
    stakingContractAddress: string
  ): Promise<AxieNFT[]> {
    const allAxies = await this.getAxiesFromWallet(walletAddress);

    // Verificar cuáles están stakeados
    const axiesWithStakeStatus = await Promise.all(
      allAxies.map(async axie => {
        const isStaked = await this.isAxieStaked(
          axie.tokenId,
          stakingContractAddress
        );
        return { ...axie, isStaked };
      })
    );

    // Retornar solo los stakeados
    return axiesWithStakeStatus.filter(axie => axie.isStaked);
  }

  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtiene el poder de resonancia total de los Axies stakeados
   */
  calculateTotalResonancePower(stakedAxies: AxieNFT[]): number {
    // Cada Axie aporta 5 de poder de resonancia
    return stakedAxies.length * 5;
  }
}

/**
 * Hook para usar el servicio de Axies
 */
export function createAxieService(provider: ethers.Provider): AxieService {
  return new AxieService(provider);
}
