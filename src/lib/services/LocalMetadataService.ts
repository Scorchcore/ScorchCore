/**
 * Servicio para cargar metadata local de CoreMiners de manera eficiente
 * Lee archivos JSON desde /public/metadata/ en lugar de lista hardcodeada
 */

import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('LocalMetadataService');

interface MinerMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Cache en memoria para evitar re-fetch
const metadataCache = new Map<string, MinerMetadata>();

// Mapeo de constantes
const CATEGORY_MAP: Record<number, string> = {
  0: 'petit',
  1: 'alto',
  2: 'animal',
  3: 'ultramech',
  4: 'tanque'
};

const TYPE_MAP: Record<number, string> = {
  0: 'beast',
  1: 'aqua',
  2: 'bird',
  3: 'reptile',
  4: 'bug',
  5: 'plant',
  6: 'mech',
  7: 'dusk',
  8: 'dawn'
};

/**
 * Construye la clave de cache para un miner
 */
function getCacheKey(category: number, minerType: number, minerIndex: number): string {
  return `${category}-${minerType}-${minerIndex}`;
}

/**
 * Construye la ruta al archivo JSON de metadata
 */
function getMetadataPath(category: number, minerType: number, minerIndex: number): string {
  const categoryName = CATEGORY_MAP[category];
  const typeName = TYPE_MAP[minerType];
  
  if (!categoryName || !typeName) {
    throw new Error(`Invalid category ${category} or type ${minerType}`);
  }
  
  // Los archivos están nombrados: coreminer-{category}-{type}-{index}.json
  // minerIndex es 0-based, pero los archivos usan 1-based
  const fileIndex = minerIndex + 1;
  return `/metadata/${categoryName}/coreminer-${categoryName}-${typeName}-${fileIndex}.json`;
}

/**
 * Normaliza nombre de archivo de metadata a snake_case
 * Metadata usa: "GOTA_RAPIDA.mp4" o "NANO-CONSTRUCTOR.mp4"
 * Archivos normalizados: "GOTA_RAPIDA.mp4" (snake_case)
 */
function normalizeVideoFilename(metadataFilename: string): string {
  return metadataFilename
    .replace(/-/g, '_')  // Guiones a guiones bajos
    .toUpperCase();      // Asegurar mayúsculas
}

/**
 * Carga metadata de un CoreMiner específico
 */
export async function loadMinerMetadata(
  category: number,
  minerType: number,
  minerIndex: number
): Promise<MinerMetadata | null> {
  // ✅ Conversión defensiva - asegurar que sean números
  const cat = Number(category);
  const type = Number(minerType);
  const idx = Number(minerIndex);
  
  const cacheKey = getCacheKey(cat, type, idx);
  
  // Verificar cache
  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey)!;
  }
  
  try {
    const metadataPath = getMetadataPath(cat, type, idx);
    
    logger.debug('Loading metadata', { category: cat, minerType: type, minerIndex: idx, path: metadataPath });
    
    const response = await fetch(metadataPath);
    
    if (!response.ok) {
      logger.warn('Failed to load metadata', { 
        category, 
        minerType, 
        minerIndex, 
        status: response.status 
      });
      return null;
    }
    
    const metadata: MinerMetadata = await response.json();
    
    // Guardar en cache
    metadataCache.set(cacheKey, metadata);
    
    logger.info('Metadata loaded successfully', { 
      category, 
      minerType, 
      minerIndex, 
      name: metadata.name 
    });
    
    return metadata;
  } catch (error) {
    logger.error('Error loading metadata', { 
      category, 
      minerType, 
      minerIndex, 
      error 
    });
    return null;
  }
}

/**
 * Obtiene el nombre de un miner desde metadata local
 */
export async function getMinerName(
  category: number,
  minerType: number,
  minerIndex: number
): Promise<string> {
  const metadata = await loadMinerMetadata(category, minerType, minerIndex);
  
  if (metadata) {
    return metadata.name;
  }
  
  // Fallback
  const categoryName = CATEGORY_MAP[category]?.toUpperCase() || 'UNKNOWN';
  const typeName = TYPE_MAP[minerType]?.toUpperCase() || 'UNKNOWN';
  return `${categoryName} ${typeName} #${minerIndex}`;
}

/**
 * Obtiene la ruta del video local desde metadata
 * Extrae el nombre del archivo de animation_url y lo convierte a ruta local
 */
export async function getMinerVideoPath(
  category: number,
  minerType: number,
  minerIndex: number
): Promise<string> {
  const metadata = await loadMinerMetadata(category, minerType, minerIndex);
  
  if (!metadata?.name) {
    logger.warn('No name in metadata', { category, minerType, minerIndex });
    return '';
  }
  
  // CAMBIO CRÍTICO: Usar metadata.name en lugar de animation_url
  // Esto evita problemas de orden alfabético de archivos vs minerIndex
  // Normalizar nombre del miner a formato de archivo: "Cachorro Ágil" -> "CACHORRO_AGIL"
  const minerName = metadata.name
    .normalize('NFD') // Descomponer caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Eliminar marcas diacríticas (acentos)
    .toUpperCase() // Mayúsculas
    .replace(/\s+/g, '_') // Espacios a underscores
    .replace(/[^A-Z0-9_]/g, '_'); // Cualquier otro carácter especial a underscore
  
  const videoFilename = `${minerName}.mp4`;
  
  // Construir ruta local
  const categoryName = CATEGORY_MAP[category]?.toUpperCase() || 'UNKNOWN';
  const typeName = TYPE_MAP[minerType]?.toUpperCase() || 'UNKNOWN';
  
  // Carpetas usan formato: "PETIT_AQUA", "PETIT_BEAST", etc.
  const videoPath = `/assets/coreminers/${categoryName}/${categoryName}_${typeName}/${videoFilename}`;
  
  logger.debug('Video path generated from miner name', {
    category,
    minerType,
    minerIndex,
    minerName: metadata.name,
    normalizedName: minerName,
    videoPath
  });
  
  return videoPath;
}

/**
 * Obtiene atributos específicos de metadata
 */
export async function getMinerAttribute(
  category: number,
  minerType: number,
  minerIndex: number,
  traitType: string
): Promise<string | number | null> {
  const metadata = await loadMinerMetadata(category, minerType, minerIndex);
  
  if (!metadata) {
    return null;
  }
  
  const attribute = metadata.attributes.find(attr => attr.trait_type === traitType);
  return attribute?.value ?? null;
}

/**
 * Obtiene el Base Mining Power desde metadata
 */
export async function getMinerPower(
  category: number,
  minerType: number,
  minerIndex: number
): Promise<number> {
  const power = await getMinerAttribute(category, minerType, minerIndex, 'Base Mining Power');
  
  if (typeof power === 'number') {
    return power;
  }
  
  // Fallback: 50 por defecto si no se encuentra
  logger.warn('No Base Mining Power found in metadata, using default', {
    category,
    minerType,
    minerIndex
  });
  return 50;
}

/**
 * Pre-carga metadata de múltiples miners (útil para inventario)
 */
export async function preloadMinerMetadata(
  miners: Array<{ category: number; minerType: number; minerIndex: number }>
): Promise<void> {
  const promises = miners.map(({ category, minerType, minerIndex }) =>
    loadMinerMetadata(category, minerType, minerIndex)
  );
  
  await Promise.allSettled(promises);
  
  logger.info('Metadata preload completed', { count: miners.length });
}

/**
 * Limpia cache (útil para testing o refresh forzado)
 */
export function clearMetadataCache(): void {
  metadataCache.clear();
  logger.info('Metadata cache cleared');
}
