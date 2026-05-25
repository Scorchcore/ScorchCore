/**
 * Synergy Sets - Extracted from GENERAL DATA SCORCHCORE PROTOCOL.csv
 * 
 * Sets de sinergias que otorgan bonus de poder de minería cuando se completan
 */

import { AxieType } from '@/types/game';

export interface SynergySet {
  id: number;
  name: string;
  description: string;
  requiredTypes: AxieType[];
  miningPowerBonus: number;  // Porcentaje de bonus
  requiresSameStage?: boolean;  // Si requiere mismo subtipo
}

export const SYNERGY_SETS: SynergySet[] = [
  {
    id: 1,
    name: 'Cazador Nocturno',
    description: 'Bestia + Ave + Oscuridad',
    requiredTypes: [AxieType.BEAST, AxieType.BIRD, AxieType.DUSK],
    miningPowerBonus: 1.50,
  },
  {
    id: 2,
    name: 'Ecosistema Acuático',
    description: '2 Aqua + 1 Planta',
    requiredTypes: [AxieType.AQUATIC, AxieType.AQUATIC, AxieType.PLANT],
    miningPowerBonus: 2.00,
  },
  {
    id: 3,
    name: 'Maquinaria Avanzada',
    description: '2 Mech + 1 Ultramech',
    requiredTypes: [AxieType.MECH, AxieType.MECH],  // + requisito de etapa ULTRAMECH
    miningPowerBonus: 1.50,
  },
  {
    id: 4,
    name: 'Guardián Ancestral',
    description: 'Reptil + Planta + Dawn',
    requiredTypes: [AxieType.REPTILE, AxieType.PLANT, AxieType.DAWN],
    miningPowerBonus: 2.00,
  },
  {
    id: 5,
    name: 'Enjambre Simbiótico',
    description: '3 Bicho (mismo subtipo)',
    requiredTypes: [AxieType.BUG, AxieType.BUG, AxieType.BUG],
    miningPowerBonus: 1.00,
    requiresSameStage: true,
  },
  {
    id: 6,
    name: 'Fusión Elemental',
    description: 'Bestia + Reptil + Aqua',
    requiredTypes: [AxieType.BEAST, AxieType.REPTILE, AxieType.AQUATIC],
    miningPowerBonus: 1.00,
  },
  {
    id: 7,
    name: 'Equilibrio Cósmico',
    description: 'Dawn + Dusk + Mech',
    requiredTypes: [AxieType.DAWN, AxieType.DUSK, AxieType.MECH],
    miningPowerBonus: 1.00,
  },
  {
    id: 8,
    name: 'Defensa Impenetrable',
    description: '2 Tanque + 1 Planta',
    requiredTypes: [AxieType.PLANT],  // + requisito de etapa TANQUE (2x)
    miningPowerBonus: 2.50,
  },
  {
    id: 9,
    name: 'Acecho Silencioso',
    description: '2 Oscuridad + 1 Ave',
    requiredTypes: [AxieType.DUSK, AxieType.DUSK, AxieType.BIRD],
    miningPowerBonus: 2.50,
  },
  {
    id: 10,
    name: 'Renacimiento Primordial',
    description: 'Dawn + Planta + Aqua',
    requiredTypes: [AxieType.DAWN, AxieType.PLANT, AxieType.AQUATIC],
    miningPowerBonus: 2.00,
  },
];

/**
 * Verifica si un set de CoreMiners completa una sinergia
 */
export function checkSynergy(minerTypes: AxieType[], minerStages?: string[]): SynergySet[] {
  const completedSets: SynergySet[] = [];

  for (const set of SYNERGY_SETS) {
    let isCompleted = true;
    const typesNeeded = [...set.requiredTypes];
    const typesAvailable = [...minerTypes];

    // Verificar si todos los tipos requeridos están presentes
    for (const requiredType of typesNeeded) {
      const index = typesAvailable.indexOf(requiredType);
      if (index === -1) {
        isCompleted = false;
        break;
      }
      typesAvailable.splice(index, 1);
    }

    // Verificar requisito de mismo subtipo si aplica
    if (isCompleted && set.requiresSameStage && minerStages) {
      const stages = minerStages.slice(0, set.requiredTypes.length);
      const firstStage = stages[0];
      if (!stages.every(stage => stage === firstStage)) {
        isCompleted = false;
      }
    }

    if (isCompleted) {
      completedSets.push(set);
    }
  }

  return completedSets;
}

/**
 * Calcula el bonus total de poder de minería de todos los sets completados
 */
export function calculateTotalSynergyBonus(minerTypes: AxieType[], minerStages?: string[]): number {
  const completedSets = checkSynergy(minerTypes, minerStages);
  return completedSets.reduce((total, set) => total + set.miningPowerBonus, 0);
}
