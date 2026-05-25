/**
 * EmissionScheduleFactory
 * 
 * Factory para crear instancias del contrato EmissionSchedule con ethers.js
 * 
 * @pattern Factory Pattern (GoF)
 * @principle Single Responsibility - Solo maneja la instanciación del contrato
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { EMISSIONSCHEDULE_ABI } from '@/lib/abis/core.abis';
import type { IEmissionSchedule } from '../interfaces/IEconomyContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('EmissionScheduleFactory');

export interface EmissionScheduleConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: ethers.Signer | ethers.Provider;
}

/**
 * Factory para crear instancias de EmissionSchedule
 */
export class EmissionScheduleFactory {
  /**
   * Crea una instancia del contrato EmissionSchedule
   */
  createEmissionSchedule(config: EmissionScheduleConfig): IEmissionSchedule {
    const { address, signerOrProvider, chainId } = config;

    const contract = new ethers.Contract(
      address,
      EMISSIONSCHEDULE_ABI,
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

      getCurrentEmissionRate: async (): Promise<bigint> => {
        try {
          logger.debug('Getting current emission rate...');
          const rate = await contract.getCurrentEmissionRate();
          logger.info('Current emission rate retrieved', {
            rate: rate.toString(),
            ratePerYear: (rate * 31536000n).toString(),
          });
          return rate;
        } catch (error) {
          logger.error('Error getting current emission rate', { error });
          throw error;
        }
      },

      getTotalEmitted: async (): Promise<bigint> => {
        try {
          logger.debug('Getting total emitted...');
          const total = await contract.getTotalEmitted();
          logger.info('Total emitted retrieved', {
            total: total.toString(),
          });
          return total;
        } catch (error) {
          logger.error('Error getting total emitted', { error });
          throw error;
        }
      },

      getRewardsForPeriod: async (duration: bigint): Promise<bigint> => {
        try {
          logger.debug('Getting rewards for period', {
            duration: duration.toString(),
          });
          const rewards = await contract.getRewardsForPeriod(duration);
          logger.info('Rewards for period calculated', {
            duration: duration.toString(),
            rewards: rewards.toString(),
          });
          return rewards;
        } catch (error) {
          logger.error('Error getting rewards for period', {
            error,
            duration: duration.toString(),
          });
          throw error;
        }
      },

      getTimeUntilNextHalving: async (): Promise<bigint> => {
        try {
          logger.debug('Getting time until next halving...');
          const time = await contract.getTimeUntilNextHalving();
          logger.info('Time until next halving retrieved', {
            seconds: time.toString(),
            days: (Number(time) / 86400).toFixed(2),
          });
          return time;
        } catch (error) {
          logger.error('Error getting time until next halving', { error });
          throw error;
        }
      },

      getCurrentHalving: async (): Promise<bigint> => {
        try {
          logger.debug('Getting current halving number...');
          const halving = await contract.getCurrentHalving();
          logger.info('Current halving retrieved', {
            halvingNumber: halving.toString(),
          });
          return halving;
        } catch (error) {
          logger.error('Error getting current halving', { error });
          throw error;
        }
      },

      getEmissionStart: async (): Promise<bigint> => {
        try {
          logger.debug('Getting emission start time...');
          const startTime = await contract.getEmissionStart();
          logger.info('Emission start time retrieved', {
            timestamp: startTime.toString(),
            date: new Date(Number(startTime) * 1000).toISOString(),
          });
          return startTime;
        } catch (error) {
          logger.error('Error getting emission start time', { error });
          throw error;
        }
      },

      isEmissionStarted: async (): Promise<boolean> => {
        try {
          logger.debug('Checking if emission started...');
          const started = await contract.isEmissionStarted();
          logger.info('Emission started status', { started });
          return started;
        } catch (error) {
          logger.error('Error checking emission started status', { error });
          throw error;
        }
      },

      getRemainingRewards: async (): Promise<bigint> => {
        try {
          logger.debug('Getting remaining rewards...');
          const remaining = await contract.getRemainingRewards();
          logger.info('Remaining rewards retrieved', {
            remaining: remaining.toString(),
          });
          return remaining;
        } catch (error) {
          logger.error('Error getting remaining rewards', { error });
          throw error;
        }
      },

      getCurrentYearlyEmission: async (): Promise<bigint> => {
        try {
          logger.debug('Getting current yearly emission...');
          const yearly = await contract.getCurrentYearlyEmission();
          logger.info('Current yearly emission retrieved', {
            yearlyEmission: yearly.toString(),
          });
          return yearly;
        } catch (error) {
          logger.error('Error getting current yearly emission', { error });
          throw error;
        }
      },

      HALVING_PERIOD: async (): Promise<bigint> => {
        try {
          const period = await contract.HALVING_PERIOD();
          return period;
        } catch (error) {
          logger.error('Error getting HALVING_PERIOD constant', { error });
          throw error;
        }
      },

      TOTAL_MINING_REWARDS: async (): Promise<bigint> => {
        try {
          const total = await contract.TOTAL_MINING_REWARDS();
          return total;
        } catch (error) {
          logger.error('Error getting TOTAL_MINING_REWARDS constant', { error });
          throw error;
        }
      },

      INITIAL_YEARLY_EMISSION: async (): Promise<bigint> => {
        try {
          const initial = await contract.INITIAL_YEARLY_EMISSION();
          return initial;
        } catch (error) {
          logger.error('Error getting INITIAL_YEARLY_EMISSION constant', { error });
          throw error;
        }
      },
    };
  }
}
