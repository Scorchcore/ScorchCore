/**
 * MiningFacade - Enhanced Facade Pattern
 * 
 * Proporciona una API unificada con validaciones, retry logic y orquestación.
 * No solo delega, sino que agrega valor real:
 * - ✅ Validación de inputs con Zod
 * - ✅ Retry automático para operaciones blockchain
 * - ✅ Orquestación de operaciones complejas
 * - ✅ Logging estructurado
 * 
 * @pattern Facade (GoF)
 * @pattern Retry with Exponential Backoff
 * @pattern Validation
 */

import type { Address } from 'viem';
import { ContractManager } from '@/lib/contracts/ContractManager';
import { MiningOperationsService } from './MiningOperationsService';
import { MiningSessionService } from './MiningSessionService';
import { MiningRewardsService } from './MiningRewardsService';
import { MinerFeedingService } from './MinerFeedingService';
import { retryTransaction } from '@/lib/utils/network/retry';
import { validateInput } from '@/lib/services/validation/schemas';
import {
  StartMiningInputSchema,
  StopMiningInputSchema,
  ClaimRewardsInputSchema,
  FeedMinerInputSchema,
  EstimateRewardsInputSchema,
  TokenIdSchema,
  AddressSchema,
} from '@/lib/services/validation/schemas';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('MiningFacade');
import type {
  MiningSession,
  MiningTransactionResult,
  ClaimResult,
  SessionInfo,
} from './types';

/**
 * Facade que unifica los servicios modulares de Mining
 * Mantiene compatibilidad con API anterior
 */
export class MiningFacade {
  private operationsService: MiningOperationsService;
  private sessionService: MiningSessionService;
  private rewardsService: MiningRewardsService;
  private feedingService: MinerFeedingService;

  /**
   * @param contractManager - Gestor de contratos
   * @param services - (Opcional) Servicios pre-instanciados para inyección de dependencias
   */
  constructor(
    contractManager: ContractManager,
    services?: {
      operationsService?: MiningOperationsService;
      sessionService?: MiningSessionService;
      rewardsService?: MiningRewardsService;
      feedingService?: MinerFeedingService;
    }
  ) {
    // Inyección de dependencias con retrocompatibilidad
    this.operationsService = services?.operationsService || new MiningOperationsService(contractManager);
    this.sessionService = services?.sessionService || new MiningSessionService(contractManager);
    this.rewardsService = services?.rewardsService || new MiningRewardsService(contractManager);
    this.feedingService = services?.feedingService || new MinerFeedingService(contractManager);
  }

  // ==========================================
  // Operations (delegado a MiningOperationsService)
  // ==========================================

  async startMining(
    minerId: bigint,
    power: bigint,
    efficiency: bigint
  ): Promise<MiningTransactionResult> {
    // Validar inputs
    const validated = validateInput(StartMiningInputSchema, {
      minerId,
      power,
      efficiency,
    });

    log.info('Starting mining', {
      minerId: validated.minerId.toString(),
      power: validated.power.toString(),
    });

    // Ejecutar con retry automático
    return retryTransaction(
      () => this.operationsService.startMining(
        validated.minerId,
        validated.power,
        validated.efficiency
      ),
      {
        maxAttempts: 2,
        onRetry: (attempt) => {
          log.warn(`Retrying start mining (attempt ${attempt})`, {
            minerId: validated.minerId.toString(),
          });
        },
      }
    );
  }

  async stopMining(minerId: bigint): Promise<MiningTransactionResult> {
    // Validar inputs
    const validated = validateInput(StopMiningInputSchema, { minerId });

    log.info('Stopping mining', { minerId: validated.minerId.toString() });

    // Ejecutar con retry automático
    return retryTransaction(
      () => this.operationsService.stopMining(validated.minerId),
      {
        maxAttempts: 2,
        onRetry: (attempt) => {
          log.warn(`Retrying stop mining (attempt ${attempt})`);
        },
      }
    );
  }

  async claimRewards(minerId: bigint): Promise<ClaimResult> {
    // Validar inputs
    const validated = validateInput(ClaimRewardsInputSchema, { minerId });

    log.info('Claiming rewards', { minerId: validated.minerId.toString() });

    // Ejecutar con retry automático
    return retryTransaction(
      () => this.operationsService.claimRewards(validated.minerId),
      {
        maxAttempts: 3, // Más intentos para claim (crítico)
        onRetry: (attempt) => {
          log.warn(`Retrying claim (attempt ${attempt})`);
        },
      }
    );
  }

