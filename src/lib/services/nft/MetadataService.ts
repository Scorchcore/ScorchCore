/**
 * MetadataService - Servicio para obtener metadata de NFTs desde IPFS/Piñata
 * 
 * Responsabilidades:
 * - Fetch de metadata desde tokenURI
 * - Resolución de URLs IPFS a gateways HTTP
 * - Cache de metadata para optimizar requests
 * - Fallback a datos locales si falla el fetch
 * 
 * @pattern Service Layer (DDD)
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import type { NFTMetadata } from '@/lib/contracts/interfaces/INFTContract';
import type { MetadataServiceConfig, EnrichedNFTMetadata } from './types';

const log = createServiceLogger('MetadataService');

/**
 * Cache entry para metadata
 */
interface CacheEntry {
  metadata: EnrichedNFTMetadata;
  timestamp: number;
}

/**
 * Queue entry para requests IPFS
 */
interface QueuedRequest {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

/**
 * Servicio para gestión de metadata de NFTs
 */
export class MetadataService {
  private contractManager: ContractManager;
  private config: Required<MetadataServiceConfig>;
  private metadataCache: Map<string, CacheEntry>;
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue: boolean = false;
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 500; // 500ms entre requests IPFS

  constructor(
    contractManager: ContractManager,
    config?: MetadataServiceConfig
  ) {
    this.contractManager = contractManager;
    this.config = {
      // Usar Cloudflare IPFS gateway (sin rate limits estrictos)
      pinataGateway: config?.pinataGateway || 'https://cloudflare-ipfs.com/ipfs',
      cacheTTL: config?.cacheTTL || 3600000, // 1 hora (aumentado desde 5 min)
      maxRetries: config?.maxRetries || 2, // Reducido de 3 a 2 para evitar muchos requests
    };
    this.metadataCache = new Map();
    
    log.info('MetadataService initialized', {
      gateway: this.config.pinataGateway,
      cacheTTL: `${this.config.cacheTTL / 60000} min`,
    });
  }

  /**
   * Obtiene metadata de un Core Miner desde IPFS/Piñata
   * 
   * @param minerId - ID del miner
   * @returns Metadata enriquecida con información del miner
   */
  async getCoreMinerMetadata(minerId: bigint): Promise<EnrichedNFTMetadata> {
    const cacheKey = `core-miner-${minerId}`;
    
    // Verificar cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      log.debug('Metadata from cache', { minerId: minerId.toString() });
      return cached;
    }

    try {
      // Obtener tokenURI del contrato
      const minerContract = this.contractManager.getCoreMinerNFT();
      const tokenURI = await minerContract.tokenURI(minerId);
      
      log.debug('Fetching metadata', { minerId: minerId.toString(), tokenURI });
      
      // Fetch metadata desde IPFS
      const metadata = await this.fetchMetadataFromURI(tokenURI);
      
      // Enriquecer con datos adicionales
      const enriched = await this.enrichMinerMetadata(metadata, minerId);
      
      // Guardar en cache
      this.saveToCache(cacheKey, enriched);
      
      return enriched;
    } catch (error) {
      log.error('Failed to fetch miner metadata', error, {
        minerId: minerId.toString(),
      });
      
      // Retornar metadata de fallback
      return this.getFallbackMetadata(minerId);
    }
  }

