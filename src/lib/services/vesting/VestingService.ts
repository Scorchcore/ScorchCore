/**
 * VestingService - Servicio de negocio para el Vesting Manager
 * 
 * @pattern Service Layer Pattern - Abstrae lógica de negocio del contrato
 * @pattern Facade Pattern - Simplifica interacción con VestingManager
 * @principle SRP - Responsabilidad única: gestión de Vesting
 */

import type { Address } from 'viem';
import type { ContractManager } from '@/lib/contracts/ContractManager';
import type { VestingSchedule } from '@/lib/contracts/interfaces/IEconomyContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('VestingService');

/**
 * Schedule con información adicional calculada para UI
 */
export interface VestingScheduleUI extends VestingSchedule {
  scheduleId: bigint;
  vestedAmount: bigint;           // Total vested hasta ahora
  releasableAmount: bigint;       // Disponible para liberar
  remainingAmount: bigint;        // Aún bloqueado (total - released)
  progressPercent: number;        // % de progreso (0-100)
  timeRemainingSeconds: number;   // Segundos hasta completar
  isComplete: boolean;            // Si ya está 100% vested
  canRelease: boolean;            // Si hay tokens disponibles para liberar
  
  // Formateos
  totalAmountFormatted: string;
  vestedAmountFormatted: string;
  releasableAmountFormatted: string;
  remainingAmountFormatted: string;
}

/**
 * Dashboard consolidado de vesting
 */
export interface VestingDashboard {
  schedules: VestingScheduleUI[];
  totalLocked: bigint;            // Total bloqueado del usuario
  totalReleased: bigint;          // Total ya liberado
  totalReleasable: bigint;        // Total disponible para liberar ahora
  activeSchedulesCount: number;   // Schedules activos (no revoked, no complete)
  completedSchedulesCount: number;
  
  // Formateos
  totalLockedFormatted: string;
  totalReleasedFormatted: string;
  totalReleasableFormatted: string;
}

/**
 * Servicio para gestionar Vesting Schedules
 */
export class VestingService {
  private contractManager: ContractManager;

  constructor(contractManager: ContractManager) {
    this.contractManager = contractManager;
  }

  /**
   * Obtiene todos los schedules de un usuario con info calculada
   * 
   * @param user - Dirección del usuario
   * @returns Array de schedules con info de UI
   */
  async getUserSchedules(user: Address): Promise<VestingScheduleUI[]> {
    try {
      log.info('Getting user schedules', { user });

      const vestingManager = this.contractManager.getVestingManager();
      const scheduleIds = await vestingManager.getUserSchedules(user);

      if (scheduleIds.length === 0) {
        log.info('No schedules found for user', { user });
        return [];
      }

      // Obtener info de cada schedule en paralelo
      const schedulesPromises = scheduleIds.map(async (id) => {
        try {
          const [schedule, vestedAmount, releasableAmount] = await Promise.all([
            vestingManager.getSchedule(id),
            vestingManager.getVestedAmount(id),
            vestingManager.getReleasableAmount(id),
          ]);

          return this.buildScheduleUI(id, schedule, vestedAmount, releasableAmount);
        } catch (error) {
          log.error('Error getting schedule', { scheduleId: id.toString(), error });
          return null;
        }
      });

      const schedules = await Promise.all(schedulesPromises);
      const validSchedules = schedules.filter((s): s is VestingScheduleUI => s !== null);

      log.info('User schedules loaded', {
        user,
        count: validSchedules.length,
      });

      return validSchedules;
    } catch (error) {
      log.error('Error getting user schedules', { user, error });
      return [];
    }
  }

  /**
   * Obtiene dashboard consolidado del usuario
   * 
   * @param user - Dirección del usuario
   * @returns Dashboard completo
   */
  async getUserDashboard(user: Address): Promise<VestingDashboard> {
    try {
      log.info('Getting user dashboard', { user });

      const schedules = await this.getUserSchedules(user);
      
      const totalLocked = schedules.reduce(
        (sum, s) => sum + (s.totalAmount - s.releasedAmount),
        0n
      );
      
      const totalReleased = schedules.reduce(
        (sum, s) => sum + s.releasedAmount,
        0n
      );
      
      const totalReleasable = schedules.reduce(
        (sum, s) => sum + s.releasableAmount,
        0n
      );

      const activeSchedulesCount = schedules.filter(
        s => !s.revoked && !s.isComplete
      ).length;

      const completedSchedulesCount = schedules.filter(
        s => s.isComplete && !s.revoked
      ).length;

      return {
        schedules,
        totalLocked,
        totalReleased,
        totalReleasable,
        activeSchedulesCount,
        completedSchedulesCount,
        totalLockedFormatted: this.formatAmount(totalLocked),
        totalReleasedFormatted: this.formatAmount(totalReleased),
        totalReleasableFormatted: this.formatAmount(totalReleasable),
      };
    } catch (error) {
      log.error('Error getting user dashboard', { user, error });
      return {
        schedules: [],
        totalLocked: 0n,
        totalReleased: 0n,
        totalReleasable: 0n,
        activeSchedulesCount: 0,
        completedSchedulesCount: 0,
        totalLockedFormatted: '0 Tokens',
        totalReleasedFormatted: '0 Tokens',
        totalReleasableFormatted: '0 Tokens',
      };
    }
  }

