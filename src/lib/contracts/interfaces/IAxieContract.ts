/**
 * Interfaz para el contrato Axie NFT (ERC721)
 * Basado en el estándar ERC721Enumerable
 */

import type { Address } from 'viem';

/**
 * Información básica de un Axie NFT
 */
export interface AxieInfo {
  tokenId: bigint;
  owner: Address;
  genes: bigint;
  class: number; // 0-8 (Beast, Aquatic, Plant, Bird, Bug, Reptile, Mech, Dawn, Dusk)
  stage: number; // 1-4 (Egg, Larva, Petite, Adult)
}

/**
 * Metadata de un Axie
 */
export interface AxieMetadata {
  name: string;
  description: string;
  image: string;
  axie_id: number;
  class: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Interfaz del contrato Axie NFT
 */
export interface IAxieContract {
  /**
   * Obtiene el balance de Axies de un propietario
   */
  balanceOf(owner: Address): Promise<bigint>;

  /**
   * Obtiene el token ID de un Axie por índice del propietario
   */
  tokenOfOwnerByIndex(owner: Address, index: bigint): Promise<bigint>;

  /**
   * Obtiene el propietario de un Axie
   */
  ownerOf(tokenId: bigint): Promise<Address>;

  /**
   * Obtiene la URI de metadata de un Axie
   */
  tokenURI(tokenId: bigint): Promise<string>;

  /**
   * Obtiene los genes de un Axie
   */
  getAxie(tokenId: bigint): Promise<{
    genes: bigint;
    birthDate: bigint;
    matronId: bigint;
    sireId: bigint;
  }>;

  /**
   * Obtiene todos los token IDs de un propietario
   */
  tokensOfOwner(owner: Address): Promise<bigint[]>;

  /**
   * Aprueba transferencia de un Axie específico
   */
  approve(to: Address, tokenId: bigint): Promise<void>;

  /**
   * Aprueba operador para todos los Axies del propietario
   */
  setApprovalForAll(operator: Address, approved: boolean): Promise<void>;

  /**
   * Verifica si un operador está aprobado para todos los tokens
   */
  isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;

  /**
   * Obtiene la dirección aprobada para un token específico
   */
  getApproved(tokenId: bigint): Promise<Address>;
}

/**
 * Mapeo de clase de Axie a número
 */
export const AxieClass = {
  BEAST: 0,
  AQUATIC: 1,
  PLANT: 2,
  BIRD: 3,
  BUG: 4,
  REPTILE: 5,
  MECH: 6,
  DAWN: 7,
  DUSK: 8,
} as const;

export type AxieClass = typeof AxieClass[keyof typeof AxieClass];

/**
 * Nombres de clases de Axie
 */
export const AXIE_CLASS_NAMES: Record<number, string> = {
  0: 'Beast',
  1: 'Aquatic',
  2: 'Plant',
  3: 'Bird',
  4: 'Bug',
  5: 'Reptile',
  6: 'Mech',
  7: 'Dawn',
  8: 'Dusk',
};

/**
 * Mapeo de stage de Axie
 */
export const AxieStage = {
  EGG: 1,
  LARVA: 2,
  PETITE: 3,
  ADULT: 4,
} as const;

export type AxieStage = typeof AxieStage[keyof typeof AxieStage];
