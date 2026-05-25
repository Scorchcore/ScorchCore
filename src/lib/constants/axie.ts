/**
 * Axie Constants
 * 
 * Constantes relacionadas con Axies:
 * - Tipos de Axie y nombres
 * - Staking de Axies
 * - Burn tickets
 * - Resonancia y bonuses
 */

// ==========================================
// Tipos de Axie
// ==========================================

/**
 * Nombres de tipos de Axie por ID (del CSV)
 */
export const AXIE_TYPE_NAMES = {
  0: 'Beast',      // Bestia
  1: 'Aquatic',    // Aqua
  2: 'Bird',       // Ave
  3: 'Reptile',    // Reptil
  4: 'Bug',        // Bicho
  5: 'Plant',      // Planta
  6: 'Mech',       // Mech
  7: 'Dusk',       // Oscuridad
  8: 'Dawn',       // Amanecer
} as const;

/**
 * Nombres de tipos en español
 */
export const AXIE_TYPE_NAMES_ES = {
  BEAST: 'Bestia',
  AQUATIC: 'Aqua',
  BIRD: 'Ave',
  REPTILE: 'Reptil',
  BUG: 'Bicho',
  PLANT: 'Planta',
  MECH: 'Mech',
  DUSK: 'Oscuridad',
  DAWN: 'Amanecer',
} as const;

/**
 * Emojis por tipo de Axie
 */
export const AXIE_TYPE_EMOJIS = {
  BEAST: '🐉',
  AQUATIC: '🐟',
  BIRD: '🦅',
  REPTILE: '🦎',
  BUG: '🦋',
  PLANT: '🌿',
  MECH: '🤖',
  DUSK: '🌙',
  DAWN: '☀️',
} as const;

// ==========================================
// Axie Staking
// ==========================================

/**
 * Poder de resonancia por Axie stakeado
 * 
 * Cada Axie stakeado otorga +5 de poder de resonancia
 */
export const AXIE_RESONANCE_POWER = 5;

/**
 * Período mínimo de staking (segundos)
 * 
 * @constant {number} 1 semana
 */
export const MIN_STAKING_PERIOD = 7 * 24 * 60 * 60; // 1 week

/**
 * Período mínimo de staking en días (legible)
 */
export const MIN_STAKING_PERIOD_DAYS = 7;

// ==========================================
// Burn Tickets
// ==========================================

/**
 * Configuración de tickets de burn
 * 
 * Cada tier permite quemar más Axies por día:
 * - LIBRE: Gratis, 10 burns/día
 * - ASTRAL: 1000 CORE + 10000 SLP, 30 burns/día
 * - NEBULOSA: 5000 CORE + 50000 SLP, 50 burns/día
 * - ALMA: 10000 CORE + 100000 SLP, 100 burns/día
 */
export const TICKET_LEVELS = {
  LIBRE: {
    cost: { core: 0n, slp: 0n },
    maxBurnsPerDay: 10,
    label: 'Pase de Prospector Libre',
  },
  ASTRAL: {
    cost: { core: 1000n * 10n ** 18n, slp: 10000n * 10n ** 18n },
    maxBurnsPerDay: 30,
    label: 'Licencia Astral',
  },
  NEBULOSA: {
    cost: { core: 5000n * 10n ** 18n, slp: 50000n * 10n ** 18n },
    maxBurnsPerDay: 50,
    label: 'Edicto Nebulosa',
  },
  ALMA: {
    cost: { core: 10000n * 10n ** 18n, slp: 100000n * 10n ** 18n },
    maxBurnsPerDay: 100,
    label: 'Concesión del Alma',
  },
} as const;

/**
 * Tier de ticket por defecto (LIBRE)
 */
export const DEFAULT_TICKET_TIER = 'LIBRE';

// ==========================================
// Tipos Helper
// ==========================================

export type AxieTypeId = keyof typeof AXIE_TYPE_NAMES;
export type AxieTypeName = keyof typeof AXIE_TYPE_NAMES_ES;
export type TicketTier = keyof typeof TICKET_LEVELS;

/**
 * Helper para obtener nombre de Axie por ID
 */
export function getAxieTypeName(typeId: AxieTypeId): string {
  return AXIE_TYPE_NAMES[typeId];
}

/**
 * Helper para obtener emoji de tipo
 */
export function getAxieEmoji(typeName: AxieTypeName): string {
  return AXIE_TYPE_EMOJIS[typeName];
}

/**
 * Helper para obtener configuración de ticket por tier
 */
export function getTicketConfig(tier: TicketTier) {
  return TICKET_LEVELS[tier];
}
