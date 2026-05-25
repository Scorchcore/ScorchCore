/**
 * Interfaz base para todos los contratos blockchain
 * Aplicando Liskov Substitution Principle (LSP)
 * 
 * Todas las implementaciones de contratos deben extender esta interfaz
 * para garantizar intercambiabilidad y consistencia
 */

import type { Address } from 'viem';
import type { TransactionReceipt, TransactionResponse } from 'ethers';

/**
 * Resultado de una transacción blockchain
 */
export interface TransactionResult {
  hash: string;
  success: boolean;
  receipt?: TransactionReceipt;
  error?: Error;
}

/**
 * Estado de conexión del contrato
 */
export interface ContractStatus {
  address: Address;
  isConnected: boolean;
  chainId: number;
}

/**
 * Interfaz base que todos los contratos deben implementar
 * 
 * @template TEvent - Tipo de eventos que el contrato puede emitir
 */
export interface IBlockchainContract<TEvent = unknown> {
  /**
   * Dirección del contrato en la blockchain
   */
  readonly address: Address;
  
  /**
   * Chain ID donde está desplegado el contrato
   */
  readonly chainId: number;
  
  /**
   * Obtiene el estado actual de conexión del contrato
   */
  getStatus(): Promise<ContractStatus>;
  
  /**
   * Verifica si el contrato está correctamente desplegado
   */
  isDeployed(): Promise<boolean>;
  
  /**
   * Suscribirse a eventos del contrato
   * 
   * @param eventName - Nombre del evento
   * @param callback - Función a ejecutar cuando el evento ocurra
   * @returns Función para cancelar la suscripción
   */
  on(eventName: string, callback: (event: TEvent) => void): () => void;
}

/**
 * Interfaz para contratos que requieren aprobación de tokens
 */
export interface IApprovableContract extends IBlockchainContract {
  /**
   * Verifica si el usuario tiene aprobación suficiente
   * 
   * @param owner - Dirección del dueño de los tokens
   * @param spender - Dirección del contrato que gastará los tokens
   * @param amount - Cantidad a verificar
   */
  hasApproval(owner: Address, spender: Address, amount: bigint): Promise<boolean>;
  
  /**
   * Solicita aprobación para gastar tokens
   * 
   * @param spender - Dirección del contrato que gastará
   * @param amount - Cantidad a aprobar
   */
  approve(spender: Address, amount: bigint): Promise<TransactionResult>;
}

/**
 * Interfaz para contratos con control de acceso basado en roles
 */
export interface IAccessControlledContract extends IBlockchainContract {
  /**
   * Verifica si una dirección tiene un rol específico
   * 
   * @param role - Hash del rol (bytes32)
   * @param account - Dirección a verificar
   */
  hasRole(role: string, account: Address): Promise<boolean>;
  
  /**
   * Obtiene el rol de administrador
   */
  getAdminRole(): Promise<string>;
}
