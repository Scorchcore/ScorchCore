/**
 * Interfaces para contratos de economía (Phase 2A)
 * VestingManager, PriceOracle, BuyBackFund, RoyaltyManager
 * Implementa Liskov Substitution Principle (LSP)
 */

import type { Address } from 'viem';
import type { IBlockchainContract, TransactionResult } from './IBlockchainContract';

/**
 * Schedule de vesting (coincide con struct del contrato)
 */
export interface VestingSchedule {
  beneficiary: Address;
  totalAmount: bigint;
  startTime: bigint;
  duration: bigint;
  releasedAmount: bigint;
  revocable: boolean;
  revoked: boolean;
}

/**
 * Interfaz para el contrato VestingManager
 */
export interface IVestingManager extends IBlockchainContract {
  /**
   * Crea un nuevo schedule de vesting (solo VESTING_MANAGER_ROLE)
   * 
   * @param token - Token address (SLP/AXS/CORE)
   * @param beneficiary - Quien recibe los tokens
   * @param amount - Monto total a bloquear
   * @param startTime - Cuando inicia (0 = ahora)
   * @param duration - Duración (0 = default 180 días)
   * @param revocable - Si puede ser revocado por admin
   */
  createSchedule(
    token: Address,
    beneficiary: Address,
    amount: bigint,
    startTime: bigint,
    duration: bigint,
    revocable: boolean
  ): Promise<TransactionResult & { scheduleId: bigint }>;
  
  /**
   * Libera tokens vested disponibles
   */
  release(scheduleId: bigint): Promise<TransactionResult>;
  
  /**
   * Revoca un schedule (solo admin, solo si revocable)
   */
  revoke(scheduleId: bigint): Promise<TransactionResult>;
  
  /**
   * Obtiene información de un schedule
   */
  getSchedule(scheduleId: bigint): Promise<VestingSchedule>;
  
  /**
   * Obtiene el monto vested hasta ahora
   */
  getVestedAmount(scheduleId: bigint): Promise<bigint>;
  
  /**
   * Obtiene el monto disponible para liberar (vested - released)
   */
  getReleasableAmount(scheduleId: bigint): Promise<bigint>;
  
  /**
   * Obtiene todos los schedules de un usuario
   */
  getUserSchedules(user: Address): Promise<bigint[]>;
  
  /**
   * Obtiene el total bloqueado de un usuario
   */
  getUserTotalLocked(user: Address): Promise<bigint>;
  
  /**
   * Obtiene el total bloqueado global
   */
  totalLocked(): Promise<bigint>;
  
  /**
   * Duración de vesting por defecto (180 días)
   */
  DEFAULT_VESTING_DURATION(): Promise<bigint>;
  
  /**
   * Porcentaje de burn inmediato (15%)
   */
  BURN_PERCENTAGE(): Promise<bigint>;
  
  /**
   * Porcentaje que se veste (85%)
   */
  VESTING_PERCENTAGE(): Promise<bigint>;
}

/**
 * Información de precio
 */
export interface PriceInfo {
  token: Address;
  priceInUSD: bigint; // con 18 decimales
  lastUpdate: bigint;
  source: string;
  isValid: boolean;
}

/**
 * Información de precio para UI (formato simplificado)
 */
export interface PriceInfoUI {
  price: bigint;              // Precio actual (18 decimals)
  priceUSD: number;          // Precio en USD formateado
  lastUpdate: number;        // Timestamp última actualización
  isFresh: boolean;          // Si el precio es reciente
  age: number;               // Edad del precio en segundos
}

/**
 * Interfaz para el contrato PriceOracle
 * Contrato simple que obtiene precio de CORE token
 */
export interface IPriceOracle extends IBlockchainContract {
  /**
   * Obtiene el precio actual de CORE
   * @returns precio en USD (18 decimals)
   */
  getCurrentPrice(): Promise<bigint>;
  
  /**
   * Obtiene el timestamp de la última actualización
   * @returns timestamp Unix
   */
  getLastUpdateTime(): Promise<bigint>;
  
  /**
   * Verifica si el precio es reciente (no stale)
   * @returns true si el precio es válido
   */
  isPriceFresh(): Promise<boolean>;
  
  /**
   * Actualiza el precio (solo ORACLE_ROLE)
   * @param price Nuevo precio (18 decimals)
   */
  updatePrice(price: bigint): Promise<TransactionResult>;
  
  /**
   * Obtiene el rol de Oracle
   */
  ORACLE_ROLE(): Promise<string>;
  
  /**
   * Obtiene la edad máxima del precio
   */
  maxPriceAge(): Promise<bigint>;
}

/**
 * Información consolidada del fondo de buyback (para UI)
 */
export interface BuyBackInfo {
  balance: bigint;              // RON balance del fondo
  totalBuybacks: bigint;        // Número total de buybacks ejecutados
  totalBuybackAmount: bigint;   // Total RON gastado en buybacks
  priceThreshold: bigint;       // Precio umbral para ejecutar buyback
  minBuybackAmount: bigint;     // Mínimo RON para ejecutar
  autoBurnEnabled: boolean;     // Si se queman los tokens o van a treasury
  shouldExecute: boolean;       // Si debe ejecutarse buyback ahora
}

/**
 * Interfaz para el contrato BuyBackFund
 */
export interface IBuyBackFund extends IBlockchainContract {
  /**
   * Ejecuta un buyback de Core tokens (solo EXECUTOR_ROLE)
   * @param maxRonToSpend - Máximo RON a gastar
   */
  executeBuyback(maxRonToSpend: bigint): Promise<TransactionResult>;
  
  /**
   * Deposita fondos RON al buyback fund
   */
  deposit(amount: bigint): Promise<TransactionResult>;
  
