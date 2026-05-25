// Tipos de Geodas (sincronizado con GameConstants.sol)
export enum GeodeType {
  PETIT_BESTIA = 0,
  BESTIA = 1,
  GRAN_BESTIA = 2,
  TITAN = 3,
  ANCIENT = 4,
  LEGENDARY = 5,
  MYTHIC = 6
}

export interface GeodeConfig {
  id: GeodeType;
  name: string;
  description: string;
  image: string;
  color: string;
  basePower: number;
  baseEfficiency: number;
  forgeCost: {
    core: string;      // Usar string para manejar BigNumber
    slp: string;
    memento: string;   // Agregado para sincronizar con Solidity
    axs: string;
  };
  dropRates: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
  };
}

// Configuración de Geodas
export const GEODE_CONFIGS: Record<GeodeType, GeodeConfig> = {
  [GeodeType.PETIT_BESTIA]: {
    id: GeodeType.PETIT_BESTIA,
    name: "Petit Bestia",
    description: "Una pequeña geoda con destellos de energía contenida. Perfecta para principiantes.",
    image: "/geodes/petit-bestia.png",
    color: "#7B68EE",
    basePower: 10,
    baseEfficiency: 40,
    forgeCost: {
      core: "100000000000000000000",      // 100 CORE (100 * 10^18)
      slp: "1000000000000000000000",     // 1,000 SLP
      memento: "1000000000000000000",     // 1 Memento
      axs: "100000000000000000"          // 0.1 AXS
    },
    dropRates: {
      common: 60,
      rare: 25,
      epic: 10,
      legendary: 4,
      mythic: 1
    }
  },
  [GeodeType.BESTIA]: {
    id: GeodeType.BESTIA,
    name: "Bestia",
    description: "Una geoda poderosa con energía bruta que late en su interior.",
    image: "/geodes/bestia.png",
    color: "#FF4500",
    basePower: 25,
    baseEfficiency: 50,
    forgeCost: {
      core: "500000000000000000000",      // 500 CORE
      slp: "5000000000000000000000",     // 5,000 SLP
      memento: "5000000000000000000",     // 5 Memento
      axs: "500000000000000000"          // 0.5 AXS
    },
    dropRates: {
      common: 45,
      rare: 30,
      epic: 15,
      legendary: 8,
      mythic: 2
    }
  },
  [GeodeType.GRAN_BESTIA]: {
    id: GeodeType.GRAN_BESTIA,
    name: "Gran Bestia",
    description: "Una geoda masiva que emite un resplandor intenso. Solo para mineros experimentados.",
    image: "/geodes/gran-bestia.png",
    color: "#8A2BE2",
    basePower: 50,
    baseEfficiency: 60,
    forgeCost: {
      core: "2500000000000000000000",     // 2,500 CORE
      slp: "25000000000000000000000",    // 25,000 SLP
      memento: "10000000000000000000",    // 10 Memento
      axs: "2500000000000000000"         // 2.5 AXS
    },
    dropRates: {
      common: 30,
      rare: 35,
      epic: 20,
      legendary: 12,
      mythic: 3
    }
  },
  [GeodeType.TITAN]: {
    id: GeodeType.TITAN,
    name: "Titán",
    description: "Una geoda legendaria que contiene el poder de los antiguos titanes.",
    image: "/geodes/titan.png",
    color: "#FFD700",
    basePower: 100,
    baseEfficiency: 75,
    forgeCost: {
      core: "10000000000000000000000",    // 10,000 CORE
      slp: "100000000000000000000000",   // 100,000 SLP
      memento: "25000000000000000000",    // 25 Memento
      axs: "2500000000000000000"         // 2.5 AXS
    },
    dropRates: {
      common: 15,
      rare: 25,
      epic: 30,
      legendary: 20,
      mythic: 10
    }
  },
  [GeodeType.ANCIENT]: {
    id: GeodeType.ANCIENT,
    name: "Ancient",
    description: "Una reliquia de una era olvidada, su energía es casi mítica.",
    image: "/geodes/ancient.png",
    color: "#32CD32",
    basePower: 200,
    baseEfficiency: 85,
    forgeCost: {
      core: "50000000000000000000000",    // 50,000 CORE
      slp: "500000000000000000000000",   // 500,000 SLP
      memento: "100000000000000000000",   // 100 Memento
      axs: "10000000000000000000"        // 10 AXS
    },
    dropRates: {
      common: 5,
      rare: 15,
      epic: 30,
      legendary: 35,
      mythic: 15
    }
  },
  [GeodeType.LEGENDARY]: {
    id: GeodeType.LEGENDARY,
    name: "Legendaria",
    description: "Una geoda de leyenda, se dice que solo los elegidos pueden desbloquear su verdadero poder.",
    image: "/geodes/legendary.png",
    color: "#FF8C00",
    basePower: 500,
    baseEfficiency: 95,
    forgeCost: {
      core: "100000000000000000000000",   // 100,000 CORE
      slp: "1000000000000000000000000",  // 1,000,000 SLP
      memento: "250000000000000000000",   // 250 Memento
      axs: "25000000000000000000"        // 25 AXS
    },
    dropRates: {
      common: 2,
      rare: 8,
      epic: 20,
      legendary: 40,
      mythic: 30
    }
  },
  [GeodeType.MYTHIC]: {
    id: GeodeType.MYTHIC,
    name: "Mítica",
    description: "El santo grial de las geodas, su mera existencia desafía la comprensión.",
    image: "/geodes/mythic.png",
    color: "#FF1493",
    basePower: 1000,
    baseEfficiency: 99,
    forgeCost: {
      core: "500000000000000000000000",   // 500,000 CORE
      slp: "5000000000000000000000000",  // 5,000,000 SLP
      memento: "1000000000000000000000",  // 1,000 Memento
      axs: "100000000000000000000"       // 100 AXS
    },
    dropRates: {
      common: 0,
      rare: 2,
      epic: 8,
      legendary: 40,
      mythic: 50
    }
  }
};

