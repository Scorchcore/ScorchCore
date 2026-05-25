/**
 * Tipos compartidos para el módulo NFT
 * 
 * Interfaces para:
 * - Datos de miners (chain data y enriched)
 * - Metadata de NFTs (config y enriched)
 * - Enriquecimiento de datos
 */

/**
 * Datos del minero desde el smart contract
 */
export interface MinerChainData {
  power: bigint;
  efficiency: bigint;
  minerType: number;
  minerNameIndex?: number;
  isVoracious: boolean;
  stage?: number;
  axieType?: number;
  lastFed?: bigint;
  hunger?: bigint;
  durability?: number;
  level?: number;
  experience?: bigint;
}

/**
 * Datos enriquecidos del minero con información calculada
 */
export interface EnrichedMinerData extends MinerChainData {
  rarity: string;
  rarityScore: number;
  typeName: string;
  stageName: string;
}

/**
 * Datos de enriquecimiento adicionales del minero
 */
export interface MinerEnrichmentData {
  collectionBonus: number;
  isMining: boolean;
  lastClaimTime: number;
  totalMined: bigint;
}

/**
 * Configuración del servicio de metadata
 */
export interface MetadataServiceConfig {
  /** Gateway de Piñata para IPFS */
  pinataGateway?: string;
  /** Tiempo de cache en ms */
  cacheTTL?: number;
  /** Reintentos en caso de fallo */
  maxRetries?: number;
}

/**
 * Metadata enriquecida con información adicional
 */
export interface EnrichedNFTMetadata {
  /** Nombre del NFT */
  name?: string;
  /** Descripción del NFT */
  description?: string;
  /** URL de la imagen */
  image?: string;
  /** URL del video si existe */
  animation_url?: string;
  /** Atributos del NFT */
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  /** Tipo de miner extraído de attributes */
  minerType?: number;
  /** Índice de nombre de miner */
  minerNameIndex?: number;
  /** ID del token */
  tokenId?: bigint;
}
