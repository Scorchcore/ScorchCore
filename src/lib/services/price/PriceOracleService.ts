/**
 * PriceOracleService
 * 
 * Service Layer para gestionar precio de CORE token
 * Encapsula lógica de negocio y cálculos de precio
 * 
 * @pattern Service Layer (DDD)
 */

import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { PriceInfoUI } from '@/lib/contracts/interfaces/IEconomyContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { formatUnits } from 'ethers';

const log = createServiceLogger('PriceOracleService');

/**
 * Historial de precio para trending
 */
export interface PriceHistory {
  timestamp: number;
  price: number;
  priceChange: number;      // Cambio % respecto al anterior
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Estadísticas de precio
 */
export interface PriceStats {
  current: number;
  high24h?: number;
  low24h?: number;
  change24h?: number;
  changePercent24h?: number;
  lastUpdate: number;
  isFresh: boolean;
}

/**
 * Conversión de tokens
 */
export interface ConversionResult {
  fromAmount: bigint;
  toAmount: bigint;
  fromToken: string;
  toToken: string;
  rate: number;
  priceImpact: number;
}

/**
 * Servicio para gestionar precios del oracle
 */
export class PriceOracleService {
  private contractManager: ContractManager;
  private priceHistory: PriceHistory[] = [];

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Obtiene el precio actual de CORE en USD
   */
  async getCurrentPrice(): Promise<number> {
    try {
      log.info('Getting current CORE price');

      const oracle = this.contractManager.getPriceOracle();
      const priceBigInt = await oracle.getCurrentPrice();
      
      // Convertir de 18 decimales a número
      const price = parseFloat(formatUnits(priceBigInt, 18));

      log.info('Current price retrieved', { price });

      return price;
    } catch (error) {
      log.error('Error getting current price', { error });
      throw error;
    }
  }

