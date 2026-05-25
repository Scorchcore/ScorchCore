// Game-related types

// Refactorizado de enum a const object para mejor compatibilidad TypeScript
export const GeodeStage = {
  PETIT: 'PETIT',
  ALTO: 'ALTO',
  ANIMAL: 'ANIMAL',
  ULTRAMECH: 'ULTRAMECH',
  TANQUE: 'TANQUE',
} as const;

export type GeodeStage = typeof GeodeStage[keyof typeof GeodeStage];

export const AxieType = {
  BEAST: 'BEAST',      // Bestia
  AQUATIC: 'AQUATIC',  // Aqua
  BIRD: 'BIRD',        // Ave
  REPTILE: 'REPTILE',  // Reptil
  BUG: 'BUG',          // Bicho
  PLANT: 'PLANT',      // Planta
  MECH: 'MECH',        // Mech
  DUSK: 'DUSK',        // Dusk (Oscuridad)
  DAWN: 'DAWN',        // Dawn (Amanecer)
} as const;

export type AxieType = typeof AxieType[keyof typeof AxieType];

export const Rarity = {
  COMMON: 'COMMON',           // Común
  UNCOMMON: 'UNCOMMON',       // Poco Común
  RARE: 'RARE',               // Raro
  VERY_RARE: 'VERY_RARE',     // Ultra Raro
  EPIC: 'EPIC',               // Épico
  LEGENDARY: 'LEGENDARY',     // Legendario
} as const;

export type Rarity = typeof Rarity[keyof typeof Rarity];

export const MinerType = {
  BEAST: 0,
  AQUATIC: 1,
  BIRD: 2,
  REPTILE: 3,
  BUG: 4,
  PLANT: 5,
  MECH: 6,
  ULTRAMECH: 7,
  DUSK: 8,
  DAWN: 9,
  TANQUE: 10,
} as const;

export type MinerType = typeof MinerType[keyof typeof MinerType];

export const TicketLevel = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
} as const;

export type TicketLevel = typeof TicketLevel[keyof typeof TicketLevel];

export interface Geode {
  id: string;
  stage: GeodeStage;              // Etapa de la Geoda (PETIT, ALTO, etc.)
  axieType: AxieType;             // Tipo de Axie (BEAST, AQUATIC, etc.)
  rarity: Rarity;                 // Rareza intrínseca
  owner: string;
  createdAt: number;
  hatchTime: number;               // Tiempo de incubación
  isHatched: boolean;
  miningPower: number;             // Poder de minado
  collectionBonus: number;         // Bonus de colección (%)
}

export interface CoreMiner {
  tokenId: bigint;
  name: string;                    // Nombre del CoreMiner (ej: "Agile Pup", "Pack Leader")
  stage: GeodeStage;               // Etapa (PETIT, ALTO, ANIMAL, ULTRAMECH, TANQUE)
  axieType: AxieType;              // Tipo de Axie
  rarity: Rarity;                  // Rareza
  miningPower: number;             // Poder de minado base
  efficiency: number;              // Eficiencia actual (%)
  collectionBonus: number;         // Bonus de colección (%)
  repairCost: number;              // Costo de reparación (% de producción mensual)
  owner: string;
  isMining: boolean;
  lastClaimTime: number;
  totalMined: bigint;
  // Campos adicionales del contrato
  durability: bigint;
  level: bigint;
  experience: bigint;
  isVoracious: boolean;
  lastFed: number;
  minerType: MinerType;
}

export interface MiningCycle {
  minerId: bigint;
  owner: string;
  cycleDuration: number;
  startTime: number;
  endTime: number;
  bonusPercentage: number;
  powerAtStart: bigint;
}

export interface StakedAxie {
  tokenId: bigint;
  owner: string;
  stakedAt: number;
  resonancePower: number;
}

export interface BurnTicket {
  tokenId: bigint;
  level: TicketLevel;
  owner: string;
  maxBurnsPerDay: number;
  usageCount: number;
}

export interface ForgeCost {
  coreCost: bigint;
  slpCost: bigint;
  mementoCost: bigint;
  axsCost: bigint;
}

export interface SetSynergy {
  setId: number;
  name: string;
  bonusPercentage: number;
  isCompleted: boolean;
  requiredTypes: MinerType[];
}
