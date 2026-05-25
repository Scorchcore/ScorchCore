/**
 * NFT-related types for contract interactions
 * Elimina any types en NFT contracts
 */

import type { Address } from 'viem';

/**
 * Geode information from contract
 */
export interface GeodeInfo {
  tokenId: bigint;
  category: number;
  class: number;
  hatchedAt: bigint;
  canHatch: boolean;
  incubationTime: bigint;
}

/**
 * Miner data from contract
 */
export interface MinerData {
  tokenId: bigint;
  minerType: number;
  power: bigint;
  efficiency: bigint;
  level: number;
  experience: bigint;
  durability: number;
  lastFed: bigint;
  hunger: number;
  isVoracious: boolean;
  minerNameIndex: number;
}

/**
 * Miner stats from contract
 */
export interface MinerStats {
  power: bigint;
  efficiency: bigint;
  hunger: number;
  durability: number;
  isVoracious: boolean;
  boostMultiplier: number;
}

/**
 * Owner of an NFT
 */
export type NFTOwner = Address;

/**
 * Approved address for an NFT
 */
export type ApprovedAddress = Address;
