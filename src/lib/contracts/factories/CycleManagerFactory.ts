/**
 * CycleManagerFactory - Factory para crear instancias del contrato CycleManager
 * 
 * @pattern Factory Pattern (GoF)
 * @principle SRP - Responsabilidad única: creación de contratos CycleManager
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { CYCLEMANAGER_ABI } from '@/lib/abis/mining.abis';
import type { ICycleContract, MiningCycle, CycleDuration } from '../interfaces/ICycleContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('CycleManagerFactory');

export interface CycleManagerConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: ethers.Signer | ethers.Provider;
}

/**
 * Factory para crear instancias del contrato CycleManager
 */
export class CycleManagerFactory {
  /**
   * Crea una instancia del contrato CycleManager
   */
  createCycleManager(config: CycleManagerConfig): ICycleContract {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      CYCLEMANAGER_ABI,
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

      startCycle: async (minerIds: bigint[], duration: CycleDuration): Promise<TransactionResult> => {
        logger.info('Iniciando ciclo', { minerIds: minerIds.map(id => id.toString()), duration });
        
        try {
          const tx = await contract.startCycle(minerIds, duration);
          const receipt = await tx.wait();
          
          logger.info('Ciclo iniciado exitosamente', { 
            hash: receipt.transactionHash,
            minerCount: minerIds.length 
          });
          
          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error iniciando ciclo', error);
          throw error;
        }
      },

      endCycle: async (cycleId: bigint): Promise<TransactionResult> => {
        logger.info('Finalizando ciclo', { cycleId: cycleId.toString() });
        
        try {
          const tx = await contract.endCycle(cycleId);
          const receipt = await tx.wait();
          
          logger.info('Ciclo finalizado exitosamente', { 
            hash: receipt.transactionHash,
            cycleId: cycleId.toString() 
          });
          
          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error finalizando ciclo', error);
          throw error;
        }
      },

      getCycle: async (cycleId: bigint): Promise<MiningCycle> => {
        const cycle = await contract.getCycle(cycleId);
        return {
          user: cycle.user as Address,
          minerIds: cycle.minerIds.map((id: any) => BigInt(id.toString())),
          duration: Number(cycle.duration) as CycleDuration,
          startTime: BigInt(cycle.startTime.toString()),
          endTime: BigInt(cycle.endTime.toString()),
          bonusPercentage: Number(cycle.bonusPercentage),
          isActive: cycle.isActive,
          claimed: cycle.claimed,
        };
      },

      getUserActiveCycles: async (user: Address): Promise<bigint[]> => {
        const cycles = await contract.getUserActiveCycles(user);
        return cycles.map((id: any) => BigInt(id.toString()));
      },

      getCycleBonus: async (duration: CycleDuration): Promise<number> => {
        const bonus = await contract.getCycleBonus(duration);
        return Number(bonus);
      },

      getCycleDurationSeconds: async (duration: CycleDuration): Promise<bigint> => {
        const seconds = await contract.getCycleDurationSeconds(duration);
        return BigInt(seconds.toString());
      },

      isCycleFinished: async (cycleId: bigint): Promise<boolean> => {
        return await contract.isCycleFinished(cycleId);
      },

      isMinerLocked: async (minerId: bigint): Promise<boolean> => {
        return await contract.isMinerLocked(minerId);
      },

      markCycleClaimed: async (cycleId: bigint): Promise<TransactionResult> => {
        const tx = await contract.markCycleClaimed(cycleId);
        const receipt = await tx.wait();
        return {
          hash: receipt.transactionHash,
          success: true,
          receipt,
        };
      },

      getTotalCycles: async (): Promise<bigint> => {
        const total = await contract.getTotalCycles();
        return BigInt(total.toString());
      },
    };
  }
}
