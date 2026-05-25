/**
 * Hook para cargar metadata de CoreMiner desde IPFS
 * Usa los CIDs configurados en .env para cada categoría
 */

import { useIPFSMetadata } from '@/hooks/web3/useIPFS';
import { buildMetadataUrl } from '@/lib/utils/ipfs/ipfsCids';
import { GeodeCategory } from '@/lib/constants/geodes';

export interface CoreMinerMetadata {
  name: string;
  description: string;
  description_localized?: {
    en: string;
    es: string;
  };
  image: string;
  animation_url: string;
  external_url: string;
  attributes: Array<{
    display_type?: string;
    trait_type: string;
    value: string | number;
  }>;
  _dynamic_data_source?: {
    contract: string;
    fields: string[];
    api_endpoint: string;
    notes: string;
  };
}

/**
 * Hook para cargar metadata de CoreMiner desde IPFS
 * 
 * @param category - Categoría del CoreMiner (PETIT, ALTO, ANIMAL)
 * @param className - Nombre de la clase (beast, aqua, bird, reptile, bug, plant, mech, dusk, dawn)
 * @param index - Índice del CoreMiner en su clase (1-7)
 * 
 * @example
 * ```tsx
 * const { metadata, loading, error } = useCoreMinerMetadata(
 *   GeodeCategory.PETIT,
 *   'beast',
 *   1
 * );
 * 
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <div>
 *     <h2>{metadata.name}</h2>
 *     <video src={metadata.animation_url} />
 *     <p>Power: {metadata.attributes.find(a => a.trait_type === 'Base Mining Power')?.value}</p>
 *   </div>
 * );
 * ```
 */
export function useCoreMinerMetadata(
  category: GeodeCategory,
  className: string,
  index: number
) {
  // Construir URL de metadata usando los CIDs configurados
  const metadataUrl = buildMetadataUrl(category, className, index);
  
  // Usar hook genérico de IPFS
  const result = useIPFSMetadata<CoreMinerMetadata>(metadataUrl);
  
  return result;
}

/**
 * Hook para cargar metadata de múltiples CoreMiners
 * Útil para mostrar colecciones o listas
 * 
 * @param miners - Array de miners a cargar
 * 
 * @example
 * ```tsx
 * const miners = [
 *   { category: GeodeCategory.PETIT, className: 'beast', index: 1 },
 *   { category: GeodeCategory.PETIT, className: 'beast', index: 2 },
 * ];
 * 
 * const results = useMultipleCoreMinerMetadata(miners);
 * ```
 */
export function useMultipleCoreMinerMetadata(
  miners: Array<{
    category: GeodeCategory;
    className: string;
    index: number;
  }>
) {
  // Por ahora devolver array vacío, implementar cuando sea necesario
  // Esto requeriría cargar múltiples metadata en paralelo
  return miners.map(miner => 
    useCoreMinerMetadata(miner.category, miner.className, miner.index)
  );
}

/**
 * Helper para extraer atributos específicos de metadata
 */
export function getMetadataAttribute(
  metadata: CoreMinerMetadata | null,
  traitType: string
): string | number | undefined {
  if (!metadata) return undefined;
  return metadata.attributes.find(attr => attr.trait_type === traitType)?.value;
}

/**
 * Helper para obtener power de metadata
 */
export function getMiningPower(metadata: CoreMinerMetadata | null): number {
  const power = getMetadataAttribute(metadata, 'Base Mining Power');
  return typeof power === 'number' ? power : 0;
}

/**
 * Helper para obtener rarity de metadata
 */
export function getRarity(metadata: CoreMinerMetadata | null): string {
  const rarity = getMetadataAttribute(metadata, 'Rarity');
  return typeof rarity === 'string' ? rarity : 'Unknown';
}

/**
 * Helper para obtener max supply de metadata
 */
export function getMaxSupply(metadata: CoreMinerMetadata | null): number {
  const supply = getMetadataAttribute(metadata, 'Max Supply');
  return typeof supply === 'number' ? supply : 0;
}
