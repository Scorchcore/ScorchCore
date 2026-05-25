/**
 * EmissionScheduleService
 * 
 * Service Layer para gestionar la información de emisión de tokens
 * Encapsula la lógica de negocio y cálculos para la UI
 * 
 * @pattern Service Layer (DDD)
 * @pattern Facade - Simplifica acceso a EmissionSchedule contract
 */

import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { EmissionInfo } from '@/lib/contracts/interfaces/IEconomyContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('EmissionScheduleService');

/**
 * Información de emisión con datos formateados para UI
 */
export interface EmissionScheduleUI {
  currentRate: string;           // Tasa actual formateada (CORE/segundo)
  currentRatePerDay: string;     // Tasa por día formateada
  yearlyEmission: string;        // Emisión anual formateada
  totalEmitted: string;          // Total emitido formateado
  totalEmittedPercentage: number; // Porcentaje emitido del total
  remainingRewards: string;      // Rewards restantes formateados
  remainingPercentage: number;   // Porcentaje restante
  currentHalving: number;        // Número de halving actual
  nextHalvingDate: Date | null;  // Fecha del próximo halving
  timeUntilHalving: string;      // Tiempo hasta halving formateado
  daysUntilHalving: number;      // Días hasta halving
  emissionStarted: boolean;      // Si ya inició emisión
  emissionStartDate: Date | null; // Fecha de inicio
  halvingPeriodDays: number;     // Período de halving en días
  totalMiningRewards: string;    // Total de rewards formateado
  initialYearlyEmission: string; // Emisión inicial formateada
  // Raw values
  raw: {
    currentRate: bigint;
    yearlyEmission: bigint;
    totalEmitted: bigint;
    remainingRewards: bigint;
    currentHalving: bigint;
    nextHalvingTime: bigint;
    timeUntilHalving: bigint;
    halvingPeriod: bigint;
    totalMiningRewards: bigint;
    initialYearlyEmission: bigint;
  };
}

/**
 * Histórico de halvings calculado
 */
export interface HalvingHistory {
  halvingNumber: number;
  yearlyEmission: string;
  emissionRate: string;
  estimatedDate: Date | null;
  isPast: boolean;
  isCurrent: boolean;
}

/**
 * Servicio para gestionar información de emisión
 */
