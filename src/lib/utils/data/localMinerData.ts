/**
 * Datos locales de CoreMiners
 * Usa LocalMetadataService para cargar metadata desde JSON en lugar de lista hardcodeada
 */

import * as MetadataService from '@/lib/services/LocalMetadataService';

// Mapeo de categorías
export const CATEGORY_NAMES: Record<number, string> = {
  0: 'PETIT',
  1: 'ALTO',
  2: 'ANIMAL',
  3: 'ULTRAMECH',
  4: 'TANK'
};

// Mapeo de tipos (axie classes)
// IMPORTANTE: El orden debe coincidir EXACTAMENTE con enum AxieClass en geodes.ts
export const TYPE_NAMES: Record<number, string> = {
  0: 'BEAST',   // AxieClass.BEAST = 0
  1: 'AQUA',    // AxieClass.AQUA = 1
  2: 'BIRD',    // AxieClass.BIRD = 2
  3: 'REPTILE', // AxieClass.REPTILE = 3
  4: 'BUG',     // AxieClass.BUG = 4
  5: 'PLANT',   // AxieClass.PLANT = 5
  6: 'MECH',    // AxieClass.MECH = 6
  7: 'DUSK',    // AxieClass.DUSK = 7
  8: 'DAWN'     // AxieClass.DAWN = 8
};

// ============================================================================
// ELIMINADO: Lista hardcodeada MINER_NAMES
// Ahora se usa LocalMetadataService.getMinerName() para obtener nombres
// desde archivos JSON en /public/metadata/
// ============================================================================

/**
 * Obtiene el nombre local de un miner desde metadata JSON
 * @param category - Categoría del miner (0=PETIT, 1=ALTO, etc.)
 * @param minerType - Tipo del miner (0=AQUA, 1=BEAST, etc.)
 * @param minerIndex - Índice del miner (0-6)
 * @returns Promise con el nombre del miner
 */
export async function getLocalMinerName(
  category: number,
  minerType: number,
  minerIndex: number
): Promise<string> {
  return await MetadataService.getMinerName(category, minerType, minerIndex);
}

/**
 * Obtiene la ruta del video local desde metadata JSON
 * Extrae el nombre del archivo de animation_url en metadata y construye ruta local
 * @param category - Categoría del miner (0=PETIT, 1=ALTO, etc.)
 * @param minerType - Tipo del miner (0=AQUA, 1=BEAST, etc.)
 * @param minerIndex - Índice del miner (0-6)
 * @returns Promise con la ruta del video local
 */
export async function getLocalMinerVideo(
  category: number,
  minerType: number,
  minerIndex: number
): Promise<string> {
  return await MetadataService.getMinerVideoPath(category, minerType, minerIndex);
}

/**
 * Obtiene el tipo de miner en formato legible
 */
export function getLocalMinerType(minerType: number): string {
  return TYPE_NAMES[minerType] || 'Unknown';
}

/**
 * Obtiene la categoría en formato legible
 */
export function getLocalMinerCategory(category: number): string {
  return CATEGORY_NAMES[category] || 'Unknown';
}
