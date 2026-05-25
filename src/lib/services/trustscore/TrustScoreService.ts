/**
 * TrustScoreService - Servicio de negocio para el sistema TrustScore
 * 
 * @pattern Service Layer Pattern - Abstrae lógica de negocio del contrato
 * @pattern Facade Pattern - Simplifica interacción con TrustScoreManager
 * @principle SRP - Responsabilidad única: gestión de TrustScore
 */

import type { Address } from 'viem';
import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { 
  TrustScoreUIInfo, 
  TrustScoreLevel,
  TrustScoreData 
} from '@/lib/contracts/interfaces/ITrustScoreContract';
import { 
  TRUST_SCORE_THRESHOLDS,
  getTrustScoreLevelName,
  getTrustScoreLevelColor 
} from '@/lib/contracts/interfaces/ITrustScoreContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('TrustScoreService');

/**
 * Servicio para gestionar operaciones de TrustScore
 */
export class TrustScoreService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Obtiene el score actual de un usuario
   * 
   * @param userAddress - Dirección del usuario
   * @returns Score actual (0-1000)
   */
  async getUserScore(userAddress: Address): Promise<number> {
    try {
      log.info('Getting user score', { userAddress });

      const trustScoreManager = this.contractManager.getTrustScoreManager();
      const score = await trustScoreManager.getScore(userAddress);

      log.info('User score retrieved', {
        userAddress,
        score: score.toString(),
      });

      return Number(score);
    } catch (error) {
      log.error('Error getting user score', { userAddress, error });
      return 0; // Score por defecto
    }
  }

  /**
   * Verifica si un usuario tiene el score mínimo requerido
   * 
   * @param userAddress - Dirección del usuario
   * @param minScore - Score mínimo requerido
   * @returns true si cumple el requisito
   */
  async hasMinimumScore(userAddress: Address, minScore: number): Promise<boolean> {
    try {
      const trustScoreManager = this.contractManager.getTrustScoreManager();
      return await trustScoreManager.hasMinimumScore(userAddress, BigInt(minScore));
    } catch (error) {
      log.error('Error checking minimum score', { userAddress, minScore, error });
      return false;
    }
  }

  /**
   * Obtiene el nivel de acceso de un usuario
   * 
   * @param userAddress - Dirección del usuario
   * @returns Nivel de acceso (0-3)
   */
  async getAccessLevel(userAddress: Address): Promise<TrustScoreLevel> {
    try {
      const trustScoreManager = this.contractManager.getTrustScoreManager();
      const level = await trustScoreManager.getAccessLevel(userAddress);
      return level as TrustScoreLevel;
    } catch (error) {
      log.error('Error getting access level', { userAddress, error });
      return 0; // Basic level por defecto
    }
  }

  /**
   * Obtiene información completa del TrustScore de un usuario
   * 
   * @param userAddress - Dirección del usuario
   * @returns Información completa de TrustScore para UI
   */
  async getUserTrustScoreInfo(userAddress: Address): Promise<TrustScoreUIInfo> {
    try {
      log.info('Getting user trust score info', { userAddress });

      const trustScoreManager = this.contractManager.getTrustScoreManager();

      // Obtener datos del contrato en paralelo
      const [scoreData, currentScore, accessLevel, isStale, decayRate, maxAge] = await Promise.all([
        trustScoreManager.getTrustScore(userAddress),
        trustScoreManager.getScore(userAddress),
        trustScoreManager.getAccessLevel(userAddress),
        trustScoreManager.isScoreStale(userAddress),
        trustScoreManager.scoreDecayRate(),
        trustScoreManager.maxScoreAge(),
      ]);

      const score = Number(currentScore);
      const rawScore = Number(scoreData.score);
      const level = accessLevel as TrustScoreLevel;
      const levelName = getTrustScoreLevelName(level);

      // Calcular días hasta el siguiente decay
      const now = Math.floor(Date.now() / 1000);
      const lastUpdate = Number(scoreData.lastUpdate);
      const secondsSinceUpdate = now - lastUpdate;
      const daysSinceUpdate = Math.floor(secondsSinceUpdate / 86400);
      const secondsUntilNextDay = 86400 - (secondsSinceUpdate % 86400);
      const daysUntilDecay = secondsUntilNextDay > 0 ? 1 : 0;

      // Calcular progreso hacia el siguiente nivel
      const nextLevelScore = this.getNextLevelThreshold(level);
      const percentToNextLevel = nextLevelScore !== null
        ? ((score - this.getCurrentLevelThreshold(level)) / (nextLevelScore - this.getCurrentLevelThreshold(level))) * 100
        : 100;

      const info: TrustScoreUIInfo = {
        user: userAddress,
        score,
        rawScore,
        level,
        levelName,
        lastUpdate,
        accountAge: Number(scoreData.accountAge),
        totalActivity: Number(scoreData.totalActivity),
        flagged: scoreData.flagged,
        isStale,
        daysUntilDecay,
        nextLevelScore,
        percentToNextLevel: Math.min(100, Math.max(0, percentToNextLevel)),
      };

      log.info('Trust score info retrieved', {
        userAddress,
        score,
        level,
        levelName,
      });

      return info;
    } catch (error) {
      log.error('Error getting trust score info', { userAddress, error });
      
      // Retornar info por defecto en caso de error
      return {
        user: userAddress,
        score: 0,
        rawScore: 0,
        level: 0,
        levelName: 'Basic',
        lastUpdate: 0,
        accountAge: 0,
        totalActivity: 0,
        flagged: false,
        isStale: true,
        daysUntilDecay: 0,
        nextLevelScore: TRUST_SCORE_THRESHOLDS.LEVEL_1,
        percentToNextLevel: 0,
      };
    }
  }

  /**
   * Obtiene el umbral del nivel actual
   * 
   * @param level - Nivel de TrustScore
   * @returns Umbral mínimo del nivel
   */
  private getCurrentLevelThreshold(level: TrustScoreLevel): number {
    switch (level) {
      case 0: return TRUST_SCORE_THRESHOLDS.LEVEL_0;
      case 1: return TRUST_SCORE_THRESHOLDS.LEVEL_1;
      case 2: return TRUST_SCORE_THRESHOLDS.LEVEL_2;
      case 3: return TRUST_SCORE_THRESHOLDS.LEVEL_3;
      default: return TRUST_SCORE_THRESHOLDS.LEVEL_0;
    }
  }

  /**
   * Obtiene el score necesario para el siguiente nivel
   * 
   * @param level - Nivel actual
   * @returns Score necesario para siguiente nivel, o null si ya está en máximo
   */
  private getNextLevelThreshold(level: TrustScoreLevel): number | null {
    switch (level) {
      case 0: return TRUST_SCORE_THRESHOLDS.LEVEL_1;
      case 1: return TRUST_SCORE_THRESHOLDS.LEVEL_2;
      case 2: return TRUST_SCORE_THRESHOLDS.LEVEL_3;
      case 3: return null; // Ya está en nivel máximo
      default: return TRUST_SCORE_THRESHOLDS.LEVEL_1;
    }
  }

  /**
   * Verifica si un usuario puede acceder a una categoría de receta
   * 
   * @param userAddress - Dirección del usuario
   * @param categoryLevel - Nivel de la categoría (0-3)
   * @returns true si el usuario tiene acceso
   */
  async canAccessCategory(userAddress: Address, categoryLevel: number): Promise<boolean> {
    try {
      const level = await this.getAccessLevel(userAddress);
      return level >= categoryLevel;
    } catch (error) {
      log.error('Error checking category access', { userAddress, categoryLevel, error });
      return false;
    }
  }

  /**
   * Obtiene el score mínimo requerido para un nivel
   * 
   * @param level - Nivel de acceso (0-3)
   * @returns Score mínimo requerido
   */
  getMinimumScoreForLevel(level: number): number {
    return this.getCurrentLevelThreshold(level as TrustScoreLevel);
  }

  /**
   * Formatea el score para mostrar en UI
   * 
   * @param score - Score (0-1000)
   * @returns String formateado (ej: "650/1000")
   */
  formatScore(score: number): string {
    return `${score}/${TRUST_SCORE_THRESHOLDS.MAX_SCORE}`;
  }

  /**
   * Obtiene el color para un nivel de TrustScore
   * 
   * @param level - Nivel de TrustScore
   * @returns Color CSS
   */
  getLevelColor(level: TrustScoreLevel): string {
    return getTrustScoreLevelColor(level);
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createTrustScoreService(contractManager: ContractManager): TrustScoreService {
  return new TrustScoreService(contractManager);
}
