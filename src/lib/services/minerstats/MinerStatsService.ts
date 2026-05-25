/**
 * MinerStatsService
 * 
 * Service Layer para gestionar estadísticas dinámicas de miners
 * Encapsula lógica de negocio y cálculos para UI
 * 
 * @pattern Service Layer (DDD)
 * @pattern Facade - Simplifica acceso a MinerStatsManager
 */

import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { DynamicStats } from '@/lib/contracts/interfaces/IMinerStatsManager';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('MinerStatsService');

/**
 * Estadísticas con información calculada para UI
 */
export interface MinerStatsUI extends DynamicStats {
  // Percentages (0-100)
  durabilityPercent: number;
  efficiencyPercent: number;
  
  // Status indicators
  needsRepair: boolean;
  needsFeeding: boolean;
  isHungry: boolean;
  isStarving: boolean;
  
  // Calculated values
  experienceToNextLevel: number;
  experienceProgress: number; // % to next level
  effectiveMultiplier: number; // Combined durability * efficiency
  
  // Time indicators
  timeUntilHungry: number; // seconds
  timeUntilStarving: number; // seconds
  timeSinceLastMined: number; // seconds
  timeSinceLastRepaired: number; // seconds
  timeSinceLastFed: number; // seconds
  
  // Formatted strings
  levelFormatted: string;
  experienceFormatted: string;
  durabilityStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  efficiencyStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  hungerStatus: 'fed' | 'hungry' | 'starving';
}

/**
 * Histórico simplificado de stats (para gráficos)
 */
export interface StatsHistoryEntry {
  timestamp: number;
  durability: number;
  efficiency: number;
  level: number;
  experience: number;
}

/**
 * Comparación entre múltiples miners
 */
export interface MinerComparison {
  minerId: bigint;
  durability: number;
  efficiency: number;
  level: number;
  experience: number;
  effectiveMultiplier: number;
  rank: number; // 1 = best
}

/**
 * Servicio para gestionar estadísticas de miners
 */
