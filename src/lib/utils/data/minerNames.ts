/**
 * Utilidades para nombres y metadata de miners
 * 
 * MIGRADO A PIÑATA:
 * - Nombres obtenidos desde metadata IPFS/Piñata
 * - Videos obtenidos desde animation_url en metadata
 * - Fallback a MetadataService si hay errores
 * 
 * ARQUITECTURA:
 * - Funciones aceptan MetadataService inyectado para aprovechar cache
 * - Backward compatibility: crean instancia si no se proporciona
 * - Recomendado: usar con useMetadataService() hook en componentes React
 * 
 * @see src/lib/services/nft/MetadataService.ts
 * @see src/lib/hooks/useMetadataService.ts
 */

import { MetadataService } from '@/lib/services/nft/MetadataService';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('MinerNames');

/**
 * Obtiene el nombre completo de un miner desde metadata de Piñata
 * 
 * @param minerId - ID del miner
 * @param metadataService - (Opcional) Instancia del servicio para reutilizar cache
 * @returns Promise con el nombre del miner
 * 
 * @example
 * // En un componente React (RECOMENDADO):
 * const metadataService = useMetadataService();
 * const name = await getMinerNameFromMetadata(minerId, metadataService);
 * 
 * @example
 * // Fuera de React (crea instancia nueva):
 * const name = await getMinerNameFromMetadata(minerId);
 */
export async function getMinerNameFromMetadata(
  minerId: bigint,
  metadataService?: MetadataService
): Promise<string> {
  try {
    // Si no se proporciona servicio, crear uno (backward compatibility)
    const service = metadataService || await createMetadataServiceInstance();
    
    const metadata = await service.getCoreMinerMetadata(minerId);
    
    if (metadata.name && !metadata.name.includes('Core Miner #')) {
      return metadata.name;
    }
    
    return `Core Miner #${minerId}`;
  } catch (error) {
    log.warn('Failed to fetch miner name from metadata', { minerId: minerId.toString(), error });
    return `Core Miner #${minerId}`;
  }
}

/**
 * Obtiene la URL del video de un miner desde metadata de Piñata
 * 
 * @param minerId - ID del miner
 * @param metadataService - (Opcional) Instancia del servicio para reutilizar cache
 * @returns Promise con la URL del video
 * 
 * @example
 * // En un componente React (RECOMENDADO):
 * const metadataService = useMetadataService();
 * const videoUrl = await getMinerVideoUrl(minerId, metadataService);
 */
export async function getMinerVideoUrl(
  minerId: bigint,
  metadataService?: MetadataService
): Promise<string> {
  try {
    const service = metadataService || await createMetadataServiceInstance();
    
    log.debug('Fetching miner video URL from metadata', { minerId: minerId.toString() });
    
    const metadata = await service.getCoreMinerMetadata(minerId);
    
    if (metadata.animation_url) {
      log.info('Video URL found in metadata', { 
        minerId: minerId.toString(),
        url: metadata.animation_url.substring(0, 50) + '...'
      });
      return metadata.animation_url;
    }
    
    log.debug('No animation_url in metadata, using empty string', { minerId: minerId.toString() });
    return ''; // No hay video disponible
  } catch (error) {
    log.warn('Failed to fetch miner video from metadata', { 
      minerId: minerId.toString(), 
      error: error instanceof Error ? error.message : String(error)
    });
    return ''; // Fallback a sin video en caso de error
  }
}

/**
 * Obtiene la imagen de un miner desde metadata de Piñata
 * 
 * @param minerId - ID del miner
 * @param metadataService - (Opcional) Instancia del servicio para reutilizar cache
 * @returns Promise con la URL de la imagen
 * 
 * @example
 * // En un componente React (RECOMENDADO):
 * const metadataService = useMetadataService();
 * const imageUrl = await getMinerImageUrl(minerId, metadataService);
 */
export async function getMinerImageUrl(
  minerId: bigint,
  metadataService?: MetadataService
): Promise<string> {
  try {
    const service = metadataService || await createMetadataServiceInstance();
    
    const metadata = await service.getCoreMinerMetadata(minerId);
    
    if (metadata.image) {
      return metadata.image;
    }
    
    return '/assets/miners/fallback.png';
  } catch (error) {
    log.warn('Failed to fetch miner image from metadata', { minerId: minerId.toString(), error });
    return '/assets/miners/fallback.png';
  }
}

/**
 * Helper interno para crear instancia del servicio (backward compatibility)
 * Solo se usa cuando no se proporciona servicio inyectado
 */
async function createMetadataServiceInstance(): Promise<MetadataService> {
  const { ContractManager } = await import('@/lib/contracts/ContractManager');
  const { createMetadataService } = await import('@/lib/services/nft/MetadataService');
  
  const contractManager = ContractManager.getInstance();
  return createMetadataService(contractManager);
}

/**
 * Obtiene el nombre de la clase de Axie/Miner
 */
export function getMinerTypeName(minerType: number): string {
  const typeNames: Record<number, string> = {
    0: 'Beast',
    1: 'Aqua',
    2: 'Bird',
    3: 'Reptile',
    4: 'Bug',
    5: 'Plant',
    6: 'Mech',
    7: 'Dusk',
    8: 'Dawn'
  };
  
  return typeNames[minerType] || 'Unknown';
}

/**
 * Determina la rareza basada en el índice del nombre
 */
export function getMinerRarity(minerNameIndex: number): string {
  if (minerNameIndex === 6) return 'epic';
  if (minerNameIndex >= 4) return 'rare';
  if (minerNameIndex >= 2) return 'uncommon';
  return 'common';
}
