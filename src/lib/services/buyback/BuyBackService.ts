/**
 * BuyBackService - Servicio de negocio para el BuyBack Fund
 * 
 * @pattern Service Layer Pattern - Abstrae lógica de negocio del contrato
 * @pattern Facade Pattern - Simplifica interacción con BuyBackFund
 * @principle SRP - Responsabilidad única: gestión del BuyBack Fund
 */

import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { BuyBackInfo } from '@/lib/contracts/interfaces/IEconomyContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('BuyBackService');

/**
 * Información del BuyBack Fund para UI con cálculos adicionales
 */
export interface BuyBackDashboardInfo extends BuyBackInfo {
  balanceFormatted: string;           // Balance en RON formateado
  totalBuybackAmountFormatted: string; // Total gastado formateado
  priceThresholdFormatted: string;    // Threshold en USD formateado
  readyToExecute: boolean;            // Si está listo para ejecutar
  percentageToThreshold: number;      // % del precio actual vs threshold
  estimatedCoreBuyable: bigint;       // Estimado de CORE que se puede comprar
}

/**
 * Historial de buyback (simulado desde eventos)
 */
export interface BuyBackHistoryEntry {
  timestamp: number;
  ronSpent: bigint;
  coreReceived: bigint;
  price: bigint;
  txHash: string;
}

/**
 * Servicio para gestionar el BuyBack Fund
 */
