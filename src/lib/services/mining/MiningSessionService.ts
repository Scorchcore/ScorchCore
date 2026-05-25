/**
 * MiningSessionService - Gestión de Sesiones de Minería
 * 
 * Responsabilidad única: Sesiones y estado de minería
 * 
 * @pattern Service Layer (DDD)
 * @principle SRP - Solo gestión de sesiones
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { BaseMiningService } from '@/lib/services/base/BaseMiningService';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { withSafeRead } from '@/lib/utils';
import type { MiningSession, SessionInfo } from './types';

const log = createServiceLogger('MiningSessionService');

/**
 * Servicio especializado en gestión de sesiones de minería
 * 
 * **REFACTORIZACIÓN:** Ahora extiende BaseMiningService para eliminar duplicación.
 */
export class MiningSessionService extends BaseMiningService {
  constructor(contractManager: ContractManager) {
    super(contractManager);
  }

  /**
   * Obtiene la sesión de minería actual de un minero
   * 
   * Compone datos de múltiples fuentes:
   * - isMining() para verificar estado
   * - getMinerInfo() para datos del minero
   * - getPendingRewards() para recompensas
   * 
   * @param minerId - ID del minero
   * @returns Sesión de minería o null si no está activo
   */
  async getMiningSession(minerId: bigint): Promise<MiningSession | null> {
    return withSafeRead(
      async () => {
        // Verificar si está minando
        const isActive = await this.miningContract.isMining(minerId);
        
        if (!isActive) {
          return null;
        }

        // Obtener información del minero
        const minerInfo = await this.miningContract.getMinerInfo(minerId);
        const pendingRewards = await this.miningContract.getPendingRewards(minerId);

        return {
          owner: minerInfo.owner,
          startTime: minerInfo.lastMined,
          lastClaim: minerInfo.lastMined,
          power: minerInfo.power,
          efficiency: minerInfo.efficiency,
          isActive: true,
          pendingRewards: pendingRewards.totalAmount,
        };
      },
      'Failed to get mining session',
      null,
      { minerId: minerId.toString() }
    );
  }

  /**
   * Obtiene el tiempo transcurrido desde el último claim
   * 
   * @param minerId - ID del minero
   * @returns Segundos desde el último claim
   */
  async getTimeSinceLastClaim(minerId: bigint): Promise<number> {
    return withSafeRead(
      async () => {
        const session = await this.getMiningSession(minerId);
        if (!session) return 0;

        const now = BigInt(Math.floor(Date.now() / 1000));
        const timeSince = now - session.lastClaim;
        return Number(timeSince);
      },
      'Failed to check mining status',
      0,
      { minerId: minerId.toString() }
    );
  }

  /**
   * Obtiene información detallada de una sesión
   * 
   * @param minerId - ID del minero
   * @returns Información completa de sesión
   */
  async getSessionInfo(minerId: bigint): Promise<SessionInfo | null> {
    return withSafeRead(
      async () => {
        const session = await this.getMiningSession(minerId);
        if (!session) return null;

        const timeElapsed = await this.getTimeSinceLastClaim(minerId);

        return {
          session,
          timeElapsed,
          estimatedRewards: session.pendingRewards,
          isActive: session.isActive,
        };
      },
      'Failed to get session info',
      null,
      { minerId: minerId.toString() }
    );
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   * 
   * **LIMITACIÓN:** Este método requiere que el usuario proporcione los IDs
   * de sus mineros, ya que el contrato IMiningContract no expone un método
   * para listar mineros por propietario.
   * 
   * Alternativa: Usar minerService.getMinersByOwner() si está disponible,
   * luego llamar a getMiningSession() para cada minero.
   * 
   * @param userAddress - Dirección del usuario
   * @param minerIds - (Opcional) Array de IDs de mineros del usuario
   * @returns Array de sesiones activas
   * 
   * @todo Implementar cuando IMiningContract tenga getMinersByOwner()
   * 
   * @example
   * ```typescript
   * // Opción 1: Proveer IDs conocidos
   * const sessions = await getActiveSessions(userAddress, [1n, 2n, 3n]);
   * 
   * // Opción 2: Integrar con minerService
   * const miners = await minerService.getMinersByOwner(userAddress);
   * const minerIds = miners.map(m => m.tokenId);
   * const sessions = await getActiveSessions(userAddress, minerIds);
   * ```
   */
  async getActiveSessions(
    userAddress: Address,
    minerIds?: bigint[]
  ): Promise<MiningSession[]> {
    try {
      if (!minerIds || minerIds.length === 0) {
        log.warn(
          'getActiveSessions called without minerIds - contract limitation',
          { 
            userAddress,
            note: 'IMiningContract does not expose getMinersByOwner() method'
          }
        );
        return [];
      }

      // Obtener sesiones de todos los mineros proporcionados
      const sessionPromises = minerIds.map(minerId => 
        this.getMiningSession(minerId)
      );
      
      const sessions = await Promise.all(sessionPromises);
      
      // Filtrar solo sesiones activas (no null)
      return sessions.filter((s): s is MiningSession => s !== null);
    } catch (error) {
      log.error('Failed to get active sessions', error, { userAddress });
      return [];
    }
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createMiningSessionService(
  contractManager: ContractManager
): MiningSessionService {
  return new MiningSessionService(contractManager);
}