  /**
   * Libera tokens vested de un schedule
   * 
   * @param scheduleId - ID del schedule
   * @returns Resultado de la transacción
   */
  async release(scheduleId: bigint) {
    try {
      log.info('Releasing vested tokens', {
        scheduleId: scheduleId.toString(),
      });

      const vestingManager = this.contractManager.getVestingManager();
      const result = await vestingManager.release(scheduleId);

      log.info('Tokens released successfully', {
        scheduleId: scheduleId.toString(),
        txHash: result.hash,
      });

      return result;
    } catch (error) {
      log.error('Error releasing tokens', { scheduleId: scheduleId.toString(), error });
      throw error;
    }
  }

  /**
   * Obtiene un schedule específico con info de UI
   * 
   * @param scheduleId - ID del schedule
   * @returns Schedule con info calculada
   */
  async getSchedule(scheduleId: bigint): Promise<VestingScheduleUI | null> {
    try {
      const vestingManager = this.contractManager.getVestingManager();
      
      const [schedule, vestedAmount, releasableAmount] = await Promise.all([
        vestingManager.getSchedule(scheduleId),
        vestingManager.getVestedAmount(scheduleId),
        vestingManager.getReleasableAmount(scheduleId),
      ]);

      return this.buildScheduleUI(scheduleId, schedule, vestedAmount, releasableAmount);
    } catch (error) {
      log.error('Error getting schedule', { scheduleId: scheduleId.toString(), error });
      return null;
    }
  }

  /**
   * Construye un VestingScheduleUI desde datos del contrato
   */
  private buildScheduleUI(
    scheduleId: bigint,
    schedule: VestingSchedule,
    vestedAmount: bigint,
    releasableAmount: bigint
  ): VestingScheduleUI {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const endTime = schedule.startTime + schedule.duration;
    const elapsed = now > schedule.startTime ? now - schedule.startTime : 0n;
    const timeRemaining = endTime > now ? Number(endTime - now) : 0;

    const progressPercent = schedule.duration > 0n
      ? Math.min(100, Number((elapsed * 100n) / schedule.duration))
      : 0;

    const remainingAmount = schedule.totalAmount - schedule.releasedAmount;
    const isComplete = vestedAmount >= schedule.totalAmount;
    const canRelease = releasableAmount > 0n && !schedule.revoked;

    return {
      ...schedule,
      scheduleId,
      vestedAmount,
      releasableAmount,
      remainingAmount,
      progressPercent,
      timeRemainingSeconds: timeRemaining,
      isComplete,
      canRelease,
      totalAmountFormatted: this.formatAmount(schedule.totalAmount),
      vestedAmountFormatted: this.formatAmount(vestedAmount),
      releasableAmountFormatted: this.formatAmount(releasableAmount),
      remainingAmountFormatted: this.formatAmount(remainingAmount),
    };
  }

  /**
   * Calcula el tiempo restante hasta el próximo unlock
   * 
   * @param schedules - Schedules del usuario
   * @returns Segundos hasta el próximo unlock disponible
   */
  calculateNextUnlock(schedules: VestingScheduleUI[]): number {
    const activeSchedules = schedules.filter(s => !s.revoked && !s.isComplete);
    
    if (activeSchedules.length === 0) return 0;

    // Encontrar el schedule con menor tiempo restante
    const minTimeRemaining = Math.min(
      ...activeSchedules.map(s => s.timeRemainingSeconds)
    );

    return minTimeRemaining;
  }

  /**
   * Formatea un monto de tokens
   * 
   * @param amount - Monto en wei
   * @returns String formateado
   */
  private formatAmount(amount: bigint): string {
    const tokens = Number(amount) / 1e18;
    return `${tokens.toFixed(2)} Tokens`;
  }

  /**
   * Formatea un timestamp a fecha legible
   * 
   * @param timestamp - Timestamp en segundos
   * @returns String formateado
   */
  formatDate(timestamp: bigint): string {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Formatea duración en segundos a string legible
   * 
   * @param seconds - Duración en segundos
   * @returns String legible (ej: "3 meses", "15 días")
   */
  formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    
    if (days > 0) {
      return `${days} ${days === 1 ? 'día' : 'días'}`;
    }
    
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createVestingService(contractManager: ContractManager): VestingService {
  return new VestingService(contractManager);
}
