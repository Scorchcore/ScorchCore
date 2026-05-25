/**
 * Tipos compartidos para el módulo Mining
 */

import type { Address } from 'viem';
import type { TransactionReceipt } from 'ethers';

/**
 * Sesión de minería de un CoreMiner
 */
export interface MiningSession {
  owner: Address;
  startTime: bigint;
  lastClaim: bigint;
  power: bigint;
  efficiency: bigint;
  isActive: boolean;
  pendingRewards: bigint;
}

/**
 * Resultado de transacción de minería
 */
export interface MiningTransactionResult {
  hash: string;
  success: boolean;
  receipt?: TransactionReceipt;
}

/**
 * Resultado de claim de recompensas
 */
export interface ClaimResult {
  tx: MiningTransactionResult;
  amount: bigint;
}

/**
 * Información de sesión detallada
 */
export interface SessionInfo {
  session: MiningSession;
  timeElapsed: number;
  estimatedRewards: bigint;
  isActive: boolean;
}