export class BuyBackService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Obtiene información consolidada del BuyBack Fund
   * 
   * @returns Dashboard info completo
   */
  async getBuyBackInfo(): Promise<BuyBackDashboardInfo> {
    try {
      log.info('Getting BuyBack Fund info');

      const buyBackFund = this.contractManager.getBuyBackFund();

      // Obtener toda la información en paralelo
      const [
        balance,
        totalBuybacks,
        totalBuybackAmount,
        priceThreshold,
        minBuybackAmount,
        autoBurnEnabled,
        shouldExecute,
      ] = await Promise.all([
        buyBackFund.getBalance(),
        buyBackFund.totalBuybacks(),
        buyBackFund.totalBuybackAmount(),
        buyBackFund.priceThreshold(),
        buyBackFund.minBuybackAmount(),
        buyBackFund.autoBurnEnabled(),
        buyBackFund.shouldExecuteBuyback(),
      ]);

      // Calcular CORE estimado que se puede comprar
      const estimatedCoreBuyable = priceThreshold > 0n
        ? (balance * 1000000000000000000n) / priceThreshold
        : 0n;

      const info: BuyBackDashboardInfo = {
        balance,
        totalBuybacks,
        totalBuybackAmount,
        priceThreshold,
        minBuybackAmount,
        autoBurnEnabled,
        shouldExecute,
        balanceFormatted: this.formatRON(balance),
        totalBuybackAmountFormatted: this.formatRON(totalBuybackAmount),
        priceThresholdFormatted: this.formatUSD(priceThreshold),
        readyToExecute: shouldExecute && balance >= minBuybackAmount,
        percentageToThreshold: 100, // TODO: Necesita price oracle
        estimatedCoreBuyable,
      };

      log.info('BuyBack info retrieved', {
        balance: info.balanceFormatted,
        totalBuybacks: totalBuybacks.toString(),
        shouldExecute,
      });

      return info;
    } catch (error) {
      log.error('Error getting BuyBack info', { error });
      // Retornar valores por defecto en caso de error
      return {
        balance: 0n,
        totalBuybacks: 0n,
        totalBuybackAmount: 0n,
        priceThreshold: 0n,
        minBuybackAmount: 0n,
        autoBurnEnabled: false,
        shouldExecute: false,
        balanceFormatted: '0 RON',
        totalBuybackAmountFormatted: '0 RON',
        priceThresholdFormatted: '$0.00',
        readyToExecute: false,
        percentageToThreshold: 0,
        estimatedCoreBuyable: 0n,
      };
    }
  }

  /**
   * Ejecuta un buyback (solo admin/executor)
   * 
   * @param maxRonToSpend - Máximo RON a gastar
   * @returns Resultado de la transacción
   */
  async executeBuyback(maxRonToSpend: bigint) {
    try {
      log.info('Executing buyback', {
        maxRonToSpend: maxRonToSpend.toString(),
      });

      const buyBackFund = this.contractManager.getBuyBackFund();
      const result = await buyBackFund.executeBuyback(maxRonToSpend);

      log.info('Buyback executed successfully', {
        txHash: result.hash,
        ronSpent: maxRonToSpend.toString(),
      });

      return result;
    } catch (error) {
      log.error('Error executing buyback', { error });
      throw error;
    }
  }

  /**
   * Deposita fondos al BuyBack Fund
   * 
   * @param amount - Monto en RON (wei)
   * @returns Resultado de la transacción
   */
  async deposit(amount: bigint) {
    try {
      log.info('Depositing to BuyBack Fund', {
        amount: amount.toString(),
      });

      const buyBackFund = this.contractManager.getBuyBackFund();
      const result = await buyBackFund.deposit(amount);

      log.info('Deposit successful', {
        txHash: result.hash,
        amount: amount.toString(),
      });

      return result;
    } catch (error) {
      log.error('Error depositing', { error });
      throw error;
    }
  }

  /**
   * Verifica si el buyback debe ejecutarse
   * 
   * @returns true si debe ejecutarse
   */
  async shouldExecuteBuyback(): Promise<boolean> {
    try {
      const buyBackFund = this.contractManager.getBuyBackFund();
      return await buyBackFund.shouldExecuteBuyback();
    } catch (error) {
      log.error('Error checking should execute', { error });
      return false;
    }
  }

  /**
   * Obtiene estadísticas del BuyBack Fund
   * 
   * @returns Estadísticas consolidadas
   */
  async getStats(): Promise<{
    totalBuybacks: number;
    totalSpent: string;
    averagePerBuyback: string;
    currentBalance: string;
  }> {
    try {
      const info = await this.getBuyBackInfo();

      const totalBuybacksNum = Number(info.totalBuybacks);
      const averagePerBuyback = totalBuybacksNum > 0
        ? info.totalBuybackAmount / info.totalBuybacks
        : 0n;

      return {
        totalBuybacks: totalBuybacksNum,
        totalSpent: info.totalBuybackAmountFormatted,
        averagePerBuyback: this.formatRON(averagePerBuyback),
        currentBalance: info.balanceFormatted,
      };
    } catch (error) {
      log.error('Error getting stats', { error });
      return {
        totalBuybacks: 0,
        totalSpent: '0 RON',
        averagePerBuyback: '0 RON',
        currentBalance: '0 RON',
      };
    }
  }

  /**
   * Calcula cuánto CORE se puede comprar con el balance actual
   * 
   * @returns Estimado de CORE en wei
   */
  async estimateCoreBuyable(): Promise<bigint> {
    try {
      const info = await this.getBuyBackInfo();
      return info.estimatedCoreBuyable;
    } catch (error) {
      log.error('Error estimating CORE buyable', { error });
      return 0n;
    }
  }

  /**
   * Formatea un monto de RON
   * 
   * @param amount - Monto en wei
   * @returns String formateado
   */
  private formatRON(amount: bigint): string {
    const ron = Number(amount) / 1e18;
    return `${ron.toFixed(4)} RON`;
  }

  /**
   * Formatea un precio en USD
   * 
   * @param price - Precio con 18 decimales
   * @returns String formateado
   */
  private formatUSD(price: bigint): string {
    const usd = Number(price) / 1e18;
    return `$${usd.toFixed(4)}`;
  }

  /**
   * Formatea CORE tokens
   * 
   * @param amount - Monto en wei
   * @returns String formateado
   */
  formatCORE(amount: bigint): string {
    const core = Number(amount) / 1e18;
    return `${core.toFixed(2)} CORE`;
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createBuyBackService(contractManager: ContractManager): BuyBackService {
  return new BuyBackService(contractManager);
}
