/**
 * Interfaz para contratos ERC20
 * Implementa Liskov Substitution Principle (LSP)
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Eventos ERC20 estándar
 */
export interface ERC20Events {
  Transfer: {
    from: Address;
    to: Address;
    value: bigint;
  };
  Approval: {
    owner: Address;
    spender: Address;
    value: bigint;
  };
}

/**
 * Interfaz principal para tokens ERC20
 */
export interface IERC20Contract extends IBlockchainContract<ERC20Events> {
  /**
   * Obtiene el balance de tokens de una dirección
   * 
   * @param account - Dirección a consultar
   * @returns Balance en wei
   */
  balanceOf(account: Address): Promise<bigint>;

  /**
   * Obtiene la cantidad de tokens que el spender puede gastar del owner
   * 
   * @param owner - Dueño de los tokens
   * @param spender - Dirección autorizada para gastar
   * @returns Cantidad autorizada
   */
  allowance(owner: Address, spender: Address): Promise<bigint>;

  /**
   * Aprueba a un spender para gastar tokens
   * 
   * @param spender - Dirección a autorizar
   * @param amount - Cantidad a autorizar
   * @returns Resultado de la transacción
   */
  approve(spender: Address, amount: bigint): Promise<TransactionResult>;

  /**
   * Transfiere tokens a otra dirección
   * 
   * @param to - Dirección destino
   * @param amount - Cantidad a transferir
   * @returns Resultado de la transacción
   */
  transfer(to: Address, amount: bigint): Promise<TransactionResult>;

  /**
   * Transfiere tokens desde una dirección (requiere aprobación previa)
   * 
   * @param from - Dirección origen
   * @param to - Dirección destino
   * @param amount - Cantidad a transferir
   * @returns Resultado de la transacción
   */
  transferFrom(from: Address, to: Address, amount: bigint): Promise<TransactionResult>;

  /**
   * Obtiene el nombre del token
   */
  name(): Promise<string>;

  /**
   * Obtiene el símbolo del token
   */
  symbol(): Promise<string>;

  /**
   * Obtiene los decimales del token
   */
  decimals(): Promise<number>;

  /**
   * Obtiene el supply total del token
   */
  totalSupply(): Promise<bigint>;
}