// Tipos de CoreMiners
export enum MinerRarity {
  COMMON = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
  MYTHIC = 4
}

export interface MinerStats {
  power: number;
  efficiency: number;
  durability: number;
  luck: number;
  specialAbility?: string;
}

export interface MinerTypeConfig {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity: MinerRarity;
  baseStats: MinerStats;
  upgradeMultipliers: {
    power: number;
    efficiency: number;
    durability: number;
  };
}

// Configuración de tipos de mineros
export const MINER_TYPES: MinerTypeConfig[] = [
  {
    id: 1,
    name: "Novato",
    description: "Un minero básico para principiantes.",
    image: "/miners/novice.png",
    rarity: MinerRarity.COMMON,
    baseStats: {
      power: 10,
      efficiency: 40,
      durability: 100,
      luck: 5
    },
    upgradeMultipliers: {
      power: 1.1,
      efficiency: 1.05,
      durability: 1.02
    }
  },
  // ... más tipos de mineros
];

// Helper functions
export function getGeodeConfig(geodeType: GeodeType): GeodeConfig {
  return GEODE_CONFIGS[geodeType];
}

export function getMinerTypeConfig(typeId: number): MinerTypeConfig | undefined {
  return MINER_TYPES.find(type => type.id === typeId);
}

export function calculateMiningOutput(
  minerStats: MinerStats,
  geodeType: GeodeType
): number {
  const geodeConfig = getGeodeConfig(geodeType);
  return (
    (minerStats.power * 
     (minerStats.efficiency / 100) * 
     (minerStats.luck / 100 + 1) * 
     geodeConfig.basePower) / 100
  );
}

// Tipos para el frontend
export interface GeodeNFT {
  id: string;
  type: GeodeType;
  owner: string;
  createdAt: number;
  image: string;
  name: string;
  description: string;
  stats: {
    power: number;
    efficiency: number;
  };
}

export interface CoreMinerNFT {
  id: string;
  typeId: number;
  owner: string;
  createdAt: number;
  image: string;
  name: string;
  description: string;
  level: number;
  experience: number;
  stats: MinerStats;
  isStaked: boolean;
  lastClaimed: number;
}

