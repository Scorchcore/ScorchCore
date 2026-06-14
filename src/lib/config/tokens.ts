/**
 * Token addresses configuration
 * Centralized token addresses for easy access
 */

import type { Address } from "viem";

/**
 * Token addresses on Ronin Testnet (Saigon)
 */
export const TOKEN_ADDRESSES = {
  // External tokens
  // Mock AXS de Saigon L2 ("Axie Infinity Shard", 18 dec, mint público).
  // Es la dirección que referencia el MaterialValidator desplegado (axsToken()).
  AXS: "0x3C4e17b9056272Ce1b49F6900d8cFD6171a1869d" as Address,
  // ⚠️ SLP no tiene contrato desplegado en Saigon L2 (202601); dirección heredada de la Saigon antigua.
  SLP: "0xa8754b9Fa15fc18BB59458815510E40a12cD2014" as Address,

  // ScorchCore tokens
  CORE: "0x725d916F4f9212057A63E3BE1B4790BCe8720bf5" as Address,
  FCORE: "0xF525F3C43888da15d18cbE4006e0c173FC84f363" as Address,
  // ⚠️ El MementoToken real es 0xfa3Ab001DA96e9D97574cec97D0e1A1eFc53CA25 (ERC1155
  // multi-type, IDs 0-8) y no soporta esta interfaz ERC20. Los balances reales se
  // leen vía contracts.mementos / useMementoBalancesQuery.
  MEMENTO: "0x0A73769f6F1e1f4D1fca673296D34B9A0BF030EC" as Address,
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
  AXS: "AXS",
  SLP: "SLP",
  CORE: "CORE",
  FCORE: "fCORE",
  MEMENTO: "MEMENTO",
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