  async isMining(minerId: bigint): Promise<boolean> {
    return this.operationsService.isMining(minerId);
  }

  // ==========================================
  // Session (delegado a MiningSessionService)
  // ==========================================

  async getMiningSession(minerId: bigint): Promise<MiningSession | null> {
    return this.sessionService.getMiningSession(minerId);
  }

  async getTimeSinceLastClaim(minerId: bigint): Promise<number> {
    return this.sessionService.getTimeSinceLastClaim(minerId);
  }

  async getSessionInfo(minerId: bigint): Promise<SessionInfo | null> {
    return this.sessionService.getSessionInfo(minerId);
  }

  async getActiveSessions(userAddress: Address): Promise<MiningSession[]> {
    return this.sessionService.getActiveSessions(userAddress);
  }

  // ==========================================
  // Rewards (delegado a MiningRewardsService)
  // ==========================================

  async calculatePendingRewards(minerId: bigint): Promise<bigint> {
    return this.rewardsService.calculatePendingRewards(minerId);
  }

  async estimateRewardsPerHour(
    power: bigint,
    efficiency: bigint
  ): Promise<bigint> {
    return this.rewardsService.estimateRewardsPerHour(power, efficiency);
  }

  async getBaseRewardPerHour(): Promise<bigint> {
    return this.rewardsService.getBaseRewardPerHour();
  }

  async getFCoreBalance(userAddress: Address): Promise<bigint> {
    return this.rewardsService.getFCoreBalance(userAddress);
  }

  async calculateTotalEarned(minerId: bigint): Promise<bigint> {
    return this.rewardsService.calculateTotalEarned(minerId);
  }

  async estimateRewardsForPeriod(
    power: bigint,
    efficiency: bigint,
    hours: number
  ): Promise<bigint> {
    return this.rewardsService.estimateRewardsForPeriod(power, efficiency, hours);
  }

  // ==========================================
  // Feeding (delegado a MinerFeedingService)
  // ==========================================

  async feedMiner(minerId: bigint): Promise<MiningTransactionResult> {
    // Validar inputs
    const validated = validateInput(FeedMinerInputSchema, { minerId });

    log.info('Feeding miner', { minerId: validated.minerId.toString() });

    // Ejecutar con retry automático
    return retryTransaction(
      () => this.feedingService.feedMiner(validated.minerId),
      {
        maxAttempts: 2,
        onRetry: (attempt) => {
          log.warn(`Retrying feed miner (attempt ${attempt})`);
        },
      }
    );
  }

  async checkHungerLevel(minerId: bigint): Promise<number> {
    return this.feedingService.checkHungerLevel(minerId);
  }

  async needsFeeding(minerId: bigint): Promise<boolean> {
    return this.feedingService.needsFeeding(minerId);
  }

  async getFeedingCost(minerId: bigint): Promise<bigint> {
    return this.feedingService.getFeedingCost(minerId);
  }

  // ==========================================
  // Acceso directo a servicios internos
  // (para uso avanzado)
  // ==========================================

  get operations() {
    return this.operationsService;
  }

  get session() {
    return this.sessionService;
  }

  get rewards() {
    return this.rewardsService;
  }

  get feeding() {
    return this.feedingService;
  }

  // ==========================================
  // Operaciones Orquestadas (Valor Agregado)
  // ==========================================

  /**
   * Orquestación: Inicia mining solo si el minero está listo
   * 
   * Flujo completo:
   * 1. Verifica que no esté minando ya
   * 2. Verifica nivel de hambre
   * 3. Alimenta automáticamente si es necesario
   * 4. Inicia mining
   * 
   * @param minerId - ID del minero
   * @param power - Poder de minado
   * @param efficiency - Eficiencia
   * @param autoFeed - Si debe alimentar automáticamente (default: true)
   * @returns Resultado de la operación
   * @throws Error si ya está minando
   */
  async startMiningWithAutoFeed(
    minerId: bigint,
    power: bigint,
    efficiency: bigint,
    autoFeed: boolean = true
  ): Promise<MiningTransactionResult> {
    log.info('Starting orchestrated mining', { minerId: minerId.toString() });

    // 1. Verificar que no esté minando
    const isMining = await this.isMining(minerId);
    if (isMining) {
      throw new Error(`Miner ${minerId} is already mining`);
    }

    // 2. Verificar nivel de hambre
    if (autoFeed) {
      const needsFeeding = await this.needsFeeding(minerId);
      if (needsFeeding) {
        log.info('Miner is hungry, feeding automatically', {
          minerId: minerId.toString(),
        });
        await this.feedMiner(minerId);
      }
    }

    // 3. Iniciar mining
    return this.startMining(minerId, power, efficiency);
  }

