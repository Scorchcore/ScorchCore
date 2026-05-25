/**
 * useMetadataService - Hook para acceso al servicio de metadata de NFTs
 * 
 * Proporciona una instancia única y cacheada del MetadataService que persiste
 * entre renders, optimizando el uso del cache interno del servicio.
 * 
 * @example
 * ```tsx
 * const metadataService = useMetadataService();
 * const metadata = await metadataService.getCoreMinerMetadata(minerId);
 * ```
 * 
 * @pattern Hook Pattern (React)
 * @principle Single Responsibility - Solo gestiona lifecycle del servicio
 */

import { useMemo } from 'react';
import { useContractManager } from '../contracts/useContractManager';
import { createMetadataService, type MetadataService } from '@/lib/services/nft/MetadataService';

/**
 * Hook que proporciona acceso al MetadataService con instancia única
 * 
 * Beneficios:
 * - Instancia única compartida entre todos los componentes
 * - Cache persistente de metadata entre renders
 * - Consistente con otros hooks del proyecto (useTokenService, useNFTFacade)
 * 
 * @returns Instancia del MetadataService
 */
export function useMetadataService(): MetadataService {
  const { contractManager } = useContractManager();
  
  // Memorizar instancia para evitar recrearla en cada render
  const metadataService = useMemo(
    () => createMetadataService(contractManager),
    [contractManager]
  );
  
  return metadataService;
}

/**
 * Tipos exportados para uso externo
 */
export type { MetadataService };
