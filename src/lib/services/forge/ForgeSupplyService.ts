/**
 * ForgeSupplyService - Gestión de Supply de Geodas
 * 
 * Responsabilidad: Consultar supply disponible desde SupplyTracker
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { BaseForgeService } from '@/lib/services/base/BaseForgeService';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { GeodeCategory } from '@/lib/constants/geodes';

const log = createServiceLogger('ForgeSupplyService');

/**
 * Información de supply por categoría
 */
export interface CategorySupplyInfo {
  category: GeodeCategory;
  maxSupply: number;
  mintedCount: number;
  remainingSupply: number;
  exhausted: boolean;
}

/**
 * Servicio para consultar supply de geodas desde SupplyTracker
 */
export class ForgeSupplyService extends BaseForgeService {
  constructor(contractManager: ContractManager) {
    super(contractManager);
  }

  /**
   * Obtiene el supply total minteado de una categoría específica
   * Suma todos los tipos de Axie dentro de esa categoría
   */
  async getCategoryMintedCount(category: GeodeCategory): Promise<number> {
    // Verificar que haya provider configurado ANTES de hacer cualquier cosa
    const provider = this.contractManager.getProvider();
    if (!provider) {
      log.warn('No provider available, cannot fetch supply', { category });
      return 0; // Retornar 0 en lugar de fallar
    }

    try {
      // Acceder al contrato con type any para usar métodos no tipados
      const forgeContract = this.contractManager.getContract<any>('ForgeFactory');
      const recipeContract = this.contractManager.getRecipeRegistry();
      
      // Hay 9 tipos de Axie (0-8): BEAST, AQUA, BIRD, REPTILE, BUG, PLANT, MECH, DUSK, DAWN
      // Y 7 minerIndex por tipo (0-6)
      let totalMinted = 0;

      for (let minerType = 0; minerType < 9; minerType++) {
        for (let minerIndex = 0; minerIndex < 7; minerIndex++) {
          try {
            // Obtener maxSupply desde RecipeRegistry
            const maxSupply = await recipeContract.getRecipeMaxSupply(
              category,
              minerType,
              minerIndex
            );
            
            if (maxSupply > 0n) {
              // Obtener remaining supply de esta receta específica
              const remaining = await forgeContract.getRecipeRemainingSupply(
                category,
                minerType,
                minerIndex
              );
              
              const minted = Number(maxSupply - remaining);
              totalMinted += minted;
            }
          } catch (error) {
            // Receta no configurada o error, skip
            log.debug('Recipe not configured or error', { category, minerType, minerIndex, error });
          }
        }
      }

      return totalMinted;
    } catch (error) {
      log.error('Error getting category minted count', { category, error });
      throw error;
    }
  }

  /**
   * Obtiene información completa de supply para una categoría
   */
  async getCategorySupplyInfo(
    category: GeodeCategory,
    maxSupply: number
  ): Promise<CategorySupplyInfo> {
    try {
      const mintedCount = await this.getCategoryMintedCount(category);
      const remainingSupply = Math.max(0, maxSupply - mintedCount);
      const exhausted = remainingSupply === 0;

      return {
        category,
        maxSupply,
        mintedCount,
        remainingSupply,
        exhausted,
      };
    } catch (error) {
      log.error('Error getting category supply info', { category, error });
      throw error;
    }
  }

  /**
   * Obtiene el supply disponible de una receta específica
   */
  async getRecipeRemainingSupply(
    category: number,
    minerType: number,
    minerIndex: number
  ): Promise<bigint> {
    try {
      // Verificar que haya provider configurado
      const provider = this.contractManager.getProvider();
      if (!provider) {
        log.warn('No provider available, cannot fetch recipe supply');
        return 0n; // Retornar 0 en lugar de fallar
      }

      // Acceder al contrato con type any para usar métodos no tipados
      const forgeContract = this.contractManager.getContract<any>('ForgeFactory');
      return await forgeContract.getRecipeRemainingSupply(
        category,
        minerType,
        minerIndex
      );
    } catch (error) {
      log.error('Error getting recipe remaining supply', { 
        category, 
        minerType, 
        minerIndex, 
        error 
      });
      throw error;
    }
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createForgeSupplyService(
  contractManager: ContractManager
): ForgeSupplyService {
  return new ForgeSupplyService(contractManager);
}
