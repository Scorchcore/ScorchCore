/**
 * CycleContractFactory - Factory para crear instancias de CycleManager
 * 
 * @pattern Factory Method (GoF)
 * @pattern Strategy (abstracción de implementación)
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import type { Signer, Provider } from 'ethers';
import type { 
  ICycleContract, 
  MiningCycle,
  CycleDuration,
  CycleEvents
} from '../interfaces/ICycleContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { CONTRACT_ABIS } from '@/lib/abis';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('CycleContractFactory');

/**
 * Parámetros de configuración para crear el contrato
 */
export interface CycleContractConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: Signer | Provider;
}

/**
 * Factory para CycleManager
 */
export class CycleContractFactory {
  /**
   * Crea una instancia del contrato CycleManager
   * 
   * @param config - Configuración del contrato
   * @returns Implementación de ICycleContract
   */
  createCycleManager(config: CycleContractConfig): ICycleContract {
    log.info('Creating CycleManager contract', {
      address: config.address,
      chainId: config.chainId,
    });

    const contract = new ethers.Contract(
      config.address,
      CONTRACT_ABIS.CycleManager,
      config.signerOrProvider
    );

    return this.wrapContract(contract, config);
  }

  /**
   * Envuelve el contrato con la interfaz ICycleContract
   */
  private wrapContract(
    contract: ethers.Contract,
    config: CycleContractConfig
  ): ICycleContract {
    return {
      address: config.address as Address,
      chainId: config.chainId,

      async getStatus() {
        return {
          address: config.address as Address,
          isConnected: true,
          chainId: config.chainId,
        };
      },

      async isDeployed(): Promise<boolean> {
        try {
          const totalCycles = await contract.getTotalCycles();
          return true; // Si podemos llamar funciones, está desplegado
        } catch {
          return false;
        }
      },

      async startCycle(
        minerIds: bigint[],
        duration: CycleDuration
      ): Promise<TransactionResult> {
        try {
          log.info('Starting cycle', { minerIds, duration });

          const tx = await contract.startCycle(minerIds, duration);
          const receipt = await tx.wait();

          // Extraer cycleId del evento CycleStarted
          const event = receipt.logs
            .map((log: any) => {
              try {
                return contract.interface.parseLog(log);
              } catch {
                return null;
              }
            })
            .find((e: any) => e?.name === 'CycleStarted');

          const cycleId = event?.args?.cycleId || 0n;

          log.info('Cycle started successfully', { cycleId, hash: receipt.hash });

          return {
            success: true,
            hash: receipt.hash,
          };
        } catch (error) {
          log.error('Failed to start cycle', error);
          throw error;
        }
      },

      async endCycle(cycleId: bigint): Promise<TransactionResult> {
        try {
          log.info('Ending cycle', { cycleId });

          const tx = await contract.endCycle(cycleId);
          const receipt = await tx.wait();

          log.info('Cycle ended successfully', { cycleId, hash: receipt.hash });

          return {
            success: true,
            hash: receipt.hash,
          };
        } catch (error) {
          log.error('Failed to end cycle', error);
          throw error;
        }
      },

      async getCycle(cycleId: bigint): Promise<MiningCycle> {
        try {
          const result = await contract.getCycle(cycleId);

          return {
            user: result.user as Address,
            minerIds: result.minerIds.map((id: any) => BigInt(id.toString())),
            duration: Number(result.duration) as CycleDuration,
            startTime: BigInt(result.startTime.toString()),
            endTime: BigInt(result.endTime.toString()),
            bonusPercentage: Number(result.bonusPercentage),
            isActive: result.isActive,
            claimed: result.claimed,
          };
        } catch (error) {
          log.error('Failed to get cycle', error, { cycleId });
          throw error;
        }
      },

      async getUserActiveCycles(user: Address): Promise<bigint[]> {
        try {
          const result = await contract.getUserActiveCycles(user);
          return result.map((id: any) => BigInt(id.toString()));
        } catch (error) {
          log.error('Failed to get user active cycles', error, { user });
          throw error;
        }
      },

      async getCycleBonus(duration: CycleDuration): Promise<number> {
        try {
          const result = await contract.getCycleBonus(duration);
          return Number(result);
        } catch (error) {
          log.error('Failed to get cycle bonus', error, { duration });
          throw error;
        }
      },

      async getCycleDurationSeconds(duration: CycleDuration): Promise<bigint> {
        try {
          const result = await contract.getCycleDurationSeconds(duration);
          return BigInt(result.toString());
        } catch (error) {
          log.error('Failed to get cycle duration', error, { duration });
          throw error;
        }
      },

      async isCycleFinished(cycleId: bigint): Promise<boolean> {
        try {
          return await contract.isCycleFinished(cycleId);
        } catch (error) {
          log.error('Failed to check if cycle finished', error, { cycleId });
          throw error;
        }
      },

      async isMinerLocked(minerId: bigint): Promise<boolean> {
        try {
          return await contract.isMinerLocked(minerId);
        } catch (error) {
          log.error('Failed to check if miner locked', error, { minerId });
          throw error;
        }
      },

      async markCycleClaimed(cycleId: bigint): Promise<TransactionResult> {
        try {
          log.info('Marking cycle as claimed', { cycleId });

          const tx = await contract.markCycleClaimed(cycleId);
          const receipt = await tx.wait();

          return {
            success: true,
            hash: receipt.hash,
          };
        } catch (error) {
          log.error('Failed to mark cycle claimed', error);
          throw error;
        }
      },

      async getTotalCycles(): Promise<bigint> {
        try {
          const result = await contract.getTotalCycles();
          return BigInt(result.toString());
        } catch (error) {
          log.error('Failed to get total cycles', error);
          throw error;
        }
      },

      on(eventName: string, callback: (event: any) => void): () => void {
        contract.on(eventName, callback);
        return () => contract.off(eventName, callback);
      },
    };
  }

  /**
   * Parsea eventos del contrato
   */
  private parseEvent<K extends keyof CycleEvents>(
    eventName: K,
    args: any[]
  ): CycleEvents[K] | null {
    try {
      switch (eventName) {
        case 'CycleStarted':
          return {
            user: args[0] as Address,
            cycleId: BigInt(args[1].toString()),
            duration: Number(args[2]),
            minerCount: BigInt(args[3].toString()),
            endTime: BigInt(args[4].toString()),
          } as CycleEvents[K];

        case 'CycleEnded':
          return {
            user: args[0] as Address,
            cycleId: BigInt(args[1].toString()),
          } as CycleEvents[K];

        case 'CycleClaimed':
          return {
            user: args[0] as Address,
            cycleId: BigInt(args[1].toString()),
            rewards: BigInt(args[2].toString()),
          } as CycleEvents[K];

        default:
          return null;
      }
    } catch (error) {
      log.error('Failed to parse event', error, { eventName });
      return null;
    }
  }
}
