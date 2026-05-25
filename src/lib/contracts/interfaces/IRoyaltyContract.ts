/**
 * IRoyaltyContract - Interfaz para RoyaltyManager
 * 
 * @pattern Strategy Pattern - Diferentes configuraciones de royalties por colección
 * @principle ISP - Interfaz específica para Royalties
 * 
 * Sistema de royalties EIP-2981 compatible:
 * - Royalties configurables por colección NFT
 * - Default receiver y fraction configurables
 * - Collection-specific overrides
 * - Compatible con marketplaces (Mavis Market, OpenSea, etc.)
 * 
 * NOTA: Este contrato NO maneja acumulación/claim de royalties.
 * Los royalties se pagan directamente en cada venta por el marketplace.
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Información de royalty según EIP-2981
 */
export interface RoyaltyInfo {
  receiver: Address;        // Dirección que recibe el royalty
  royaltyAmount: bigint;    // Monto del royalty en wei
  royaltyFraction: number;  // Fracción en basis points (ej: 250 = 2.5%)
}

/**
 * Configuración de royalty para una colección NFT
 */
export interface CollectionRoyaltyConfig {
  collection: Address;
  receiver: Address;
  royaltyFraction: number;  // En basis points (500 = 5%)
  isDefault: boolean;       // Si usa default o tiene override
}

/**
 * Eventos del contrato RoyaltyManager
 */
export interface RoyaltyEvents {
  DefaultRoyaltyUpdated: {
    receiver: Address;
    royaltyFraction: bigint;
  };
  CollectionRoyaltyUpdated: {
    collection: Address;
    receiver: Address;
    royaltyFraction: bigint;
  };
}

/**
 * Interfaz del contrato RoyaltyManager
 * Compatible con EIP-2981 (Royalty Standard)
 */
export interface IRoyaltyContract extends IBlockchainContract<RoyaltyEvents> {
  /**
   * Obtiene información de royalty para una colección y precio de venta
   * 
   * @param collection - Dirección del contrato NFT
   * @param salePrice - Precio de venta en wei
   * @returns RoyaltyInfo con receiver y monto
   */
  getRoyaltyInfoFor(
    collection: Address,
    salePrice: bigint
  ): Promise<RoyaltyInfo>;

  /**
   * Obtiene configuración de royalty para una colección
   * 
   * @param collection - Dirección del contrato NFT
   * @returns Receiver y royalty fraction
   */
  getCollectionRoyalty(
    collection: Address
  ): Promise<{ receiver: Address; royaltyFraction: bigint }>;

  /**
   * Establece royalty por defecto global
   * Solo ROYALTY_MANAGER_ROLE
   * 
   * @param receiver - Dirección que recibirá royalties
   * @param royaltyFraction - Fee en basis points (500 = 5%)
   * @returns Resultado de la transacción
   */
  setDefaultRoyalty(
    receiver: Address,
    royaltyFraction: bigint
  ): Promise<TransactionResult>;

  /**
   * Establece royalty específico para una colección
   * Solo ROYALTY_MANAGER_ROLE
   * 
   * @param collection - Dirección del contrato NFT
   * @param receiver - Dirección que recibirá royalties
   * @param royaltyFraction - Fee en basis points
   * @returns Resultado de la transacción
   */
  setCollectionRoyalty(
    collection: Address,
    receiver: Address,
    royaltyFraction: bigint
  ): Promise<TransactionResult>;

  /**
   * Elimina royalty específico de una colección (vuelve a default)
   * Solo ROYALTY_MANAGER_ROLE
   * 
   * @param collection - Dirección del contrato NFT
   * @returns Resultado de la transacción
   */
  removeCollectionRoyalty(collection: Address): Promise<TransactionResult>;

  /**
   * Obtiene el receiver por defecto
   * 
   * @returns Dirección del receiver por defecto
   */
  defaultReceiver(): Promise<Address>;

  /**
   * Obtiene la fracción de royalty por defecto
   * 
   * @returns Royalty fraction en basis points
   */
  defaultRoyaltyFraction(): Promise<bigint>;

  /**
   * Obtiene el royalty máximo permitido
   * 
   * @returns MAX_ROYALTY (1000 = 10%)
   */
  MAX_ROYALTY(): Promise<bigint>;

  /**
   * Obtiene el royalty por defecto
   * 
   * @returns DEFAULT_ROYALTY (500 = 5%)
   */
  DEFAULT_ROYALTY(): Promise<bigint>;
}

/**
 * Helper para convertir basis points a porcentaje
 * 
 * @param basisPoints - Valor en basis points (100 = 1%)
 * @returns Porcentaje como número decimal
 */
export function basisPointsToPercent(basisPoints: number | bigint): number {
  return Number(basisPoints) / 100;
}

/**
 * Helper para convertir porcentaje a basis points
 * 
 * @param percent - Porcentaje (2.5 = 2.5%)
 * @returns Basis points (250)
 */
export function percentToBasisPoints(percent: number): number {
  return Math.round(percent * 100);
}

/**
 * Helper para formatear monto de royalty con símbolo
 * 
 * @param amount - Monto en wei
 * @param symbol - Símbolo del token (default 'CORE')
 * @returns String formateado
 */
export function formatRoyaltyAmount(amount: bigint, symbol: string = 'CORE'): string {
  const eth = Number(amount) / 1e18;
  return `${eth.toFixed(4)} ${symbol}`;
}
