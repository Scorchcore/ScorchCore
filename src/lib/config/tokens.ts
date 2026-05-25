/**
 * Token addresses configuration
 * Centralized token addresses for easy access
 */

import type { Address } from 'viem';

/**
 * Token addresses on Ronin Testnet (Saigon)
 */
export const TOKEN_ADDRESSES = {
  // External tokens
  AXS: '0x32950db2a7164aE833121501C797D79E7B79d74C' as Address,
  SLP: '0xa8754b9Fa15fc18BB59458815510E40a12cD2014' as Address,
  
  // ScorchCore tokens
  CORE: '0x725d916F4f9212057A63E3BE1B4790BCe8720bf5' as Address,
  FCORE: '0xF525F3C43888da15d18cbE4006e0c173FC84f363' as Address,
  MEMENTO: '0x0A73769f6F1e1f4D1fca673296D34B9A0BF030EC' as Address,
} as const;

/**
 * Token decimals
 */
export const TOKEN_DECIMALS = {
  AXS: 18,
  SLP: 0,
  CORE: 18,
  FCORE: 18,
  MEMENTO: 0,
} as const;

/**
 * Token symbols
 */
export const TOKEN_SYMBOLS = {
  AXS: 'AXS',
  SLP: 'SLP',
  CORE: 'CORE',
  FCORE: 'fCORE',
  MEMENTO: 'MEMENTO',
} as const;

export type TokenSymbol = keyof typeof TOKEN_ADDRESSES;

/**
 * Helper para obtener dirección de token por símbolo
 */
export function getTokenAddress(symbol: TokenSymbol): Address {
  return TOKEN_ADDRESSES[symbol];
}

/**
 * Helper para obtener decimales de token por símbolo
 */
export function getTokenDecimals(symbol: TokenSymbol): number {
  return TOKEN_DECIMALS[symbol];
}
