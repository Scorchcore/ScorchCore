/**
 * Tipos compartidos para el módulo Forge
 * 
 * **NOTA:** Las constantes (GEODE_COSTS, etc.) se han movido a @/lib/constants/forge
 * Este archivo mantiene solo las definiciones de tipos para evitar dependencias circulares.
 */

import type { Address } from 'viem';

// Re-export tipos y enums desde constants/forge
export { GeodeType, GEODE_COSTS } from '@/lib/constants/forge';
export type { ForgeCosts } from '@/lib/constants/forge';

/**
 * Balances de tokens
 */
export interface TokenBalances {
  axs: string;
  slp: string;
  memento: string;
}

/**
 * Estado de aprobaciones
 */
export interface ApprovalStatus {
  axsApproved: boolean;
  slpApproved: boolean;
  mementoApproved: boolean;
}

// Re-export tipos de interfaces
export type { 
  ForgeResult, 
  HatchResult, 
  MaterialInput, 
  Recipe 
} from '@/lib/contracts/interfaces';
