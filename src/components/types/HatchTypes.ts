/**
 * Types for Hatch/Roulette components
 * Elimina any types en componentes de eclosión
 */

import type { GeodeCategory, AxieClass } from '@/lib/constants/geodes';

/**
 * Resultado de eclosión de geoda
 */
export interface HatchResult {
  id?: bigint;
  minerId: bigint;
  name: string;
  rarity: string;
  power: number;
  efficiency: number;
  category: number;
  minerType: number;
  minerIndex: number;
  axieClass: AxieClass;
  videoPath: string;
  isCritical?: boolean;
}
