/**
 * VestingManagerFactory - Factory para crear instancias del contrato VestingManager
 * 
 * @pattern Factory Pattern (GoF)
 * @principle SRP - Responsabilidad única: creación de contratos VestingManager
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { VESTINGMANAGER_ABI } from '@/lib/abis/economy.abis';
import type { IVestingManager, VestingSchedule } from '../interfaces/IEconomyContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('VestingManagerFactory');

export interface VestingManagerConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: ethers.Signer | ethers.Provider;
}

/**
 * Factory para crear instancias del contrato VestingManager
 */
export class VestingManagerFactory {
  /**
   * Crea una instancia del contrato VestingManager
   */
  createVestingManager(config: VestingManagerConfig): IVestingManager {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      VESTINGMANAGER_ABI,
      signerOrProvider
    );

    return {
      address: config.address,
      chainId: config.chainId,

      getStatus: async () => ({
        address: config.address,
        isConnected: true,
        chainId: config.chainId,
      }),

      isDeployed: async () => {
        try {
          if (!signerOrProvider) return false;
          const provider = 'getCode' in signerOrProvider ? signerOrProvider : signerOrProvider.provider;
          if (!provider) return false;
          const code = await provider.getCode(config.address);
          return code !== '0x';
        } catch {
          return false;
        }
      },

      on: (eventName: string, callback: (event: any) => void) => {
        contract.on(eventName, callback);
        return () => contract.off(eventName, callback);
      },

      createSchedule: async (
        token: Address,
        beneficiary: Address,
        amount: bigint,
        startTime: bigint,
        duration: bigint,
        revocable: boolean
      ): Promise<TransactionResult & { scheduleId: bigint }> => {
        logger.info('Creating vesting schedule', {
          token,
          beneficiary,
          amount: amount.toString(),
          duration: duration.toString(),
        });

        try {
          const tx = await contract.createSchedule(
            token,
            beneficiary,
            amount,
            startTime,
            duration,
            revocable
          );
          const receipt = await tx.wait();

          // Extraer scheduleId del evento ScheduleCreated
          const event = receipt.events?.find((e: any) => e.event === 'ScheduleCreated');
          const scheduleId = event?.args?.scheduleId ?? 0n;

          logger.info('Vesting schedule created', {
            scheduleId: scheduleId.toString(),
            hash: receipt.transactionHash,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
            scheduleId: BigInt(scheduleId.toString()),
          };
        } catch (error) {
          logger.error('Error creating schedule', { error });
          throw error;
        }
      },

      release: async (scheduleId: bigint): Promise<TransactionResult> => {
        logger.info('Releasing vested tokens', {
          scheduleId: scheduleId.toString(),
        });

        try {
          const tx = await contract.release(scheduleId);
          const receipt = await tx.wait();

          logger.info('Tokens released', {
            scheduleId: scheduleId.toString(),
            hash: receipt.transactionHash,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error releasing tokens', { scheduleId: scheduleId.toString(), error });
          throw error;
        }
      },

      revoke: async (scheduleId: bigint): Promise<TransactionResult> => {
        logger.info('Revoking schedule', {
          scheduleId: scheduleId.toString(),
        });

        try {
          const tx = await contract.revoke(scheduleId);
          const receipt = await tx.wait();

          logger.info('Schedule revoked', {
            scheduleId: scheduleId.toString(),
            hash: receipt.transactionHash,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error revoking schedule', { error });
          throw error;
        }
      },

      getSchedule: async (scheduleId: bigint): Promise<VestingSchedule> => {
        try {
          const schedule = await contract.getSchedule(scheduleId);
          return {
            beneficiary: schedule.beneficiary as Address,
            totalAmount: BigInt(schedule.totalAmount.toString()),
            startTime: BigInt(schedule.startTime.toString()),
            duration: BigInt(schedule.duration.toString()),
            releasedAmount: BigInt(schedule.releasedAmount.toString()),
            revocable: schedule.revocable,
            revoked: schedule.revoked,
          };
        } catch (error) {
          logger.error('Error getting schedule', { scheduleId: scheduleId.toString(), error });
          throw error;
        }
      },

      getVestedAmount: async (scheduleId: bigint): Promise<bigint> => {
        try {
          const amount = await contract.getVestedAmount(scheduleId);
          return BigInt(amount.toString());
        } catch (error) {
          logger.error('Error getting vested amount', { error });
          return 0n;
        }
      },

      getReleasableAmount: async (scheduleId: bigint): Promise<bigint> => {
        try {
          const amount = await contract.getReleasableAmount(scheduleId);
          return BigInt(amount.toString());
        } catch (error) {
          logger.error('Error getting releasable amount', { error });
          return 0n;
        }
      },

      getUserSchedules: async (user: Address): Promise<bigint[]> => {
        try {
          const schedules = await contract.getUserSchedules(user);
          return schedules.map((s: any) => BigInt(s.toString()));
        } catch (error) {
          logger.error('Error getting user schedules', { user, error });
          return [];
        }
      },

      getUserTotalLocked: async (user: Address): Promise<bigint> => {
        try {
          const locked = await contract.getUserTotalLocked(user);
          return BigInt(locked.toString());
        } catch (error) {
          logger.error('Error getting user total locked', { error });
          return 0n;
        }
      },

      totalLocked: async (): Promise<bigint> => {
        try {
          const total = await contract.totalLocked();
          return BigInt(total.toString());
        } catch (error) {
          logger.error('Error getting total locked', { error });
          return 0n;
        }
      },

      DEFAULT_VESTING_DURATION: async (): Promise<bigint> => {
        try {
          const duration = await contract.DEFAULT_VESTING_DURATION();
          return BigInt(duration.toString());
        } catch (error) {
          logger.error('Error getting default duration', { error });
          return 15552000n; // 180 days in seconds
        }
      },

      BURN_PERCENTAGE: async (): Promise<bigint> => {
        try {
          const percent = await contract.BURN_PERCENTAGE();
          return BigInt(percent.toString());
        } catch (error) {
          logger.error('Error getting burn percentage', { error });
          return 15n;
        }
      },

      VESTING_PERCENTAGE: async (): Promise<bigint> => {
        try {
          const percent = await contract.VESTING_PERCENTAGE();
          return BigInt(percent.toString());
        } catch (error) {
          logger.error('Error getting vesting percentage', { error });
          return 85n;
        }
      },
    };
  }
}