// Tipos para las acciones del juego
export enum GameActionType {
  FORGE_GEODE = 'FORGE_GEODE',
  HATCH_GEODE = 'HATCH_GEODE',
  STAKE_MINER = 'STAKE_MINER',
  UNSTAKE_MINER = 'UNSTAKE_MINER',
  CLAIM_REWARDS = 'CLAIM_REWARDS',
  UPGRADE_MINER = 'UPGRADE_MINER'
}

// Configuración de recompensas
export const REWARD_CONFIG = {
  BASE_REWARD_RATE: 1, // CORE por minuto
  REWARD_MULTIPLIER: {
    [MinerRarity.COMMON]: 1,
    [MinerRarity.RARE]: 1.5,
    [MinerRarity.EPIC]: 2.2,
    [MinerRarity.LEGENDARY]: 3.5,
    [MinerRarity.MYTHIC]: 5
  },
  XP_REQUIREMENTS: [
    0,    // Nivel 1
    100,  // Nivel 2
    250,  // Nivel 3
    500,  // ...
    1000,
    2000,
    4000,
    8000,
    16000,
    32000, // Nivel 10
    // ... y así sucesivamente
  ]
};

// Configuración de la economía
export const ECONOMY_CONFIG = {
  // Costos de forja
  FORGE_COST_MULTIPLIER: 1.5, // Multiplicador de costo por nivel
  
  // Recompensas
  DAILY_REWARDS: {
    [MinerRarity.COMMON]: 10,
    [MinerRarity.RARE]: 25,
    [MinerRarity.EPIC]: 60,
    [MinerRarity.LEGENDARY]: 150,
    [MinerRarity.MYTHIC]: 400
  },
  
  // Impuestos y tarifas
  MARKETPLACE_FEE: 0.025, // 2.5%
  UPGRADE_FEE: 0.01,      // 1%
  
  // Recompensas de referencia
  REFERRAL_REWARD: 0.05,  // 5% de las recompensas del referido
  
  // Quema de tokens
  BURN_RATE: 0.2,        // 20% de las tarifas se queman
  
  // Distribución de recompensas
  REWARD_DISTRIBUTION: {
    STAKING: 0.4,        // 40% para staking
    LIQUIDITY: 0.3,      // 30% para liquidez
    TEAM: 0.2,           // 20% para el equipo
    BURN: 0.1            // 10% para quema
  }
};

// Tipos de eventos del juego
export enum GameEventType {
  GEODE_FORGED = 'GEODE_FORGED',
  MINER_HATCHED = 'MINER_HATCHED',
  MINER_UPGRADED = 'MINER_UPGRADED',
  REWARDS_CLAIMED = 'REWARDS_CLAIMED',
  ITEM_PURCHASED = 'ITEM_PURCHASED',
  REFERRAL_REWARD = 'REFERRAL_REWARD'
}

// Interfaz para eventos del juego
export interface GameEvent {
  id: string;
  type: GameEventType;
  timestamp: number;
  user: string;
  details: Record<string, any>;
  txHash?: string;
}

// Configuración de la interfaz de usuario
export const UI_CONFIG = {
  // Colores
  COLORS: {
    [MinerRarity.COMMON]: '#A0A0A0',
    [MinerRarity.RARE]: '#4B9CD3',
    [MinerRarity.EPIC]: '#B36BC2',
    [MinerRarity.LEGENDARY]: '#FFA500',
    [MinerRarity.MYTHIC]: '#FF4500'
  },
  
  // Nombres de rareza
  RARITY_NAMES: {
    [MinerRarity.COMMON]: 'Común',
    [MinerRarity.RARE]: 'Raro',
    [MinerRarity.EPIC]: 'Épico',
    [MinerRarity.LEGENDARY]: 'Legendario',
    [MinerRarity.MYTHIC]: 'Mítico'
  },
  
  // Niveles de experiencia
  LEVELS: [
    { level: 1, xp: 0, name: 'Novato' },
    { level: 2, xp: 100, name: 'Aprendiz' },
    { level: 3, xp: 300, name: 'Intermedio' },
    // ... más niveles
  ]
};