  /**
   * Obtiene el balance RON del fondo
   */
  getBalance(): Promise<bigint>;
  
  /**
   * Obtiene el total de buybacks ejecutados
   */
  totalBuybacks(): Promise<bigint>;
  
  /**
   * Obtiene el total de RON gastado en buybacks
   */
  totalBuybackAmount(): Promise<bigint>;
  
  /**
   * Obtiene el precio umbral configurado
   */
  priceThreshold(): Promise<bigint>;
  
  /**
   * Obtiene el mínimo RON para ejecutar buyback
   */
  minBuybackAmount(): Promise<bigint>;
  
  /**
   * Verifica si auto-burn está habilitado
   */
  autoBurnEnabled(): Promise<boolean>;
  
  /**
   * Verifica si debe ejecutarse un buyback
   */
  shouldExecuteBuyback(): Promise<boolean>;
  
  /**
   * Actualiza el precio umbral (solo admin)
   */
  setPriceThreshold(threshold: bigint): Promise<TransactionResult>;
  
  /**
   * Actualiza el mínimo para buyback (solo admin)
   */
  setMinBuybackAmount(amount: bigint): Promise<TransactionResult>;
  
  /**
   * Habilita/deshabilita auto-burn (solo admin)
   */
  setAutoBurn(enabled: boolean): Promise<TransactionResult>;
}

// NOTA: RoyaltyInfo e IRoyaltyManager fueron movidos a IRoyaltyContract.ts
// Ver: src/lib/contracts/interfaces/IRoyaltyContract.ts

/**
 * Información consolidada de emisión (para UI)
 */
export interface EmissionInfo {
  currentRate: bigint;           // Tasa actual de emisión por segundo
  yearlyEmission: bigint;        // Emisión anual actual
  totalEmitted: bigint;          // Total emitido hasta ahora
  remainingRewards: bigint;      // Total restante por emitir
  currentHalving: bigint;        // Número de halving actual (0, 1, 2...)
  nextHalvingTime: bigint;       // Timestamp del próximo halving
  timeUntilHalving: bigint;      // Segundos hasta próximo halving
  emissionStarted: boolean;      // Si la emisión ya inició
  emissionStartTime: bigint;     // Timestamp de inicio de emisión
  halvingPeriod: bigint;         // Duración de cada período (365 días)
  totalMiningRewards: bigint;    // Total rewards disponibles (1,050M)
  initialYearlyEmission: bigint; // Emisión inicial año 1 (525M)
}

/**
 * Interfaz para el contrato EmissionSchedule
 */
export interface IEmissionSchedule extends IBlockchainContract {
  /**
   * Obtiene la tasa de emisión actual (CORE por segundo)
   */
  getCurrentEmissionRate(): Promise<bigint>;
  
  /**
   * Obtiene el total de CORE emitido hasta ahora
   */
  getTotalEmitted(): Promise<bigint>;
  
  /**
   * Calcula rewards para un período de tiempo
   * @param duration - Duración en segundos
   */
  getRewardsForPeriod(duration: bigint): Promise<bigint>;
  
  /**
   * Obtiene tiempo hasta próximo halving (en segundos)
   */
  getTimeUntilNextHalving(): Promise<bigint>;
  
  /**
   * Obtiene el número de halving actual (0, 1, 2...)
   */
  getCurrentHalving(): Promise<bigint>;
  
  /**
   * Obtiene el timestamp de inicio de emisión
   */
  getEmissionStart(): Promise<bigint>;
  
  /**
   * Verifica si la emisión ya inició
   */
  isEmissionStarted(): Promise<boolean>;
  
  /**
   * Obtiene rewards restantes por emitir
   */
  getRemainingRewards(): Promise<bigint>;
  
  /**
   * Obtiene emisión anual actual
   */
  getCurrentYearlyEmission(): Promise<bigint>;
  
  /**
   * Constantes del contrato
   */
  HALVING_PERIOD(): Promise<bigint>;
  TOTAL_MINING_REWARDS(): Promise<bigint>;
  INITIAL_YEARLY_EMISSION(): Promise<bigint>;
}

/**
 * Configuración de integración con Axie Staking
 */
export interface AxieStakingConfig {
  minStakeDuration: bigint;
  rewardMultiplier: bigint; // basis points
  enabled: boolean;
}

/**
 * Información de staking de Axie
 */
export interface AxieStakeInfo {
  axieId: bigint;
  owner: Address;
  stakedAt: bigint;
  unstakedAt: bigint;
  rewardsClaimed: bigint;
  isStaked: boolean;
}

/**
 * Interfaz para el contrato AxieStakingManager
 */
export interface IAxieStakingManager extends IBlockchainContract {
  /**
   * Stakea un Axie NFT
   */
  stakeAxie(axieId: bigint): Promise<TransactionResult>;
  
  /**
   * Unstakea un Axie NFT
   */
  unstakeAxie(axieId: bigint): Promise<TransactionResult>;
  
  /**
   * Reclama recompensas de staking
   */
  claimRewards(axieId: bigint): Promise<TransactionResult & { rewards: bigint }>;
  
  /**
   * Obtiene información de staking de un Axie
   */
  getStakeInfo(axieId: bigint): Promise<AxieStakeInfo>;
  
  /**
   * Calcula recompensas pendientes
   */
  calculatePendingRewards(axieId: bigint): Promise<bigint>;
  
  /**
   * Obtiene todos los Axies stakeados de un usuario
   */
  getStakedAxies(user: Address): Promise<bigint[]>;
  
  /**
   * Obtiene la configuración de staking
   */
  getStakingConfig(): Promise<AxieStakingConfig>;
}
