/**
 * CoreMiners Data - Extracted from GENERAL DATA SCORCHCORE PROTOCOL.csv
 * 
 * Este archivo contiene TODOS los datos reales de los CoreMiners del protocolo:
 * - 9 tipos de Axie (Beast, Aquatic, Bird, Reptile, Bug, Plant, Mech, Dusk, Dawn)
 * - 5 etapas (PETIT, ALTO, ANIMAL, ULTRAMECH, TANQUE)
 * - Diferentes raridades y stats
 */

import { GeodeStage, AxieType, Rarity } from '@/types/game';

export interface CoreMinerStats {
  name: string;
  stage: GeodeStage;
  axieType: AxieType;
  rarity: Rarity;
  units: number;                  // Cantidad total de unidades
  miningPower: number;            // Poder de minado base
  collectionBonus: number;        // Bonus de colección (%)
  obtainProbability: number;      // Probabilidad de obtención (%)
  repairCost: string;            // Costo de reparación
}

// =============================================
// PETIT STAGE (Común) - 10,000 units cada tipo
// =============================================

export const PETIT_STAGE_MINERS: CoreMinerStats[] = [
  // BEAST
  {
    name: 'Petit Bestia',
    stage: GeodeStage.PETIT,
    axieType: AxieType.BEAST,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
  // AQUATIC
  {
    name: 'Petit Aqua',
    stage: GeodeStage.PETIT,
    axieType: AxieType.AQUATIC,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
  // BIRD
  {
    name: 'Petit Ave',
    stage: GeodeStage.PETIT,
    axieType: AxieType.BIRD,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
  // REPTILE
  {
    name: 'Petit Reptil',
    stage: GeodeStage.PETIT,
    axieType: AxieType.REPTILE,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
  // BUG
  {
    name: 'Petit Bicho',
    stage: GeodeStage.PETIT,
    axieType: AxieType.BUG,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
  // PLANT
  {
    name: 'Petit Planta',
    stage: GeodeStage.PETIT,
    axieType: AxieType.PLANT,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
  // MECH
  {
    name: 'Petit Mech',
    stage: GeodeStage.PETIT,
    axieType: AxieType.MECH,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
  // DUSK
  {
    name: 'Petit Dusk',
    stage: GeodeStage.PETIT,
    axieType: AxieType.DUSK,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
  // DAWN
  {
    name: 'Petit Dawn',
    stage: GeodeStage.PETIT,
    axieType: AxieType.DAWN,
    rarity: Rarity.COMMON,
    units: 10000,
    miningPower: 75,
    collectionBonus: 2.0,
    obtainProbability: 25,
    repairCost: '3% producción mensual',
  },
];

// =============================================
// ALTO STAGE (Poco Común) - 7,500 units cada tipo
// =============================================

export const ALTO_STAGE_MINERS: CoreMinerStats[] = [
  // BEAST
  {
    name: 'Alto Bestia',
    stage: GeodeStage.ALTO,
    axieType: AxieType.BEAST,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // AQUATIC
  {
    name: 'Alto Aqua',
    stage: GeodeStage.ALTO,
    axieType: AxieType.AQUATIC,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // BIRD
  {
    name: 'Alto Ave',
    stage: GeodeStage.ALTO,
    axieType: AxieType.BIRD,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // REPTILE
  {
    name: 'Alto Reptil',
    stage: GeodeStage.ALTO,
    axieType: AxieType.REPTILE,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // BUG
  {
    name: 'Alto Bicho',
    stage: GeodeStage.ALTO,
    axieType: AxieType.BUG,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // PLANT
  {
    name: 'Alto Planta',
    stage: GeodeStage.ALTO,
    axieType: AxieType.PLANT,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // MECH
  {
    name: 'Alto Mech',
    stage: GeodeStage.ALTO,
    axieType: AxieType.MECH,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // DUSK
  {
    name: 'Alto Dusk',
    stage: GeodeStage.ALTO,
    axieType: AxieType.DUSK,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // DAWN
  {
    name: 'Alto Dawn',
    stage: GeodeStage.ALTO,
    axieType: AxieType.DAWN,
    rarity: Rarity.UNCOMMON,
    units: 7500,
    miningPower: 125,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
];

// =============================================
// ANIMAL STAGE (Raro) - 5,000 units cada tipo
// =============================================

export const ANIMAL_STAGE_MINERS: CoreMinerStats[] = [
  // BEAST
  {
    name: 'Animal Bestia',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.BEAST,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // AQUATIC
  {
    name: 'Animal Aqua',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.AQUATIC,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // BIRD
  {
    name: 'Animal Ave',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.BIRD,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // REPTILE
  {
    name: 'Animal Reptil',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.REPTILE,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // BUG
  {
    name: 'Animal Bicho',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.BUG,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // PLANT
  {
    name: 'Animal Planta',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.PLANT,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // MECH
  {
    name: 'Animal Mech',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.MECH,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // DUSK
  {
    name: 'Animal Dusk',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.DUSK,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // DAWN
  {
    name: 'Animal Dawn',
    stage: GeodeStage.ANIMAL,
    axieType: AxieType.DAWN,
    rarity: Rarity.RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
];

// =============================================
// ULTRAMECH STAGE (Ultra Raro) - 5,000 units cada tipo
// =============================================

export const ULTRAMECH_STAGE_MINERS: CoreMinerStats[] = [
  // BEAST
  {
    name: 'Ultramech Bestia',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.BEAST,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // AQUATIC
  {
    name: 'Ultramech Aqua',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.AQUATIC,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // BIRD
  {
    name: 'Ultramech Ave',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.BIRD,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // REPTILE
  {
    name: 'Ultramech Reptil',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.REPTILE,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // BUG
  {
    name: 'Ultramech Bicho',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.BUG,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // PLANT
  {
    name: 'Ultramech Planta',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.PLANT,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // MECH
  {
    name: 'Ultramech Mech',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.MECH,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // DUSK
  {
    name: 'Ultramech Dusk',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.DUSK,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // DAWN
  {
    name: 'Ultramech Dawn',
    stage: GeodeStage.ULTRAMECH,
    axieType: AxieType.DAWN,
    rarity: Rarity.VERY_RARE,
    units: 5000,
    miningPower: 165,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
];

// =============================================
// TANQUE STAGE (Épico) - 5,000 units cada tipo
// =============================================

export const TANQUE_STAGE_MINERS: CoreMinerStats[] = [
  // BEAST
  {
    name: 'Tanque Bestia',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.BEAST,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // AQUATIC
  {
    name: 'Tanque Aqua',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.AQUATIC,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // BIRD
  {
    name: 'Tanque Ave',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.BIRD,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // REPTILE
  {
    name: 'Tanque Reptil',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.REPTILE,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // BUG
  {
    name: 'Tanque Bicho',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.BUG,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // PLANT
  {
    name: 'Tanque Planta',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.PLANT,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // MECH
  {
    name: 'Tanque Mech',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.MECH,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // DUSK
  {
    name: 'Tanque Dusk',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.DUSK,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
  // DAWN
  {
    name: 'Tanque Dawn',
    stage: GeodeStage.TANQUE,
    axieType: AxieType.DAWN,
    rarity: Rarity.EPIC,
    units: 5000,
    miningPower: 200,
    collectionBonus: 2.0,
    obtainProbability: 20,
    repairCost: '3% producción mensual',
  },
];

// =============================================
// ALL COREMINERS COMBINED
// =============================================

export const ALL_COREMINERS: CoreMinerStats[] = [
  ...PETIT_STAGE_MINERS,
  ...ALTO_STAGE_MINERS,
  ...ANIMAL_STAGE_MINERS,
  ...ULTRAMECH_STAGE_MINERS,
  ...TANQUE_STAGE_MINERS,
];

// TOTALES
export const TOTALS = {
  PETIT: 90000,        // 10,000 × 9 tipos
  ALTO: 67500,         // 7,500 × 9 tipos
  ANIMAL: 45000,       // 5,000 × 9 tipos
  ULTRAMECH: 45000,    // 5,000 × 9 tipos
  TANQUE: 45000,       // 5,000 × 9 tipos
  GRAND_TOTAL: 292500, // Total de CoreMiners
};
