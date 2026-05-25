/**
 * Utilidades para obtener CIDs de IPFS según categoría
 * Cada categoría de CoreMiner tiene su propio CID en Piñata para videos y metadata
 */

import { GeodeCategory, CATEGORY_INFO } from '@/lib/constants/geodes';

/**
 * Mapa de CIDs de videos por categoría
 * Solo PETIT, ALTO y ANIMAL tienen CIDs configurados actualmente
 * ULTRAMECH y TANQUE se agregarán cuando estén disponibles
 */
const CATEGORY_VIDEO_CIDS: Partial<Record<GeodeCategory, string>> = {
  [GeodeCategory.PETIT]: process.env.NEXT_PUBLIC_CID_VIDEOS_PETIT || '',
  [GeodeCategory.ALTO]: process.env.NEXT_PUBLIC_CID_VIDEOS_ALTO || '',
  [GeodeCategory.ANIMAL]: process.env.NEXT_PUBLIC_CID_VIDEOS_ANIMAL || '',
};

/**
 * Mapa de CIDs de metadata por categoría
 * Solo PETIT, ALTO y ANIMAL tienen CIDs configurados actualmente
 * ULTRAMECH y TANQUE se agregarán cuando estén disponibles
 */
const CATEGORY_METADATA_CIDS: Partial<Record<GeodeCategory, string>> = {
  [GeodeCategory.PETIT]: process.env.NEXT_PUBLIC_CID_METADATA_PETIT || '',
  [GeodeCategory.ALTO]: process.env.NEXT_PUBLIC_CID_METADATA_ALTO || '',
  [GeodeCategory.ANIMAL]: process.env.NEXT_PUBLIC_CID_METADATA_ANIMAL || '',
};

/**
 * @deprecated Use getCIDForVideos instead
 */
const CATEGORY_CIDS = CATEGORY_VIDEO_CIDS;

/**
 * Obtiene el CID de videos para una categoría específica
 * 
 * @param category - Categoría del CoreMiner (petit, alto, animal)
 * @returns CID de IPFS o string vacío si no está configurado
 * 
 * @example
 * const cid = getCIDForVideos('petit');
 * // Returns: 'bafybeiczvukkdwmyt35464ufz3dblxkkje72c3p6o5ynnlhe3dchckixqu'
 */
export function getCIDForVideos(category: GeodeCategory): string {
  const cid = CATEGORY_VIDEO_CIDS[category];
  
  if (!cid) {
    console.warn(`[ipfsCids] No video CID configured for category: ${category}`);
    return '';
  }
  
  return cid;
}

/**
 * Obtiene el CID de metadata para una categoría específica
 * 
 * @param category - Categoría del CoreMiner (petit, alto, animal)
 * @returns CID de IPFS o string vacío si no está configurado
 * 
 * @example
 * const cid = getCIDForMetadata('petit');
 * // Returns: 'bafybeidrotsqfe3qeuxgnko5mdvfkfqzjtkl2e6agtpopuctzlsns2c4oy'
 */
export function getCIDForMetadata(category: GeodeCategory): string {
  const cid = CATEGORY_METADATA_CIDS[category];
  
  if (!cid) {
    console.warn(`[ipfsCids] No metadata CID configured for category: ${category}`);
    return '';
  }
  
  return cid;
}

/**
 * @deprecated Use getCIDForVideos instead
 */
export function getCIDForCategory(category: GeodeCategory): string {
  return getCIDForVideos(category);
}

/**
 * Construye la URL completa de IPFS para un video de CoreMiner
 * 
 * @param category - Categoría del CoreMiner
 * @param classFolder - Carpeta de clase (ej: 'PETIT_BEAST')
 * @param filename - Nombre del archivo (ej: 'CACHORRO_ALFA.mp4')
 * @returns URL IPFS completa o string vacío si no hay CID
 * 
 * @example
 * const url = buildIPFSUrl(GeodeCategory.PETIT, 'PETIT_BEAST', 'CACHORRO_ALFA.mp4');
 * // Returns: 'ipfs://bafybei.../PETIT/PETIT_BEAST/CACHORRO_ALFA.mp4'
 */
export function buildIPFSUrl(
  category: GeodeCategory,
  classFolder: string,
  filename: string
): string {
  const cid = getCIDForCategory(category);
  
  if (!cid) {
    return '';
  }
  
  const categoryUpper = CATEGORY_INFO[category].name.toUpperCase();
  return `ipfs://${cid}/${categoryUpper}/${classFolder}/${filename}`;
}

/**
 * Construye la URL de metadata JSON para un CoreMiner
 * 
 * @param category - Categoría del CoreMiner
 * @param className - Nombre de la clase (beast, aqua, bird, etc.)
 * @param index - Índice del CoreMiner en su clase (1-7)
 * @returns URL IPFS completa de metadata o string vacío si no hay CID
 * 
 * @example
 * const url = buildMetadataUrl(GeodeCategory.PETIT, 'beast', 1);
 * // Returns: 'ipfs://bafybei.../coreminer-petit-beast-1.json'
 */
export function buildMetadataUrl(
  category: GeodeCategory,
  className: string,
  index: number
): string {
  const cid = getCIDForMetadata(category);
  
  if (!cid) {
    return '';
  }
  
  const categoryLower = CATEGORY_INFO[category].name.toLowerCase();
  const classLower = className.toLowerCase();
  return `ipfs://${cid}/coreminer-${categoryLower}-${classLower}-${index}.json`;
}

/**
 * Obtiene la URL base de metadata para una categoría
 * Útil para configurar baseURI en contratos
 * 
 * @param category - Categoría del CoreMiner
 * @returns URL base con trailing slash
 * 
 * @example
 * const baseUri = getMetadataBaseURI(GeodeCategory.PETIT);
 * // Returns: 'ipfs://bafybei.../'
 */
export function getMetadataBaseURI(category: GeodeCategory): string {
  const cid = getCIDForMetadata(category);
  
  if (!cid) {
    return '';
  }
  
  return `ipfs://${cid}/`;
}

/**
 * Extrae el CID, categoría, clase y filename de una URL IPFS
 * 
 * @param ipfsUrl - URL IPFS (ej: 'ipfs://bafybei.../PETIT/PETIT_BEAST/CACHORRO_ALFA.mp4')
 * @returns Objeto con las partes de la URL o null si es inválida
 */
export function parseIPFSUrl(ipfsUrl: string): {
  cid: string;
  category: string;
  classFolder: string;
  filename: string;
} | null {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return null;
  }
  
  const withoutProtocol = ipfsUrl.replace('ipfs://', '');
  const parts = withoutProtocol.split('/');
  
  if (parts.length < 4) {
    return null;
  }
  
  return {
    cid: parts[0],
    category: parts[1],
    classFolder: parts[2],
    filename: parts[3],
  };
}
