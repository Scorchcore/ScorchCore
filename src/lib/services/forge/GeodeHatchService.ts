/**
 * GeodeHatchService - Gestión de Eclosión de Geodas
 * 
 * Responsabilidad única: Eclosión de geodas
 * 
 * @pattern Service Layer (DDD)
 * @principle SRP - Solo gestiona eclosión
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { BaseForgeService } from '@/lib/services/base/BaseForgeService';
import { logger } from '@/lib/utils/logging/logger';
import { withCriticalError, withSafeRead } from '@/lib/utils';
import type { 
  IForgeContract,
  HatchResult
} from '@/lib/contracts/interfaces';

/**
 * Servicio especializado en eclosión de geodas
 * 
 * **REFACTORIZACIÓN:** Ahora extiende BaseForgeService para eliminar duplicación.
 */
export class GeodeHatchService extends BaseForgeService {
  constructor(contractManager: ContractManager) {
    super(contractManager);
  }

  /**
   * Eclosiona una geoda para obtener un CoreMiner
   * 
   * @param geodeId - ID de la geoda
   * @returns Resultado de la eclosión
   */
  async hatchGeode(geodeId: bigint): Promise<HatchResult> {
    logger.forge('hatch', geodeId);

    return withCriticalError(
      async () => {
        const result = await this.forgeContract.hatchGeode(geodeId);
        logger.transaction('Hatch Geode', result.transaction.hash, result.success);
        return result;
      },
      'Failed to hatch geode',
      { geodeId: geodeId.toString() }
    );
  }

  /**
   * Verifica si una geoda está lista para eclosionar
   * 
   * @param geodeId - ID de la geoda
   * @returns true si está lista, false si no
   */
  async canHatch(geodeId: bigint): Promise<boolean> {
    return withSafeRead(
      () => this.forgeContract.canHatch(geodeId),
      'Failed to check hatch eligibility',
      false,
      { geodeId: geodeId.toString() }
    );
  }

  /**
   * Obtiene el tiempo de incubación restante de una geoda
   * 
   * @param geodeId - ID de la geoda
   * @returns Segundos restantes, 0 si ya está lista
   */
  async getIncubationTime(geodeId: bigint): Promise<number> {
    return withSafeRead(
      () => this.forgeContract.getIncubationTime(geodeId),
      'Failed to get incubation time',
      0,
      { geodeId: geodeId.toString() }
    );
  }

  /**
   * Verifica si una geoda ya completó su tiempo de incubación
   * 
   * @param geodeId - ID de la geoda
   * @returns true si está lista, false si aún falta tiempo
   */
  async isReadyToHatch(geodeId: bigint): Promise<boolean> {
    return withSafeRead(
      async () => {
        const timeRemaining = await this.getIncubationTime(geodeId);
        return timeRemaining === 0;
      },
      'Failed to check hatch readiness',
      false,
      { geodeId: geodeId.toString() }
    );
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createGeodeHatchService(
  contractManager: ContractManager
): GeodeHatchService {
  return new GeodeHatchService(contractManager);
}
