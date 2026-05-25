/**
 * Types para NFTInventory components
 * Elimina el uso de 'any' en componentes de NFTs
 */

/**
 * Metadata de Axie NFT
 */
export interface AxieMetadata {
  name: string;
  image: string;
  class: string;
  stats: {
    hp: number;
    speed: number;
    skill: number;
    morale: number;
  };
}

/**
 * Axie NFT completo
 */
export interface AxieNFT {
  tokenId: bigint;
  metadata: AxieMetadata;
  isStaked: boolean;
  owner: string;
}

/**
 * Attribute de metadata de NFT
 */
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

/**
 * Metadata de Miner NFT
 */
export interface MinerMetadata {
  name: string;
  image: string;
  attributes: NFTAttribute[];
}

/**
 * Miner NFT completo
 */
export interface MinerNFT {
  tokenId: bigint;
  metadata: MinerMetadata;
  isMining: boolean;
  owner: string;
}
