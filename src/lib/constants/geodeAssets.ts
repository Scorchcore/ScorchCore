/**
 * Mapeo de tipos de geoda a sus assets visuales
 */

export const GEODE_ASSETS = {
  // Petit Geodes (tipo 0)
  0: {
    name: 'Petit Aqua',
    video: '/images/geodes/petit/GEODA PETIT AQUA.mp4',
    thumbnail: '/images/geodes/petit/GEODA PETIT AQUA.mp4', // Usar mismo video como thumbnail
    emoji: '🥚',
    color: 'from-blue-400 to-cyan-500',
  },
  
  // Alto Geodes (tipo 1)
  1: {
    name: 'Alto',
    video: null, // Por agregar
    thumbnail: null,
    emoji: '🔮',
    color: 'from-purple-400 to-pink-500',
  },
  
  // Animal Geodes (tipo 2)
  2: {
    name: 'Animal',
    video: null, // Por agregar
    thumbnail: null,
    emoji: '💎',
    color: 'from-green-400 to-emerald-500',
  },
  
  // Ultramech Geodes (tipo 3)
  3: {
    name: 'Ultramech',
    video: null, // Por agregar
    thumbnail: null,
    emoji: '⚡',
    color: 'from-yellow-400 to-orange-500',
  },
  
  // Tanque Geodes (tipo 4)
  4: {
    name: 'Tanque',
    video: null, // Por agregar
    thumbnail: null,
    emoji: '🔥',
    color: 'from-red-400 to-rose-500',
  },
} as const;

/**
 * NOTA: GeodeType enum se exporta desde @/lib/constants/forge
 * Este archivo solo maneja assets visuales.
 */
type GeodeAssetKey = keyof typeof GEODE_ASSETS;

/**
 * Obtiene el asset de una geoda por tipo
 */
export function getGeodeAsset(geodeType: number) {
  return GEODE_ASSETS[geodeType as GeodeAssetKey] || GEODE_ASSETS[0];
}

/**
 * Verifica si una geoda tiene video
 */
export function hasGeodeVideo(geodeType: number): boolean {
  const asset = getGeodeAsset(geodeType);
  return asset.video !== null;
}
