/**
 * Interfaces para contratos NFT (ERC721)
 * CoreMinerNFT, GeodeNFT, IdNFT
 * Implementa Liskov Substitution Principle (LSP)
 */

import type { Address } from 'viem';
import type { IBlockchainContract, IApprovableContract, TransactionResult } from './IBlockchainContract';

/**
 * Metadata de un NFT
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: NFTAttribute[];
}

/**
 * Atributo de metadata NFT
 */
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

/**
 * Información de un token NFT
 */
export interface TokenInfo {
  tokenId: bigint;
  owner: Address;
  tokenURI: string;
  metadata?: NFTMetadata;
}

/**
 * Eventos comunes de NFT
 */
export interface NFTEvents {
  Transfer: {
    from: Address;
    to: Address;
    tokenId: bigint;
  };
  Approval: {
    owner: Address;
    approved: Address;
    tokenId: bigint;
  };
  ApprovalForAll: {
    owner: Address;
    operator: Address;
    approved: boolean;
  };
}

/**
 * Interfaz base para contratos NFT (ERC721)
 */
export interface INFTContract extends IBlockchainContract<NFTEvents> {
  /**
   * Obtiene el dueño de un token
   */
  ownerOf(tokenId: bigint): Promise<Address>;
  
  /**
   * Obtiene el balance de NFTs de un usuario
   */
  balanceOf(owner: Address): Promise<bigint>;
  
  /**
   * Obtiene el URI de metadata de un token
   */
  tokenURI(tokenId: bigint): Promise<string>;
  
  /**
   * Obtiene el supply total de NFTs
   */
  totalSupply(): Promise<bigint>;
  
  /**
   * Aprueba a otro address para transferir un token específico
   */
  approve(to: Address, tokenId: bigint): Promise<TransactionResult>;
  
  /**
   * Aprueba a un operador para manejar todos los tokens del usuario
   */
  setApprovalForAll(operator: Address, approved: boolean): Promise<TransactionResult>;
  
  /**
   * Obtiene el address aprobado para un token específico
   */
  getApproved(tokenId: bigint): Promise<Address>;
  
  /**
   * Verifica si un operador está aprobado para todos los tokens de un owner
   */
  isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;
  
  /**
   * Transfiere un token de un address a otro
   */
  transferFrom(from: Address, to: Address, tokenId: bigint): Promise<TransactionResult>;
}

/**
 * Interfaz para contratos NFT con enumeración (ERC721Enumerable)
 */
export interface IEnumerableNFTContract extends INFTContract {
  /**
   * Obtiene el token en un índice específico del supply total
   */
  tokenByIndex(index: bigint): Promise<bigint>;
  
  /**
   * Obtiene el token en un índice específico de un owner
   */
  tokenOfOwnerByIndex(owner: Address, index: bigint): Promise<bigint>;
  
  /**
   * Obtiene todos los tokens de un owner
   */
  tokensOfOwner(owner: Address): Promise<bigint[]>;
}

/**
 * Información específica de una Geoda
 */
export interface GeodeInfo {
  tokenId: bigint;
  category: number;
  axieClass: number;
  forgeDate: bigint;
  creator: Address;
  isHatched: boolean;
}

/**
 * Interfaz para el contrato GeodeNFT
 */
export interface IGeodeNFT extends IEnumerableNFTContract {
  /**
   * Obtiene información completa de una geoda
   */
  getGeodeInfo(tokenId: bigint): Promise<GeodeInfo>;
  
  /**
   * Obtiene la categoría de una geoda (0-4)
   */
  getGeodeCategory(tokenId: bigint): Promise<number>;
  
  /**
   * Obtiene la clase de Axie de una geoda (0-8)
   */
  getGeodeClass(tokenId: bigint): Promise<number>;
  
  /**
   * Obtiene el nombre generado de una geoda
   */
  getGeodeName(tokenId: bigint): Promise<string>;
  
  /**
   * Verifica si una geoda ya fue eclosionada
   */
  isHatched(tokenId: bigint): Promise<boolean>;
}

/**
 * Información específica de un CoreMiner
 * Mapea exactamente la estructura del contrato CoreMinerNFT.sol
 */
export interface CoreMinerInfo {
  tokenId: bigint;
  category: number;        // 0-4: PETIT, ALTO, ANIMAL, ULTRAMECH, TANK
  minerType: number;       // 0-8: Beast, Aqua, Bird, Reptile, Bug, Plant, Mech, Dusk, Dawn
  minerIndex: number;      // 0-6: índice específico del miner
  power: bigint;
  efficiency: bigint;
  durability: bigint;
  level: bigint;
  experience: bigint;
  isVoracious: boolean;
  lastFed: bigint;
  minerNameIndex: number;  // Deprecated - usar minerIndex
  forgeDate: bigint;
}

/**
 * Interfaz para el contrato CoreMinerNFT
 */
export interface ICoreMinerNFT extends IEnumerableNFTContract {
  /**
   * Obtiene información completa de un minero
   */
  getMinerData(tokenId: bigint): Promise<CoreMinerInfo>;
  
  /**
   * Obtiene estadísticas de un minero
   */
  getMinerStats(tokenId: bigint): Promise<{
    power: bigint;
    efficiency: bigint;
    durability: bigint;
    lastMined: bigint;
    forgeDate: bigint;
  }>;
  
  /**
   * Obtiene todos los mineros de un owner
   */
  getMinersOfOwner(owner: Address): Promise<bigint[]>;
  
  /**
   * Verifica si un minero necesita ser alimentado
   */
  needsFeeding(tokenId: bigint, feedInterval: bigint): Promise<boolean>;
  
  /**
   * Obtiene el poder efectivo de un minero
   */
  getEffectivePower(tokenId: bigint): Promise<bigint>;
  
  /**
   * Alimenta un minero (renueva durability)
   */
  feedMiner(tokenId: bigint): Promise<TransactionResult>;
  
  /**
   * Añade experiencia a un minero
   */
  addExperience(tokenId: bigint, amount: bigint): Promise<TransactionResult>;
  
  /**
   * Reduce la durabilidad de un minero
   */
  reduceDurability(tokenId: bigint, amount: bigint): Promise<TransactionResult>;
  
  /**
   * Repara un minero (restaura durability)
   */
  repairMiner(tokenId: bigint, amount: bigint): Promise<TransactionResult>;
}

/**
 * Información de un IdNFT (Proof of Humanity)
 */
export interface IdNFTInfo {
  tokenId: bigint;
  owner: Address;
  verificationLevel: number;
  verifiedAt: bigint;
  expiresAt: bigint;
  isValid: boolean;
}

/**
 * Interfaz para el contrato IdNFT
 */
export interface IIdNFT extends INFTContract {
  /**
   * Obtiene información de un IdNFT
   */
  getIdInfo(tokenId: bigint): Promise<IdNFTInfo>;
  
  /**
   * Verifica si un IdNFT está vigente
   */
  isValid(tokenId: bigint): Promise<boolean>;
  
  /**
   * Obtiene el nivel de verificación
   */
  getVerificationLevel(tokenId: bigint): Promise<number>;
  
  /**
   * Obtiene el IdNFT de un usuario (si tiene)
   */
  getIdOfOwner(owner: Address): Promise<bigint | null>;
}
