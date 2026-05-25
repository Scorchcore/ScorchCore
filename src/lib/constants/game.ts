/**
 * Game Constants - Core Gameplay Mechanics
 * 
 * Constantes generales del juego que aplican a múltiples módulos.
 * 
 * **NOTA:** Las constantes específicas de módulos se han movido a:
 * - Forge: @/lib/constants/forge (costos, probabilities, mementos)
 * - Axie: @/lib/constants/axie (staking, burn tickets, tipos)
 * - Mining: @/lib/constants/mining (emisiones, feeding, cycles)
 */

export const GAME_CONSTANTS = {
  // Mining cycles (también en constants/mining pero aquí por retrocompatibilidad)
  CYCLES: {
    SHORT: {
      duration: 7 * 24 * 60 * 60, // 1 week
      bonus: 0,
      label: 'Corto (1 semana)',
    },
    STANDARD: {
      duration: 14 * 24 * 60 * 60, // 2 weeks
      bonus: 5,
      label: 'Estándar (2 semanas)',
    },
    COMMITTED: {
      duration: 30 * 24 * 60 * 60, // 1 month
      bonus: 10,
      label: 'Comprometido (1 mes)',
    },
    STRATEGIC: {
      duration: 60 * 24 * 60 * 60, // 2 months
      bonus: 15,
      label: 'Estratégico (2 meses)',
    },
    MASTER: {
      duration: 90 * 24 * 60 * 60, // 3 months
      bonus: 20,
      label: 'Máster (3 meses)',
    },
  },
  
  // Poder de minado por etapa (específico de CoreMiner NFT)
  MINING_POWER: {
    PETIT: 75,
    ALTO: 125,
    ANIMAL: 165,
    ULTRAMECH: 165,
    TANQUE: 200,
  },
  
  // Bonus de colección
  COLLECTION_BONUS: 2.0, // 2% para todos
} as const;

/**
 * MIGRATION NOTICE:
 * Las siguientes constantes se han movido a módulos específicos:
 * 
 * - GEODE_STAGE_NAMES, RARITY_NAMES → @/lib/constants/forge
 * - AXIE_TYPE_NAMES, AXIE_TYPE_NAMES_ES, AXIE_TYPE_EMOJIS → @/lib/constants/axie
 * 
 * Importa desde los nuevos módulos para evitar duplicación.
 */