  /**
   * Obtiene información completa del precio
   */
  async getPriceInfo(): Promise<PriceInfoUI> {
    try {
      log.info('Getting price info');

      const oracle = this.contractManager.getPriceOracle();
      
      const [priceBigInt, lastUpdateBigInt, isFresh] = await Promise.all([
        oracle.getCurrentPrice(),
        oracle.getLastUpdateTime(),
        oracle.isPriceFresh(),
      ]);

      const price = priceBigInt;
      const priceUSD = parseFloat(formatUnits(priceBigInt, 18));
      const lastUpdate = Number(lastUpdateBigInt);
      const now = Math.floor(Date.now() / 1000);
      const age = now - lastUpdate;

      const priceInfo: PriceInfoUI = {
        price,
        priceUSD,
        lastUpdate,
        isFresh,
        age,
      };

      log.info('Price info retrieved', { 
        priceUSD,
        age,
        isFresh 
      });

      return priceInfo;
    } catch (error) {
      log.error('Error getting price info', { error });
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de precio
   */
  async getPriceStats(): Promise<PriceStats> {
    try {
      const priceInfo = await this.getPriceInfo();

      // En un sistema real, aquí obtendríamos high/low/change del histórico
      // Por ahora retornamos solo el precio actual
      const stats: PriceStats = {
        current: priceInfo.priceUSD,
        lastUpdate: priceInfo.lastUpdate,
        isFresh: priceInfo.isFresh,
      };

      return stats;
    } catch (error) {
      log.error('Error getting price stats', { error });
      throw error;
    }
  }

  /**
   * Convierte CORE a RON (o viceversa)
   * Nota: Implementación básica, en producción usaría DEX prices
   */
  async convertTokens(
    fromAmount: bigint,
    fromToken: 'CORE' | 'RON',
    toToken: 'CORE' | 'RON'
  ): Promise<ConversionResult> {
    try {
      log.info('Converting tokens', { 
        fromAmount: fromAmount.toString(),
        fromToken,
        toToken 
      });

      if (fromToken === toToken) {
        return {
          fromAmount,
          toAmount: fromAmount,
          fromToken,
          toToken,
          rate: 1,
          priceImpact: 0,
        };
      }

      // Obtener precio de CORE en USD
      const corePrice = await this.getCurrentPrice();
      
      // Asumir RON = 1 USD (simplificación)
      // En producción, obtener precio real de RON
      const ronPrice = 1;

      let toAmount: bigint;
      let rate: number;

      if (fromToken === 'CORE') {
        // CORE -> RON
        const fromAmountNumber = parseFloat(formatUnits(fromAmount, 18));
        const toAmountNumber = (fromAmountNumber * corePrice) / ronPrice;
        toAmount = BigInt(Math.floor(toAmountNumber * 1e18));
        rate = corePrice / ronPrice;
      } else {
        // RON -> CORE
        const fromAmountNumber = parseFloat(formatUnits(fromAmount, 18));
        const toAmountNumber = (fromAmountNumber * ronPrice) / corePrice;
        toAmount = BigInt(Math.floor(toAmountNumber * 1e18));
        rate = ronPrice / corePrice;
      }

      const result: ConversionResult = {
        fromAmount,
        toAmount,
        fromToken,
        toToken,
        rate,
        priceImpact: 0, // No slippage en oracle price
      };

      log.info('Token conversion completed', { 
        rate,
        toAmount: toAmount.toString() 
      });

      return result;
    } catch (error) {
      log.error('Error converting tokens', { error });
      throw error;
    }
  }

  /**
   * Registra un precio en el historial local
   * (para trending en UI)
   */
  addPriceToHistory(price: number): void {
    const now = Date.now();
    const lastPrice = this.priceHistory[this.priceHistory.length - 1];
    
    let priceChange = 0;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';

    if (lastPrice) {
      priceChange = ((price - lastPrice.price) / lastPrice.price) * 100;
      trend = priceChange > 0.1 ? 'up' : priceChange < -0.1 ? 'down' : 'neutral';
    }

    this.priceHistory.push({
      timestamp: now,
      price,
      priceChange,
      trend,
    });

    // Mantener solo últimas 100 entradas
    if (this.priceHistory.length > 100) {
      this.priceHistory.shift();
    }
  }

  /**
   * Obtiene el historial de precios
   */
  getPriceHistory(): PriceHistory[] {
    return [...this.priceHistory];
  }

  /**
   * Calcula el cambio de precio en un periodo
   */
  calculatePriceChange(periodMs: number): { change: number; percent: number } | null {
    if (this.priceHistory.length < 2) {
      return null;
    }

    const now = Date.now();
    const cutoff = now - periodMs;
    
    const oldPrice = this.priceHistory.find(h => h.timestamp >= cutoff);
    const currentPrice = this.priceHistory[this.priceHistory.length - 1];

    if (!oldPrice || !currentPrice) {
      return null;
    }

    const change = currentPrice.price - oldPrice.price;
    const percent = (change / oldPrice.price) * 100;

    return { change, percent };
  }

  /**
   * Formatea un precio en USD
   */
  formatPrice(price: number, decimals: number = 4): string {
    return `$${price.toFixed(decimals)}`;
  }

  /**
   * Formatea un cambio de precio con color
   */
  formatPriceChange(change: number): { text: string; color: string; icon: string } {
    const isPositive = change >= 0;
    return {
      text: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
      color: isPositive ? 'green' : 'red',
      icon: isPositive ? '📈' : '📉',
    };
  }

  /**
   * Verifica si el precio es stale (muy antiguo)
   */
  isPriceStale(lastUpdate: number, maxAgeSeconds: number = 3600): boolean {
    const now = Math.floor(Date.now() / 1000);
    return (now - lastUpdate) > maxAgeSeconds;
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createPriceOracleService(contractManager: ContractManager): PriceOracleService {
  return new PriceOracleService(contractManager);
}