  /**
   * Obtiene metadata de un Geode NFT desde IPFS/Piñata
   * 
   * @param geodeId - ID del geode
   * @returns Metadata del geode
   */
  async getGeodeMetadata(geodeId: bigint): Promise<EnrichedNFTMetadata> {
    const cacheKey = `geode-${geodeId}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const geodeContract = this.contractManager.getGeodeNFT();
      const tokenURI = await geodeContract.tokenURI(geodeId);
      
      const metadata = await this.fetchMetadataFromURI(tokenURI);
      const enriched = { ...metadata, tokenId: geodeId };
      
      this.saveToCache(cacheKey, enriched);
      
      return enriched;
    } catch (error) {
      log.error('Failed to fetch geode metadata', error, {
        geodeId: geodeId.toString(),
      });
      
      throw error;
    }
  }

  /**
   * Encola un request IPFS para procesarlo secuencialmente
   */
  private async queueIPFSRequest<T>(execute: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ execute, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Procesa la cola de requests IPFS uno a la vez con rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      // Rate limiting: esperar intervalo mínimo entre requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => 
          setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
      }

      try {
        const result = await request.execute();
        this.lastRequestTime = Date.now();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Fetch metadata desde URI con retry logic
   * 
   * @param uri - tokenURI del NFT
   * @returns Metadata parseada
   */
  private async fetchMetadataFromURI(uri: string): Promise<NFTMetadata> {
    // Convertir IPFS URI a HTTP gateway
    const httpUrl = this.resolveIPFSUrl(uri);
    
    let lastError: Error | null = null;
    
    // Reintentar en caso de fallo
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        log.debug('Fetching metadata attempt', { attempt, url: httpUrl });
        
        // Encolar request para evitar rate limiting
        const response = await this.queueIPFSRequest(() =>
          fetch(httpUrl, {
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(15000), // 15s timeout (aumentado)
          })
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const metadata = await response.json();
        
        // Validar estructura básica
        if (!metadata.name || !metadata.image) {
          throw new Error('Invalid metadata structure: missing name or image');
        }

        return metadata as NFTMetadata;
      } catch (error) {
        lastError = error as Error;
        log.warn('Fetch attempt failed', {
          attempt,
          error: lastError.message,
        });
        
        // Esperar antes de reintentar (backoff exponencial)
        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Failed to fetch metadata');
  }

  /**
   * Enriquece metadata de miner con datos del contrato
   */
  private async enrichMinerMetadata(
    metadata: NFTMetadata,
    minerId: bigint
  ): Promise<EnrichedNFTMetadata> {
    try {
      const minerContract = this.contractManager.getCoreMinerNFT();
      const minerData = await minerContract.getMinerData(minerId);
      
      // Extraer minerType y minerNameIndex de attributes si existen
      const typeAttr = metadata.attributes.find(a => 
        a.trait_type.toLowerCase() === 'type' || 
        a.trait_type.toLowerCase() === 'miner type'
      );
      
      const nameIndexAttr = metadata.attributes.find(a =>
        a.trait_type.toLowerCase() === 'name index' ||
        a.trait_type.toLowerCase() === 'rarity'
      );

      return {
        ...metadata,
        tokenId: minerId,
        minerType: typeAttr ? Number(typeAttr.value) : Number(minerData.minerType),
        minerNameIndex: nameIndexAttr ? Number(nameIndexAttr.value) : undefined,
      };
    } catch (error) {
      log.debug('Could not enrich metadata from contract', {
        minerId: minerId.toString(),
      });
      
      return {
        ...metadata,
        tokenId: minerId,
      };
    }
  }

  /**
   * Resuelve una URL IPFS a un gateway HTTP
   * 
   * @param uri - URI IPFS (ipfs://... o https://...)
   * @returns URL HTTP del gateway
   */
  private resolveIPFSUrl(uri: string): string {
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }

    // ipfs://QmHash/path -> https://gateway.pinata.cloud/ipfs/QmHash/path
    if (uri.startsWith('ipfs://')) {
      const ipfsPath = uri.replace('ipfs://', '');
      return `${this.config.pinataGateway}/${ipfsPath}`;
    }

    // QmHash/path -> https://gateway.pinata.cloud/ipfs/QmHash/path
    return `${this.config.pinataGateway}/${uri}`;
  }

  /**
   * Obtiene metadata de fallback cuando falla el fetch
   */
  private getFallbackMetadata(minerId: bigint): EnrichedNFTMetadata {
    return {
      name: `Core Miner #${minerId}`,
      description: 'Core Miner NFT',
      image: '/assets/miners/fallback.png',
      attributes: [],
      tokenId: minerId,
    };
  }

  /**
   * Obtiene metadata desde cache
   */
  private getFromCache(key: string): EnrichedNFTMetadata | null {
    const entry = this.metadataCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si el cache expiró
    const now = Date.now();
    if (now - entry.timestamp > this.config.cacheTTL) {
      this.metadataCache.delete(key);
      return null;
    }

    return entry.metadata;
  }

  /**
   * Guarda metadata en cache
   */
  private saveToCache(key: string, metadata: EnrichedNFTMetadata): void {
    this.metadataCache.set(key, {
      metadata,
      timestamp: Date.now(),
    });
  }

  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.metadataCache.clear();
    log.debug('Metadata cache cleared');
  }

  /**
   * Obtiene el tamaño actual del cache
   */
  getCacheSize(): number {
    return this.metadataCache.size;
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createMetadataService(
  contractManager: ContractManager,
  config?: MetadataServiceConfig
): MetadataService {
  return new MetadataService(contractManager, config);
}