// Función para obtener el nombre de la rareza
export function getRarityName(rarity: MinerRarity): string {
  return UI_CONFIG.RARITY_NAMES[rarity] || 'Desconocido';
}

// Función para obtener el color de la rareza
export function getRarityColor(rarity: MinerRarity): string {
  return UI_CONFIG.COLORS[rarity] || '#000000';
}

// Función para calcular el nivel basado en la experiencia
export function calculateLevel(experience: number): number {
  const levels = UI_CONFIG.LEVELS;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i].xp) {
      return levels[i].level;
    }
  }
  return 1;
}

// Tipos para las transacciones
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  type: GameActionType;
  metadata?: Record<string, any>;
}

// Tipos para el perfil de usuario
export interface UserProfile {
  address: string;
  username?: string;
  avatar?: string;
  joinDate: number;
  totalEarned: number;
  totalStaked: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  referralEarnings: number;
  achievements: string[];
  inventory: {
    geodes: GeodeNFT[];
    miners: CoreMinerNFT[];
  };
  stats: {
    totalMined: number;
    totalStaked: number;
    totalReferrals: number;
    totalTransactions: number;
  };
}

// ========== CONSTANTES SINCRONIZADAS CON SOLIDITY ==========

/**
 * Constantes de mineros (sincronizadas con GameConstants.sol)
 */
export const MINER_CONSTANTS = {
  MAX_DURABILITY: 100,
  MAINTENANCE_COST: "50000000000000000000", // 50 SLP (50 * 10^18)
  EXPERIENCE_TO_LEVEL_UP: 1000,
  BASE_API_URI: "https://api.scorchcore.com/"
};

/**
 * Constantes de forja avanzadas (sincronizadas con GameConstants.sol)
 */
export const FORGE_CONSTANTS = {
  MEMENTO_FAIL_REDUCTION: 1, // 1% por cada 10 Mementos
  MEMENTOS_PER_PERCENT: 10, // 10 Mementos = 1% reducción
  CRITICAL_CHANCE: 1, // 1% de probabilidad crítica
  CRITICAL_POWER_MULTIPLIER: 150, // 150% del poder base
  CRITICAL_EFFICIENCY_BONUS: 20 // +20% eficiencia
};

/**
 * Constantes de staking de Axies (sincronizadas con GameConstants.sol)
 */
export const AXIE_STAKING_CONSTANTS = {
  AXIE_RESONANCE_POWER: 5, // 1 Axie = 5 Poder General
  MIN_STAKING_PERIOD: 604800 // 7 días en segundos
};

/**
 * Constantes de ciclos de minería (sincronizadas con GameConstants.sol)
 */
export const MINING_CYCLE_CONSTANTS = {
  CYCLES: {
    SHORT: {
      duration: 604800, // 7 días
      bonus: 0, // 0%
      name: "Ciclo Corto"
    },
    STANDARD: {
      duration: 1209600, // 14 días
      bonus: 5, // 5%
      name: "Ciclo Estándar"
    },
    COMMITTED: {
      duration: 2592000, // 30 días
      bonus: 10, // 10%
      name: "Ciclo Comprometido"
    },
    STRATEGIC: {
      duration: 5184000, // 60 días
      bonus: 15, // 15%
      name: "Ciclo Estratégico"
    },
    MASTER: {
      duration: 7776000, // 90 días
      bonus: 20, // 20%
      name: "Ciclo Máster"
    }
  }
};

/**
 * Constantes de tokenomics (sincronizadas con GameConstants.sol)
 */
export const TOKENOMICS_CONSTANTS = {
  TOTAL_SUPPLY: "2100000000000000000000000000", // 2.1 mil millones
  MINING_REWARDS_POOL: "1050000000000000000000000000", // 50%
  TREASURY_ALLOCATION: "420000000000000000000000000", // 20%
  ADOPTION_REWARDS: "315000000000000000000000000", // 15%
  TEAM_ALLOCATION: "210000000000000000000000000", // 10%
  INITIAL_LIQUIDITY: "105000000000000000000000000", // 5%
  HALVING_PERIOD: 31536000, // 365 días en segundos
  INITIAL_EMISSION_RATE: "525000000000000000000000000" // Año 1
};

