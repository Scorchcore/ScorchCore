/**
 * CycleService - Servicio de lógica de negocio para Cycle Management
 * 
 * Gestiona ciclos de minería con lockup periods y bonos
 * 
 * @pattern Service Layer (DDD)
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { CycleDuration } from '@/lib/contracts/interfaces/ICycleContract';
import { CYCLE_DURATION_NAMES } from './types';
import type {
  ActiveCycle,
  StartCycleOptions,
  StartCycleResult,
  EndCycleResult,
  CycleBonusInfo,
  MinerCycleStatus,
  UserCyclesSummary,
} from './types';

const log = createServiceLogger('CycleService');

/**
 * Implementación del servicio de gestión de ciclos
 * 
 * @pattern Service Layer (DDD)
 */
export class CycleService {
  constructor(private contractManager: ContractManager) {}

  /**
   * Inicia un nuevo ciclo de minería
   * 
   * @param options - Opciones del ciclo (minerIds, duration)
   * @returns Resultado con cycleId y hash de transacción
   */
  async startCycle(options: StartCycleOptions): Promise<StartCycleResult> {
    log.info('Starting new cycle', {
      minerCount: options.minerIds.length,
      duration: options.duration,
    });

    try {
      // Validar que haya miners
      if (options.minerIds.length === 0) {
        throw new Error('No miners provided for cycle');
      }

      // Verificar que los miners no estén bloqueados
      const cycleContract = this.contractManager.getCycleManager();
      const lockedChecks = await Promise.all(
        options.minerIds.map(id => cycleContract.isMinerLocked(id))
      );

      const lockedMiners = options.minerIds.filter((_, index) => lockedChecks[index]);
      if (lockedMiners.length > 0) {
        throw new Error(`Miners already locked in cycles: ${lockedMiners.join(', ')}`);
      }

      // Iniciar ciclo
      const result = await cycleContract.startCycle(
        options.minerIds,
        options.duration
      );

      if (!result.success) {
        throw new Error('Failed to start cycle');
      }

      // Obtener el cycleId del último ciclo creado
      const totalCycles = await cycleContract.getTotalCycles();
      const cycleId = totalCycles; // El último creado

      log.info('Cycle started successfully', {
        cycleId: cycleId.toString(),
        hash: result.hash,
      });

      return {
        cycleId,
        transactionHash: result.hash,
        success: true,
      };
    } catch (error) {
      log.error('Failed to start cycle', error);
      throw error;
    }
  }

  /**
   * Finaliza un ciclo de minería
   * 
   * @param cycleId - ID del ciclo a finalizar
   * @returns Resultado con hash de transacción
   */
  async endCycle(cycleId: bigint): Promise<EndCycleResult> {
    log.info('Ending cycle', { cycleId: cycleId.toString() });

    try {
      const cycleContract = this.contractManager.getCycleManager();

      // Verificar que el ciclo esté terminado
      const isFinished = await cycleContract.isCycleFinished(cycleId);
      if (!isFinished) {
        throw new Error('Cycle is not finished yet');
      }

      // Finalizar ciclo
      const result = await cycleContract.endCycle(cycleId);

      if (!result.success) {
        throw new Error('Failed to end cycle');
      }

      log.info('Cycle ended successfully', {
        cycleId: cycleId.toString(),
        hash: result.hash,
      });

      return {
        transactionHash: result.hash,
        success: true,
      };
    } catch (error) {
      log.error('Failed to end cycle', error);
      throw error;
    }
  }

  /**
   * Obtiene los ciclos activos de un usuario
   * 
   * @param userAddress - Dirección del usuario
   * @returns Array de ciclos activos con información enriquecida
   */
  async getUserActiveCycles(userAddress: Address): Promise<ActiveCycle[]> {
    log.info('Getting user active cycles', { user: userAddress });

    try {
      const cycleContract = this.contractManager.getCycleManager();

      // Obtener IDs de ciclos activos
      const cycleIds = await cycleContract.getUserActiveCycles(userAddress);

      if (cycleIds.length === 0) {
        return [];
      }

      // Obtener información de cada ciclo
      const activeCycles: ActiveCycle[] = await Promise.all(
        cycleIds.map(async (cycleId) => {
          const cycle = await cycleContract.getCycle(cycleId);
          const isFinished = await cycleContract.isCycleFinished(cycleId);
          const now = Math.floor(Date.now() / 1000);
          const endTime = Number(cycle.endTime);
          const timeRemaining = Math.max(0, endTime - now);

          return {
            cycleId,
            minerIds: cycle.minerIds,
            minerCount: cycle.minerIds.length,
            duration: cycle.duration,
            durationName: CYCLE_DURATION_NAMES[cycle.duration],
            bonusPercentage: cycle.bonusPercentage,
            startTime: Number(cycle.startTime),
            endTime,
            timeRemaining,
            isFinished,
            isActive: cycle.isActive,
            claimed: cycle.claimed,
            canClaim: isFinished && !cycle.claimed,
          };
        })
      );

      return activeCycles;
    } catch (error) {
      log.error('Failed to get user active cycles', error);
      throw error;
    }
  }

