/**
 * Tipos compartidos entre múltiples interfaces de contratos
 * Evita duplicación y conflictos de tipos
 * 
 * @pattern DRY (Don't Repeat Yourself)
 */

import type { Address } from 'viem';
import type { TransactionResult } from './IBlockchainContract';

/**
 * Resultado unificado de eclosión de geoda
 * Usado por IGeodeHatcher y IForgeContract
 */
export interface HatchResult {
  success: boolean;
  minerId: bigint;
  category: number;
  minerType: number;
  minerIndex: number;
  isCritical: boolean;
  finalPower: number;
  transaction: TransactionResult;
}

/**
 * Requerimiento de material para una receta
 */
export interface MaterialRequirement {
  tokenAddress: Address;
  amount: bigint;
  tokenType: 'ERC20' | 'ERC721' | 'ERC1155';
}

/**
 * Input de materiales del usuario
 */
export interface MaterialInput {
  tokenAddress: Address;
  amount: bigint;
  tokenIds?: bigint[];
}

/**
 * Probabilidades de éxito de la forja
 */
export interface ForgeChances {
  success: number;
  critical: number;
  rare: number;
}

/**
 * Estructura unificada de receta de forja
 * Combina datos de contrato y UI
 */
export interface Recipe {
  id: number;
  name: string;
  category: number;
  minerType: number;
  minerIndex: number;
  enabled: boolean;
  maxSupply: bigint;
  currentSupply: bigint;
  materials: MaterialRequirement[];
  chances: ForgeChances;
}