export class EmissionScheduleService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Obtiene información consolidada de emisión para UI
   */
  async getEmissionInfo(): Promise<EmissionScheduleUI> {
    try {
      log.info('Getting emission info...');

      const contract = this.contractManager.getEmissionSchedule();

      // Obtener todos los datos en paralelo
      const [
        currentRate,
        totalEmitted,
        remainingRewards,
        currentHalving,
        timeUntilHalving,
        emissionStarted,
        emissionStart,
        yearlyEmission,
        halvingPeriod,
        totalMiningRewards,
        initialYearlyEmission,
      ] = await Promise.all([
        contract.getCurrentEmissionRate(),
        contract.getTotalEmitted(),
        contract.getRemainingRewards(),
        contract.getCurrentHalving(),
        contract.getTimeUntilNextHalving(),
        contract.isEmissionStarted(),
        contract.getEmissionStart(),
        contract.getCurrentYearlyEmission(),
        contract.HALVING_PERIOD(),
        contract.TOTAL_MINING_REWARDS(),
        contract.INITIAL_YEARLY_EMISSION(),
      ]);

      // Calcular fecha de próximo halving
      const nextHalvingTime = emissionStart + (halvingPeriod * (currentHalving + 1n));
      const nextHalvingDate = emissionStarted && timeUntilHalving > 0n
        ? new Date(Number(nextHalvingTime) * 1000)
        : null;

      // Calcular porcentajes
      const totalEmittedPercentage = totalMiningRewards > 0n
        ? (Number(totalEmitted) / Number(totalMiningRewards)) * 100
        : 0;

      const remainingPercentage = 100 - totalEmittedPercentage;

      // Días hasta halving
      const daysUntilHalving = Number(timeUntilHalving) / 86400;

      // Período en días
      const halvingPeriodDays = Number(halvingPeriod) / 86400;

      // Emisión por día
      const ratePerDay = currentRate * 86400n;

      const uiInfo: EmissionScheduleUI = {
        currentRate: this.formatCOREAmount(currentRate),
        currentRatePerDay: this.formatCOREAmount(ratePerDay),
        yearlyEmission: this.formatCOREAmount(yearlyEmission),
        totalEmitted: this.formatCOREAmount(totalEmitted),
        totalEmittedPercentage,
        remainingRewards: this.formatCOREAmount(remainingRewards),
        remainingPercentage,
        currentHalving: Number(currentHalving),
        nextHalvingDate,
        timeUntilHalving: this.formatDuration(Number(timeUntilHalving)),
        daysUntilHalving,
        emissionStarted,
        emissionStartDate: emissionStarted && emissionStart > 0n
          ? new Date(Number(emissionStart) * 1000)
          : null,
        halvingPeriodDays,
        totalMiningRewards: this.formatCOREAmount(totalMiningRewards),
        initialYearlyEmission: this.formatCOREAmount(initialYearlyEmission),
        raw: {
          currentRate,
          yearlyEmission,
          totalEmitted,
          remainingRewards,
          currentHalving,
          nextHalvingTime,
          timeUntilHalving,
          halvingPeriod,
          totalMiningRewards,
          initialYearlyEmission,
        },
      };

      log.info('Emission info retrieved successfully', {
        currentHalving: uiInfo.currentHalving,
        yearlyEmission: uiInfo.yearlyEmission,
        totalEmittedPercentage: uiInfo.totalEmittedPercentage.toFixed(2),
      });

      return uiInfo;
    } catch (error) {
      log.error('Error getting emission info', { error });
      throw error;
    }
  }

  /**
   * Calcula el histórico de halvings (pasados, actual y futuros)
   */
  async getHalvingHistory(maxHalvings: number = 10): Promise<HalvingHistory[]> {
    try {
      log.debug('Calculating halving history', { maxHalvings });

      const contract = this.contractManager.getEmissionSchedule();
      
      const [
        currentHalving,
        emissionStart,
        initialYearlyEmission,
        halvingPeriod,
        emissionStarted,
      ] = await Promise.all([
        contract.getCurrentHalving(),
        contract.getEmissionStart(),
        contract.INITIAL_YEARLY_EMISSION(),
        contract.HALVING_PERIOD(),
        contract.isEmissionStarted(),
      ]);

      const history: HalvingHistory[] = [];
      const now = BigInt(Math.floor(Date.now() / 1000));

      for (let i = 0; i < maxHalvings; i++) {
        const halvingNumber = i;
        const yearlyEmission = initialYearlyEmission / (2n ** BigInt(i));
        const emissionRate = yearlyEmission / 31536000n; // seconds in year

        // Calcular fecha estimada del halving
        const halvingTime = emissionStart + (halvingPeriod * BigInt(i));
        const estimatedDate = emissionStarted && emissionStart > 0n
          ? new Date(Number(halvingTime) * 1000)
          : null;

        const isPast = emissionStarted && now > halvingTime;
        const isCurrent = Number(currentHalving) === halvingNumber;

        history.push({
          halvingNumber,
          yearlyEmission: this.formatCOREAmount(yearlyEmission),
          emissionRate: this.formatCOREAmount(emissionRate),
          estimatedDate,
          isPast,
          isCurrent,
        });

        // Detener si la emisión anual es muy pequeña (<1 CORE/año)
        if (yearlyEmission < 1n * 10n ** 18n) {
          break;
        }
      }

      log.info('Halving history calculated', {
        totalHalvings: history.length,
        currentHalving: Number(currentHalving),
      });

      return history;
    } catch (error) {
      log.error('Error calculating halving history', { error });
      throw error;
    }
  }

  /**
   * Calcula cuánto tiempo falta para el próximo halving
   */
  async getTimeUntilNextHalving(): Promise<{
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    formatted: string;
  }> {
    try {
      const contract = this.contractManager.getEmissionSchedule();
      const timeUntilHalving = await contract.getTimeUntilNextHalving();

      const seconds = Number(timeUntilHalving);
      const minutes = seconds / 60;
      const hours = minutes / 60;
      const days = hours / 24;

      return {
        seconds,
        minutes,
        hours,
        days,
        formatted: this.formatDuration(seconds),
      };
    } catch (error) {
      log.error('Error getting time until next halving', { error });
      throw error;
    }
  }

  /**
   * Formatea una cantidad de CORE tokens
   * @private
   */
  private formatCOREAmount(amount: bigint): string {
    const decimals = 18;
    const value = Number(amount) / 10 ** decimals;
    
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`;
    } else if (value >= 1) {
      return value.toFixed(2);
    } else if (value >= 0.01) {
      return value.toFixed(4);
    } else {
      return value.toFixed(6);
    }
  }

  /**
   * Formatea una duración en segundos a formato legible
   * @private
   */
  private formatDuration(seconds: number): string {
    if (seconds <= 0) return 'Ahora';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createEmissionScheduleService(contractManager: ContractManager): EmissionScheduleService {
  return new EmissionScheduleService(contractManager);
}
