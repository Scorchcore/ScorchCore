/**
 * Interfaces para contratos de tokens (ERC20)
 * CoreToken, fCoreToken, MementoToken
 * Implementa Liskov Substitution Principle (LSP)
 */

import type { Address } from 'viem';
import type { IBlockchainContract, IApprovableContract, TransactionResult } from './IBlockchainContract';

/**
 * Eventos de tokens ERC20
 */
export interface TokenEvents {
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
 * Interfaz base para contratos ERC20
 */
export interface ITokenContract extends IBlockchainContract<TokenEvents> {
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
   * Obtiene el supply total
   */
  totalSupply(): Promise<bigint>;
  
  /**
   * Obtiene el balance de una dirección
   */
  balanceOf(account: Address): Promise<bigint>;
  
  /**
   * Transfiere tokens a otra dirección
   */
  transfer(to: Address, amount: bigint): Promise<TransactionResult>;
  
  /**
   * Obtiene la cantidad aprobada para un spender
   */
  allowance(owner: Address, spender: Address): Promise<bigint>;
  
  /**
   * Aprueba a un spender para gastar tokens
   */
  approve(spender: Address, amount: bigint): Promise<TransactionResult>;
  
  /**
   * Transfiere tokens desde una dirección a otra (requiere aprobación)
   */
  transferFrom(from: Address, to: Address, amount: bigint): Promise<TransactionResult>;
}

/**
 * Interfaz para tokens con capacidad de minting (CoreToken, fCoreToken)
 */
export interface IMintableToken extends ITokenContract {
  /**
   * Mintea tokens a una dirección (requiere MINTER_ROLE)
   */
  mint(to: Address, amount: bigint): Promise<TransactionResult>;
  
  /**
   * Verifica si una dirección tiene el rol de minter
   */
  isMinter(account: Address): Promise<boolean>;
}

/**
 * Interfaz para tokens con capacidad de burning (fCoreToken)
 */
export interface IBurnableToken extends ITokenContract {
  /**
   * Quema tokens del balance del caller
   */
  burn(amount: bigint): Promise<TransactionResult>;
  
  /**
   * Quema tokens de otra dirección (requiere aprobación)
   */
  burnFrom(account: Address, amount: bigint): Promise<TransactionResult>;
}

/**
 * Información de emisión de tokens
 */
export interface EmissionInfo {
  currentRate: bigint; // tokens por segundo
  yearlyRate: bigint;  // tokens por año
  totalEmitted: bigint;
  lastUpdateTime: bigint;
  isActive: boolean;
}

/**
 * Interfaz para el contrato CoreToken
 */
export interface ICoreToken extends IMintableToken {
  /**
   * Obtiene información de emisión actual
   */
  getEmissionInfo(): Promise<EmissionInfo>;
  
  /**
   * Pausa el token (solo admin)
   */
  pause(): Promise<TransactionResult>;
  
  /**
   * Despausa el token (solo admin)
   */
  unpause(): Promise<TransactionResult>;
  
  /**
   * Verifica si el token está pausado
   */
  paused(): Promise<boolean>;
}

/**
 * Información de conversión fCore → Core
 */
export interface ConversionInfo {
  rate: bigint; // basis points (10000 = 100%)
  fee: bigint;  // basis points
  minAmount: bigint;
  maxAmount: bigint;
  enabled: boolean;
}

/**
 * Interfaz para el contrato fCoreToken (rewards token)
 */
export interface IFCoreToken extends IMintableToken, IBurnableToken {
  /**
   * Convierte fCore a Core tokens
   */
  convertToCore(amount: bigint): Promise<TransactionResult & { coreReceived: bigint }>;
  
  /**
   * Obtiene información de conversión
   */
  getConversionInfo(): Promise<ConversionInfo>;
  
  /**
   * Calcula cuánto Core se recibirá por una cantidad de fCore
   */
  previewConversion(fCoreAmount: bigint): Promise<bigint>;
}

/**
 * Interfaz para el contrato fCoreConverter
 */
export interface IFCoreConverter extends IBlockchainContract {
  /**
   * Convierte una cantidad específica de fCore a Core
   * Requiere verificación PoH
   */
  convert(amount: bigint): Promise<TransactionResult>;
  
  /**
   * Convierte todo el balance de fCore del usuario a Core
   * Requiere verificación PoH
   */
  convertAll(): Promise<TransactionResult>;
  
  /**
   * Verifica si un usuario puede convertir fCore
   * Comprueba verificación PoH y balance > 0
   */
  canConvert(user: Address): Promise<boolean>;
  
  /**
   * Obtiene la tasa de conversión fCore → Core
   * @returns tasa en base 1e18 (actualmente 1:1 = 1e18)
   */
  getConversionRate(): Promise<bigint>;
  
  /**
   * Obtiene la cantidad de fCore que un usuario puede convertir
   * Devuelve 0 si no está verificado PoH
   */
  getConvertibleAmount(user: Address): Promise<bigint>;
  
  /**
   * Obtiene la dirección del contrato fCoreToken
   */
  fCoreToken(): Promise<Address>;
  
  /**
   * Obtiene la dirección del contrato CoreToken
   */
  coreToken(): Promise<Address>;
  
  /**
   * Obtiene la dirección del contrato ProofOfHumanityOracle
   */
  pohOracle(): Promise<Address>;
  
  /**
   * Verifica si el contrato está pausado
   */
  paused(): Promise<boolean>;
}

/**
 * Interfaz para el contrato MementoToken
 */
export interface IMementoToken extends ITokenContract {
  /**
   * Obtiene la cantidad de mementos necesarios para reducir riesgo
   */
  getMementoDiscount(amount: bigint): Promise<bigint>;
  
  /**
   * Verifica si un usuario tiene suficientes mementos para una operación
   */
  hasEnoughMementos(user: Address, required: bigint): Promise<boolean>;
}

/**
 * Schedule de emisión
 */
export interface EmissionSchedule {
  period: bigint;
  rate: bigint;
  startTime: bigint;
  endTime: bigint;
}

/**
 * Interfaz para el contrato EmissionSchedule
 */
export interface IEmissionSchedule extends IBlockchainContract {
  /**
   * Obtiene la tasa de emisión actual
   */
  getCurrentRate(): Promise<bigint>;
  
  /**
   * Obtiene el schedule actual
   */
  getCurrentSchedule(): Promise<EmissionSchedule>;
  
  /**
   * Calcula la emisión para un período de tiempo
   */
  calculateEmission(timeElapsed: bigint): Promise<bigint>;
  
  /**
   * Actualiza el schedule (solo admin)
   */
  updateSchedule(newSchedule: EmissionSchedule): Promise<TransactionResult>;
}
