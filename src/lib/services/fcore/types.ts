/**
 * Types para el módulo fCore (Anti-Bot System)
 */

import type { Address } from 'viem';

/**
 * Estado de balance de fCORE de un usuario
 */
export interface fCoreBalanceState {
  balance: bigint;
  balanceFormatted: string;
  canConvert: boolean;
  isPohVerified: boolean;
  convertibleAmount: bigint;
  conversionRate: bigint;
}

/**
 * Información de verificación PoH de un usuario
 */
export interface PohVerificationInfo {
  isVerified: boolean;
  level: number;
  timestamp: bigint;
  expiresAt: bigint;
  isExpired: boolean;
}

/**
 * Parámetros para convertir fCORE
 */
export interface ConvertfCoreParams {
  amount?: bigint; // Si no se especifica, convierte todo
  userAddress: Address;
}

/**
 * Resultado de conversión de fCORE
 */
export interface ConvertfCoreResult {
  success: boolean;
  txHash?: string;
  fCoreConverted: bigint;
  coreReceived: bigint;
  error?: string;
}

/**
 * Información consolidada del sistema fCORE para un usuario
 */
export interface fCoreSystemInfo {
  fCoreBalance: fCoreBalanceState;
  pohVerification: PohVerificationInfo;
  canPerformConversion: boolean;
  estimatedCoreReceivable: bigint;
}