/**
 * Constantes de gobernanza (sincronizadas con GameConstants.sol)
 */
export const GOVERNANCE_CONSTANTS = {
  VOTING_DELAY: 86400, // 1 día en segundos
  VOTING_PERIOD: 259200, // 3 días en segundos
  PROPOSAL_THRESHOLD: "10000000000000000000000", // 10,000 CORE
  QUORUM_PERCENTAGE: 4 // 4%
};

/**
 * Constantes de mercado (sincronizadas con GameConstants.sol)
 */
export const MARKET_CONSTANTS = {
  MARKETPLACE_FEE: 250, // 2.5% (base 10000)
  CREATOR_ROYALTY: 1000, // 10% (base 10000)
  PERCENTAGE_FACTOR: 10000 // 100.00%
};

/**
 * Probabilidades de fallo por defecto por tipo de geoda
 */
export const DEFAULT_FAILURE_PROBABILITIES = {
  [GeodeType.PETIT_BESTIA]: 5,  // 5%
  [GeodeType.BESTIA]: 10,        // 10%
  [GeodeType.GRAN_BESTIA]: 15,   // 15%
  [GeodeType.TITAN]: 20,         // 20%
  [GeodeType.ANCIENT]: 25,       // 25%
  [GeodeType.LEGENDARY]: 30,     // 30%
  [GeodeType.MYTHIC]: 35         // 35%
};

/**
 * Helper para convertir de wei a unidades legibles
 */
export function fromWei(value: string, decimals: number = 18): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const bigValue = BigInt(value);
  const result = Number(bigValue) / Number(divisor);
  return result.toFixed(decimals > 6 ? 6 : decimals);
}

/**
 * Helper para convertir de unidades legibles a wei
 */
export function toWei(value: number, decimals: number = 18): string {
  const multiplier = BigInt(10) ** BigInt(decimals);
  const bigValue = BigInt(Math.floor(value * Math.pow(10, decimals)));
  return bigValue.toString();
}

/**
 * Calcula la reducción de probabilidad de fallo con Mementos
 */
export function calculateFailureReduction(mementosUsed: number): number {
  return Math.floor(mementosUsed / FORGE_CONSTANTS.MEMENTOS_PER_PERCENT);
}

/**
 * Calcula la probabilidad final de fallo considerando Mementos
 */
export function calculateFinalFailureChance(
  geodeType: GeodeType,
  mementosUsed: number
): number {
  const baseFail = DEFAULT_FAILURE_PROBABILITIES[geodeType] || 0;
  const reduction = calculateFailureReduction(mementosUsed);
  return Math.max(0, baseFail - reduction);
}

/**
 * Calcula el poder de resonancia de un usuario basado en Axies stakeados
 */
export function calculateResonancePower(axiesStaked: number): number {
  return axiesStaked * AXIE_STAKING_CONSTANTS.AXIE_RESONANCE_POWER;
}

/**
 * Obtiene información del ciclo de minería por duración
 */
export function getCycleInfo(duration: number) {
  const cycles = MINING_CYCLE_CONSTANTS.CYCLES;
  
  if (duration === cycles.SHORT.duration) return cycles.SHORT;
  if (duration === cycles.STANDARD.duration) return cycles.STANDARD;
  if (duration === cycles.COMMITTED.duration) return cycles.COMMITTED;
  if (duration === cycles.STRATEGIC.duration) return cycles.STRATEGIC;
  if (duration === cycles.MASTER.duration) return cycles.MASTER;
  
  return null;
}

/**
 * Calcula el bonus de minería por ciclo
 */
export function calculateCycleBonus(duration: number): number {
  const cycleInfo = getCycleInfo(duration);
  return cycleInfo ? cycleInfo.bonus : 0;
}

/**
 * Formatea la duración en días
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  if (days === 7) return "1 semana";
  if (days === 14) return "2 semanas";
  if (days === 30) return "1 mes";
  if (days === 60) return "2 meses";
  if (days === 90) return "3 meses";
  return `${days} días`;
}
