/**
 * Tokenomics & Emission Schedule - Extracted from GENERAL DATA SCORCHCORE PROTOCOL.csv
 * 
 * Sistema de emisión de $CORE y economía del protocolo
 */

// =============================================
// SUPPLY TOTALES
// =============================================

export const CORE_TOKEN_SUPPLY = {
  TOTAL_SUPPLY: 2_100_000_000n,              // 2.1 Billion $CORE
  MINING_ALLOCATION: 1_050_000_000n,         // 50% para minería
  MINING_PERCENTAGE: 50,                     // 50% del supply total
};

// =============================================
// EMISIÓN ANUAL DE $CORE
// =============================================

export interface EmissionYear {
  year: number;
  annualEmission: number;
  cumulativeEmission: number;
  percentageOfTotal: number;
}

export const EMISSION_SCHEDULE: EmissionYear[] = [
  {
    year: 1,
    annualEmission: 525_000_000,
    cumulativeEmission: 525_000_000,
    percentageOfTotal: 25.00,
  },
  {
    year: 2,
    annualEmission: 262_500_000,
    cumulativeEmission: 787_500_000,
    percentageOfTotal: 37.50,
  },
  {
    year: 3,
    annualEmission: 131_250_000,
    cumulativeEmission: 918_750_000,
    percentageOfTotal: 43.75,
  },
  {
    year: 4,
    annualEmission: 65_625_000,
    cumulativeEmission: 984_375_000,
    percentageOfTotal: 46.88,
  },
  {
    year: 5,
    annualEmission: 32_812_500,
    cumulativeEmission: 1_017_187_500,
    percentageOfTotal: 48.44,
  },
  {
    year: 6,
    annualEmission: 16_406_250,
    cumulativeEmission: 1_033_593_750,
    percentageOfTotal: 49.22,
  },
  {
    year: 7,
    annualEmission: 8_203_125,
    cumulativeEmission: 1_041_796_875,
    percentageOfTotal: 49.61,
  },
  {
    year: 8,
    annualEmission: 4_101_563,
    cumulativeEmission: 1_045_898_438,
    percentageOfTotal: 49.80,
  },
  {
    year: 9,
    annualEmission: 2_050_781,
    cumulativeEmission: 1_047_949_219,
    percentageOfTotal: 49.90,
  },
  {
    year: 10,
    annualEmission: 1_025_391,
    cumulativeEmission: 1_048_974_610,
    percentageOfTotal: 49.95,
  },
  {
    year: 11,
    annualEmission: 512_695,
    cumulativeEmission: 1_049_487_305,
    percentageOfTotal: 49.98,
  },
  {
    year: 12,
    annualEmission: 256_348,
    cumulativeEmission: 1_049_743_653,
    percentageOfTotal: 49.99,
  },
  // ... continúa hasta agotar el supply
];

/**
 * Obtiene la emisión anual para un año específico
 */
export function getAnnualEmission(year: number): number {
  const emission = EMISSION_SCHEDULE.find(e => e.year === year);
  return emission?.annualEmission || 0;
}

/**
 * Obtiene la emisión acumulada hasta un año específico
 */
export function getCumulativeEmission(year: number): number {
  const emission = EMISSION_SCHEDULE.find(e => e.year === year);
  return emission?.cumulativeEmission || 0;
}

/**
 * Calcula la emisión por día para un año específico
 */
export function getDailyEmission(year: number): number {
  const annualEmission = getAnnualEmission(year);
  return annualEmission / 365;
}

/**
 * Calcula la emisión por hora para un año específico
 */
export function getHourlyEmission(year: number): number {
  const dailyEmission = getDailyEmission(year);
  return dailyEmission / 24;
}

// =============================================
// CÁLCULOS DE RECOMPENSAS
// =============================================

/**
 * Calcula las recompensas de minería basado en:
 * - Poder de minado del CoreMiner
 * - Duración del ciclo
 * - Bonus de sinergia
 * - Año actual del protocolo
 */
export function calculateMiningRewards(
  miningPower: number,
  cycleDuration: number,  // en segundos
  synergyBonus: number = 0,
  protocolYear: number = 1
): number {
  const hourlyEmission = getHourlyEmission(protocolYear);
  const hours = cycleDuration / 3600;
  
  // Fórmula base: (poder / poder_total) * emisión_por_hora * horas
  // Simplified: asumiendo distribución equitativa entre todos los miners activos
  const baseReward = (miningPower / 1000) * hourlyEmission * hours;
  
  // Aplicar bonus de sinergia
  const bonusMultiplier = 1 + (synergyBonus / 100);
  
  return baseReward * bonusMultiplier;
}

// =============================================
// DISTRIBUCIÓN DEL SUPPLY
// =============================================

export const SUPPLY_DISTRIBUTION = {
  MINING: {
    percentage: 50,
    amount: 1_050_000_000,
    description: 'Minería de CoreMiners',
  },
  TEAM: {
    percentage: 15,
    amount: 315_000_000,
    description: 'Equipo y desarrollo',
  },
  COMMUNITY: {
    percentage: 20,
    amount: 420_000_000,
    description: 'Comunidad y ecosistema',
  },
  LIQUIDITY: {
    percentage: 10,
    amount: 210_000_000,
    description: 'Liquidez y market making',
  },
  RESERVES: {
    percentage: 5,
    amount: 105_000_000,
    description: 'Reservas del protocolo',
  },
};

// =============================================
// FEES Y COSTOS
// =============================================

export const PROTOCOL_FEES = {
  FORGE_FEE: 0.03,              // 3% fee de forja
  REPAIR_FEE_MIN: 0.03,         // 3% mínimo de reparación
  REPAIR_FEE_MAX: 0.06,         // 6% máximo de reparación
  STAKING_WITHDRAWAL_FEE: 0.01, // 1% fee de retiro de staking
  MARKETPLACE_FEE: 0.025,       // 2.5% fee de marketplace
};

/**
 * Calcula el costo de reparación de un CoreMiner
 */
export function calculateRepairCost(
  monthlyProduction: number,
  repairPercentage: number = 0.03
): number {
  return monthlyProduction * repairPercentage;
}

/**
 * Calcula el costo de forja basado en la etapa
 */
export function calculateForgeCost(stage: string): {
  slpCost: number;
  memento?: string;
} {
  switch (stage) {
    case 'PETIT':
      return { slpCost: 150 };
    case 'ALTO':
    case 'ANIMAL':
    case 'ULTRAMECH':
    case 'TANQUE':
      return { slpCost: 250, memento: 'Tipo específico' };
    default:
      return { slpCost: 0 };
  }
}
