/**
 * Tipos compartidos para el módulo Token
 * 
 * Interfaces para gestión de tokens ERC20:
 * - Balances
 * - Aprobaciones
 * - Configuración
 * - Información de tokens
 */

import type { Address } from 'viem';

/**
 * Balance de un token
 */
export interface TokenBalance {
  address: Address;
  symbol: string;
  balance: bigint;
  decimals: number;
  formatted: string;
}

/**
 * Múltiples balances de tokens
 */
export interface TokenBalances {
  [symbol: string]: TokenBalance;
}

/**
 * Estado de aprobación de un token
 */
export interface TokenApproval {
  token: Address;
  owner: Address;
  spender: Address;
  allowance: bigint;
  isApproved: boolean;
}

/**
 * Configuración de token para consultas
 */
export interface TokenConfig {
  address: Address;
  symbol: string;
  decimals?: number;
}

/**
 * Información completa de un token ERC20
 */
export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: bigint;
}

/**
 * Interfaz para servicios de gestión de tokens ERC20
 * 
 * Define el contrato que deben cumplir todos los servicios de tokens,
 * permitiendo implementaciones alternativas (con caché, con logging, etc.)
 * 
 * @pattern Strategy (GoF)
 */
export interface ITokenService {
  getBalance(tokenAddress: Address, userAddress: Address): Promise<bigint>;
  getFormattedBalance(tokenAddress: Address, userAddress: Address, decimals?: number): Promise<string>;
  getMultipleBalances(tokens: Array<TokenConfig>, userAddress: Address): Promise<TokenBalances>;
  checkApproval(tokenAddress: Address, owner: Address, spender: Address, amount: bigint): Promise<TokenApproval>;
  approve(tokenAddress: Address, spender: Address, amount: bigint): Promise<{ hash: string; success: boolean }>;
  approveMax(tokenAddress: Address, spender: Address): Promise<{ hash: string; success: boolean }>;
  revokeApproval(tokenAddress: Address, spender: Address): Promise<{ hash: string; success: boolean }>;
  getTokenInfo(tokenAddress: Address): Promise<TokenInfo>;
  getAllowance(tokenAddress: Address, owner: Address, spender: Address): Promise<bigint>;
}

/**
 * Resultado de una operación de aprobación
 */
export interface ApprovalResult {
  hash: string;
  success: boolean;
  token: Address;
  spender: Address;
  amount: bigint;
}