  /**
   * Obtiene información de un ciclo específico
   * 
   * @param cycleId - ID del ciclo
   * @returns Información enriquecida del ciclo
   */
  async getCycleInfo(cycleId: bigint): Promise<ActiveCycle | null> {
    try {
      const cycleContract = this.contractManager.getCycleManager();
      const cycle = await cycleContract.getCycle(cycleId);

      if (!cycle || !cycle.isActive) {
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(cycle.endTime);
      const startTime = Number(cycle.startTime);
      const timeRemaining = Math.max(0, endTime - now);
      const isFinished = now >= endTime;

      return {
        cycleId,
        minerIds: cycle.minerIds,
        minerCount: cycle.minerIds.length,
        duration: cycle.duration,
        durationName: CYCLE_DURATION_NAMES[cycle.duration],
        bonusPercentage: cycle.bonusPercentage,
        startTime,
        endTime,
        timeRemaining,
        isFinished,
        isActive: cycle.isActive,
        claimed: cycle.claimed,
        canClaim: isFinished && !cycle.claimed,
      };
    } catch (error) {
      log.error('Failed to get cycle info', error);
      return null;
    }
  }

  /**
   * Obtiene información de bonus para todas las duraciones de ciclo
   * Procesa secuencialmente para evitar rate limiting de Ronin RPC
   * 
   * @returns Array con info de cada duración disponible
   */
  async getAllCycleBonusInfo(): Promise<CycleBonusInfo[]> {
    const cycleContract = this.contractManager.getCycleManager();

    const durations: CycleDuration[] = [0, 1, 2, 3, 4]; // SHORT, STANDARD, COMMITTED, STRATEGIC, MASTER
    const bonusInfos: CycleBonusInfo[] = [];

    // Procesar secuencialmente con pequeño delay para evitar rate limiting
    for (const duration of durations) {
      try {
        const bonus = await cycleContract.getCycleBonus(duration);
        const seconds = await cycleContract.getCycleDurationSeconds(duration);
        const days = Math.floor(Number(seconds) / 86400);

        bonusInfos.push({
          duration,
          durationName: CYCLE_DURATION_NAMES[duration],
          durationSeconds: Number(seconds),
          durationDays: days,
          bonusPercentage: bonus / 100, // Convertir de basis points
          bonusDisplay: bonus > 0 ? `+${bonus / 100}%` : 'Sin bonus',
        });

        // Pequeño delay entre llamadas para evitar rate limit
        if (duration < 4) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        log.error('Failed to get bonus info for duration', error, { duration });
        // Continuar con las siguientes duraciones en lugar de fallar todo
        bonusInfos.push({
          duration,
          durationName: CYCLE_DURATION_NAMES[duration],
          durationSeconds: 0,
          durationDays: 0,
          bonusPercentage: 0,
          bonusDisplay: 'Error',
        });
      }
    }

    return bonusInfos;
  }

  /**
   * 
   * @param minerId - ID del miner
   * @returns Estado del miner
   */
  async getMinerCycleStatus(minerId: bigint): Promise<MinerCycleStatus> {
    try {
      const cycleContract = this.contractManager.getCycleManager();
      const isLocked = await cycleContract.isMinerLocked(minerId);

      return {
        minerId,
        isLocked,
        canStartCycle: !isLocked,
      };
    } catch (error) {
      log.error('Failed to get miner cycle status', error);
      return {
        minerId,
        isLocked: false,
        canStartCycle: false,
      };
    }
  }

  /**
   * Obtiene un resumen de los ciclos del usuario
   * 
   * @param userAddress - Dirección del usuario
   * @returns Resumen con estadísticas
   */
  async getUserCyclesSummary(userAddress: Address): Promise<UserCyclesSummary> {
    const activeCycles = await this.getUserActiveCycles(userAddress);

    // Calcular total de miners bloqueados
    const totalMinersLocked = activeCycles.reduce(
      (acc, cycle) => acc + cycle.minerIds.length,
      0
    );

    // Calcular bonus promedio
    const averageBonus =
      activeCycles.length > 0
        ? activeCycles.reduce((acc, cycle) => acc + cycle.bonusPercentage, 0) /
          activeCycles.length
        : 0;

    // Encontrar el próximo ciclo a terminar
    const nextCycleToEnd = activeCycles
      .filter(cycle => !cycle.isFinished)
      .sort((a, b) => a.timeRemaining - b.timeRemaining)[0];

    return {
      activeCycles,
      totalMinersLocked,
      averageBonus,
      nextCycleToEnd,
    };
  }

  /**
   * Verifica si múltiples miners pueden iniciar un ciclo
   * 
   * @param minerIds - Array de IDs de miners
   * @returns true si todos los miners pueden iniciar ciclo
   */
  async canStartCycleWithMiners(minerIds: bigint[]): Promise<boolean> {
    try {
      const cycleContract = this.contractManager.getCycleManager();
      const lockedChecks = await Promise.all(
        minerIds.map(id => cycleContract.isMinerLocked(id))
      );

      return !lockedChecks.some(isLocked => isLocked);
    } catch (error) {
      log.error('Failed to check if can start cycle', error);
      return false;
    }
  }
}

/**
 * Factory function para crear instancias del servicio
 */
export function createCycleService(contractManager: ContractManager): CycleService {
  return new CycleService(contractManager);
}