export class MinerStatsService {
  private contractManager: ContractManager;
  private static readonly XP_PER_LEVEL = 1000;
  private static readonly REPAIR_THRESHOLD = 30;
  private static readonly CRITICAL_DURABILITY = 20;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Obtiene estadísticas completas de un miner con cálculos para UI
   */
  async getMinerStats(minerId: bigint): Promise<MinerStatsUI> {
    try {
      log.info('Getting miner stats', { minerId: minerId.toString() });

      const statsManager = this.contractManager.getMinerStatsManager();

      // Obtener stats y estados en paralelo
      const [
        stats,
        isHungry,
        isStarving,
        timeUntilHungry,
        timeUntilStarving,
        needsRepair,
      ] = await Promise.all([
        statsManager.getStats(minerId),
        statsManager.isHungry(minerId),
        statsManager.isStarving(minerId),
        statsManager.getTimeUntilHungry(minerId),
        statsManager.getTimeUntilStarving(minerId),
        statsManager.needsRepair(minerId, MinerStatsService.REPAIR_THRESHOLD),
      ]);

      const now = Math.floor(Date.now() / 1000);

      // Calcular experiencia al siguiente nivel
      const currentLevelXP = (stats.level - 1) * MinerStatsService.XP_PER_LEVEL;
      const nextLevelXP = stats.level * MinerStatsService.XP_PER_LEVEL;
      const experienceToNextLevel = nextLevelXP - stats.experience;
      const experienceProgress = ((stats.experience - currentLevelXP) / MinerStatsService.XP_PER_LEVEL) * 100;

      // Calcular multiplicador efectivo
      const effectiveMultiplier = (stats.durability * stats.efficiency) / 100;

      // Tiempos transcurridos
      const timeSinceLastMined = now - stats.lastMined;
      const timeSinceLastRepaired = now - stats.lastRepaired;
      const timeSinceLastFed = now - stats.lastFed;

      const uiStats: MinerStatsUI = {
        ...stats,
        durabilityPercent: stats.durability,
        efficiencyPercent: stats.efficiency,
        needsRepair,
        needsFeeding: timeUntilHungry === 0,
        isHungry,
        isStarving,
        experienceToNextLevel,
        experienceProgress: Math.min(100, Math.max(0, experienceProgress)),
        effectiveMultiplier,
        timeUntilHungry,
        timeUntilStarving,
        timeSinceLastMined,
        timeSinceLastRepaired,
        timeSinceLastFed,
        levelFormatted: `Nivel ${stats.level}`,
        experienceFormatted: `${stats.experience.toLocaleString()} XP`,
        durabilityStatus: this.getDurabilityStatus(stats.durability),
        efficiencyStatus: this.getEfficiencyStatus(stats.efficiency),
        hungerStatus: this.getHungerStatus(isHungry, isStarving),
      };

      log.info('Miner stats retrieved', {
        minerId: minerId.toString(),
        durability: stats.durability,
        efficiency: stats.efficiency,
        level: stats.level,
      });

      return uiStats;
    } catch (error) {
      log.error('Error getting miner stats', { error, minerId: minerId.toString() });
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de múltiples miners para comparación
   */
  async compareMiners(minerIds: bigint[]): Promise<MinerComparison[]> {
    try {
      log.info('Comparing miners', { count: minerIds.length });

      const statsPromises = minerIds.map(async (minerId) => {
        const stats = await this.getMinerStats(minerId);
        return {
          minerId,
          durability: stats.durability,
          efficiency: stats.efficiency,
          level: stats.level,
          experience: stats.experience,
          effectiveMultiplier: stats.effectiveMultiplier,
          rank: 0, // Se calculará después
        };
      });

      const comparisons = await Promise.all(statsPromises);

      // Ordenar por effectiveMultiplier y asignar ranks
      comparisons.sort((a, b) => b.effectiveMultiplier - a.effectiveMultiplier);
      comparisons.forEach((comp, index) => {
        comp.rank = index + 1;
      });

      log.info('Miners compared', { count: comparisons.length });

      return comparisons;
    } catch (error) {
      log.error('Error comparing miners', { error });
      throw error;
    }
  }

  /**
   * Calcula promedio de stats para una colección de miners
   */
  async getCollectionAverage(minerIds: bigint[]): Promise<{
    avgDurability: number;
    avgEfficiency: number;
    avgLevel: number;
    avgMultiplier: number;
    totalExperience: number;
  }> {
    try {
      if (minerIds.length === 0) {
        return {
          avgDurability: 0,
          avgEfficiency: 0,
          avgLevel: 0,
          avgMultiplier: 0,
          totalExperience: 0,
        };
      }

      const comparisons = await this.compareMiners(minerIds);

      const totals = comparisons.reduce(
        (acc, comp) => ({
          durability: acc.durability + comp.durability,
          efficiency: acc.efficiency + comp.efficiency,
          level: acc.level + comp.level,
          multiplier: acc.multiplier + comp.effectiveMultiplier,
          experience: acc.experience + comp.experience,
        }),
        { durability: 0, efficiency: 0, level: 0, multiplier: 0, experience: 0 }
      );

      const count = minerIds.length;

      return {
        avgDurability: Math.round(totals.durability / count),
        avgEfficiency: Math.round(totals.efficiency / count),
        avgLevel: Math.round(totals.level / count),
        avgMultiplier: Math.round(totals.multiplier / count),
        totalExperience: totals.experience,
      };
    } catch (error) {
      log.error('Error calculating collection average', { error });
      throw error;
    }
  }

  /**
   * Verifica la salud general del miner
   */
  getMinerHealth(stats: MinerStatsUI): {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number; // 0-100
    warnings: string[];
  } {
    const warnings: string[] = [];
    let score = 100;

    // Durability penalty
    if (stats.durability < 20) {
      warnings.push('Durabilidad crítica - Reparación urgente');
      score -= 30;
    } else if (stats.durability < 50) {
      warnings.push('Durabilidad baja - Considerar reparación');
      score -= 15;
    }

    // Efficiency penalty
    if (stats.efficiency < 20) {
      warnings.push('Eficiencia crítica - Verificar hambre');
      score -= 30;
    } else if (stats.efficiency < 50) {
      warnings.push('Eficiencia reducida');
      score -= 15;
    }

    // Hunger penalty
    if (stats.isStarving) {
      warnings.push('Hambre crítica - Alimentar urgente');
      score -= 25;
    } else if (stats.isHungry) {
      warnings.push('Necesita alimentación');
      score -= 10;
    }

    score = Math.max(0, score);

    let overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (score >= 90) overall = 'excellent';
    else if (score >= 70) overall = 'good';
    else if (score >= 50) overall = 'fair';
    else if (score >= 30) overall = 'poor';
    else overall = 'critical';

    return { overall, score, warnings };
  }

  /**
   * Helpers privados
   */
  private getDurabilityStatus(durability: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (durability >= 80) return 'excellent';
    if (durability >= 60) return 'good';
    if (durability >= 40) return 'fair';
    if (durability >= 20) return 'poor';
    return 'critical';
  }

  private getEfficiencyStatus(efficiency: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (efficiency >= 80) return 'excellent';
    if (efficiency >= 60) return 'good';
    if (efficiency >= 40) return 'fair';
    if (efficiency >= 20) return 'poor';
    return 'critical';
  }

  private getHungerStatus(isHungry: boolean, isStarving: boolean): 'fed' | 'hungry' | 'starving' {
    if (isStarving) return 'starving';
    if (isHungry) return 'hungry';
    return 'fed';
  }

  /**
   * Formatea tiempo en segundos a string legible
   */
  static formatTime(seconds: number): string {
    if (seconds <= 0) return 'Ahora';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
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
export function createMinerStatsService(contractManager: ContractManager): MinerStatsService {
  return new MinerStatsService(contractManager);
}