  /**
   * Orquestación: Claim con verificación de rewards pendientes
   * 
   * Flujo completo:
   * 1. Calcula rewards pendientes
   * 2. Verifica que haya rewards para claim
   * 3. Ejecuta claim
   * 
   * @param minerId - ID del minero
   * @param minRewards - Rewards mínimos para ejecutar claim (default: 0)
   * @returns Resultado del claim
   * @throws Error si no hay rewards suficientes
   */
  async claimWhenProfitable(
    minerId: bigint,
    minRewards: bigint = 0n
  ): Promise<ClaimResult> {
    log.info('Checking profitability before claim', {
      minerId: minerId.toString(),
    });

    // 1. Calcular rewards pendientes
    const pending = await this.calculatePendingRewards(minerId);

    // 2. Verificar mínimo
    if (pending < minRewards) {
      throw new Error(
        `Pending rewards (${pending.toString()}) below minimum (${minRewards.toString()})`
      );
    }

    log.info('Proceeding with claim', {
      minerId: minerId.toString(),
      pendingRewards: pending.toString(),
    });

    // 3. Claim
    return this.claimRewards(minerId);
  }

  /**
   * Batch operation: Stop mining para múltiples mineros
   * 
   * @param minerIds - Array de IDs de mineros
   * @returns Array de resultados
   */
  async batchStopMining(
    minerIds: bigint[]
  ): Promise<MiningTransactionResult[]> {
    log.info('Batch stopping mining', { count: minerIds.length });

    const results = await Promise.all(
      minerIds.map((minerId) => this.stopMining(minerId))
    );

    const successCount = results.filter((r) => r.success).length;
    log.info('Batch stop completed', {
      total: results.length,
      successful: successCount,
      failed: results.length - successCount,
    });

    return results;
  }

  /**
   * Batch operation: Claim rewards para múltiples mineros
   * 
   * @param minerIds - Array de IDs de mineros
   * @returns Array de resultados de claim
   */
  async batchClaimRewards(minerIds: bigint[]): Promise<ClaimResult[]> {
    log.info('Batch claiming rewards', { count: minerIds.length });

    const results = await Promise.all(
      minerIds.map((minerId) => this.claimRewards(minerId))
    );

    const totalClaimed = results.reduce(
      (sum, r) => sum + (r.amount || 0n),
      0n
    );

    log.info('Batch claim completed', {
      total: results.length,
      totalClaimed: totalClaimed.toString(),
    });

    return results;
  }

  /**
   * Orquestación completa: Alimenta mineros hambrientos en batch
   * 
   * @param minerIds - Array de IDs de mineros
   * @returns Array de mineros alimentados
   */
  async batchFeedHungryMiners(minerIds: bigint[]): Promise<bigint[]> {
    log.info('Checking and feeding hungry miners', { count: minerIds.length });

    const fedMiners: bigint[] = [];

    for (const minerId of minerIds) {
      try {
        const needsFeeding = await this.needsFeeding(minerId);
        if (needsFeeding) {
          await this.feedMiner(minerId);
          fedMiners.push(minerId);
        }
      } catch (error) {
        log.warn('Failed to feed miner', {
          minerId: minerId.toString(),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    log.info('Batch feeding completed', {
      checked: minerIds.length,
      fed: fedMiners.length,
    });

    return fedMiners;
  }
}

/**
 * Factory para crear instancia del servicio (compatible con API anterior)
 * 
 * @pattern Factory Method
 */
export function createMiningService(
  contractManager: ContractManager,
  services?: {
    operationsService?: MiningOperationsService;
    sessionService?: MiningSessionService;
    rewardsService?: MiningRewardsService;
    feedingService?: MinerFeedingService;
  }
): MiningFacade {
  return new MiningFacade(contractManager, services);
}
