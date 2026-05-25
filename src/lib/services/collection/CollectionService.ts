/**
 * CollectionService
 * 
 * Service Layer para gestionar colecciones y sets de miners
 * Calcula progreso y bonuses activos
 * 
 * @pattern Service Layer (DDD)
 */

import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { Address } from 'viem';
import { 
  type CollectionSet, 
  type SetProgress, 
  type UserBonusSummary,
  PREDEFINED_SETS,
} from '@/lib/contracts/interfaces/ICollectionContract';
import { MINER_TYPE_NAMES, CATEGORY_NAMES } from '@/lib/contracts/interfaces/IRecipeRegistry';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('CollectionService');

/**
 * Servicio para gestionar colecciones y bonuses de sets
 */
export class CollectionService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Obtiene todos los sets disponibles
   */
  async getAllSets(): Promise<CollectionSet[]> {
    try {
      log.info('Getting all sets');

      const setRegistry = this.contractManager.getSetRegistry();
      const totalSets = await setRegistry.totalSets();
      
      const sets: CollectionSet[] = [];

      for (let i = 0; i < Number(totalSets); i++) {
        try {
          const [info, requirements] = await Promise.all([
            setRegistry.getSetInfo(i),
            setRegistry.getSetRequirements(i),
          ]);

          const predefined = PREDEFINED_SETS[i as 0 | 1 | 2];

          sets.push({
            id: i,
            name: info.name,
            requiredCategories: requirements.categories,
            requiredTypes: requirements.types,
            requiredCounts: requirements.counts,
            bonusPercentage: info.bonusPercentage,
            isActive: info.isActive,
            emoji: predefined?.emoji,
            description: predefined?.description,
          });
        } catch (error) {
          log.error('Error loading set', { error, setId: i });
          continue;
        }
      }

      log.info('All sets retrieved', { count: sets.length });

      return sets;
    } catch (error) {
      log.error('Error getting all sets', { error });
      return [];
    }
  }

  /**
   * Obtiene el progreso de un usuario en un set específico
   */
  async getSetProgress(user: Address, setId: number): Promise<SetProgress | null> {
    try {
      log.info('Getting set progress', { user, setId });

      const [collectionTracker, setRegistry] = await Promise.all([
        this.contractManager.getCollectionTracker(),
        this.contractManager.getSetRegistry(),
      ]);

      const [info, requirements] = await Promise.all([
        setRegistry.getSetInfo(setId),
        setRegistry.getSetRequirements(setId),
      ]);

      // Verificar progreso de cada requisito
      const requirementProgress = await Promise.all(
        requirements.types.map(async (type, index) => {
          const category = requirements.categories[index] || 0;
          const required = requirements.counts[index];
          
          const owned = await collectionTracker.getMinerCount(user, category, type);

          return {
            category,
            type,
            required,
            owned: Number(owned),
            categoryName: CATEGORY_NAMES[category as 0 | 1 | 2 | 3] || 'Unknown',
            typeName: MINER_TYPE_NAMES[type as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8] || 'Unknown',
          };
        })
      );

      // Calcular si está completado
      const isCompleted = requirementProgress.every(req => req.owned >= req.required);

      // Calcular progreso general (promedio)
      const totalProgress = requirementProgress.reduce((sum, req) => {
        const reqProgress = Math.min((req.owned / req.required) * 100, 100);
        return sum + reqProgress;
      }, 0);
      const avgProgress = Math.floor(totalProgress / requirementProgress.length);

      const progress: SetProgress = {
        setId,
        setName: info.name,
        bonusPercentage: info.bonusPercentage,
        isCompleted,
        progress: avgProgress,
        requirements: requirementProgress,
      };

      log.info('Set progress calculated', { 
        setId,
        isCompleted,
        progress: avgProgress 
      });

      return progress;
    } catch (error) {
      log.error('Error getting set progress', { error, user, setId });
      return null;
    }
  }

  /**
   * Obtiene el progreso de un usuario en todos los sets
   */
  async getAllSetProgress(user: Address): Promise<SetProgress[]> {
    try {
      log.info('Getting all set progress', { user });

      const sets = await this.getAllSets();
      
      const progressPromises = sets
        .filter(set => set.isActive)
        .map(set => this.getSetProgress(user, set.id));

      const allProgress = await Promise.all(progressPromises);

      // Filtrar nulls
      const validProgress = allProgress.filter((p): p is SetProgress => p !== null);

      log.info('All set progress retrieved', { 
        user,
        count: validProgress.length 
      });

      return validProgress;
    } catch (error) {
      log.error('Error getting all set progress', { error, user });
      return [];
    }
  }

  /**
   * Obtiene el resumen de bonuses activos de un usuario
   */
  async getUserBonusSummary(user: Address): Promise<UserBonusSummary> {
    try {
      log.info('Getting user bonus summary', { user });

      const allProgress = await this.getAllSetProgress(user);

      // Filtrar sets completados
      const completedSets = allProgress.filter(p => p.isCompleted);

      // Calcular bonus total
      const totalBonus = completedSets.reduce((sum, set) => {
        return sum + set.bonusPercentage;
      }, 0);

      // Crear lista de bonuses activos
      const activeBonuses = completedSets.map(set => ({
        setId: set.setId,
        setName: set.setName,
        bonus: set.bonusPercentage,
      }));

      // Encontrar el set más cercano a completar (sin completar)
      const incompleteSets = allProgress.filter(p => !p.isCompleted);
      const nextSetProgress = incompleteSets.length > 0
        ? incompleteSets.reduce((closest, current) => 
            current.progress > closest.progress ? current : closest
          )
        : undefined;

      const summary: UserBonusSummary = {
        totalBonus,
        completedSets: completedSets.map(s => s.setId),
        activeBonuses,
        nextSetProgress,
      };

      log.info('User bonus summary calculated', { 
        user,
        totalBonus,
        completedCount: completedSets.length 
      });

      return summary;
    } catch (error) {
      log.error('Error getting user bonus summary', { error, user });
      return {
        totalBonus: 0,
        completedSets: [],
        activeBonuses: [],
      };
    }
  }

  /**
   * Formatea el bonus en porcentaje legible
   */
  formatBonus(basisPoints: number): string {
    const percentage = basisPoints / 100;
    return `+${percentage.toFixed(2)}%`;
  }

  /**
   * Obtiene el color del progreso según el porcentaje
   */
  getProgressColor(progress: number): string {
    if (progress >= 100) return 'green';
    if (progress >= 75) return 'blue';
    if (progress >= 50) return 'yellow';
    if (progress >= 25) return 'orange';
    return 'red';
  }

  /**
   * Obtiene el emoji del progreso según el porcentaje
   */
  getProgressEmoji(progress: number): string {
    if (progress >= 100) return '✅';
    if (progress >= 75) return '🔵';
    if (progress >= 50) return '🟡';
    if (progress >= 25) return '🟠';
    return '🔴';
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createCollectionService(contractManager: ContractManager): CollectionService {
  return new CollectionService(contractManager);
}
