/**
 * TrustScoreManagerFactory - Factory para crear instancias del contrato TrustScoreManager
 * 
 * @pattern Factory Pattern (GoF)
 * @principle SRP - Responsabilidad única: creación de contratos TrustScoreManager
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { TRUSTSCOREMANAGER_ABI } from '@/lib/abis/antibot.abis';
import type { ITrustScoreContract, TrustScoreData } from '../interfaces/ITrustScoreContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('TrustScoreManagerFactory');

export interface TrustScoreManagerConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: ethers.Signer | ethers.Provider;
}

/**
 * Factory para crear instancias del contrato TrustScoreManager
 */
export class TrustScoreManagerFactory {
  /**
   * Crea una instancia del contrato TrustScoreManager
   */
  createTrustScoreManager(config: TrustScoreManagerConfig): ITrustScoreContract {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      TRUSTSCOREMANAGER_ABI,
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

      getScore: async (user: Address): Promise<bigint> => {
        try {
          const score = await contract.getScore(user);
          return BigInt(score.toString());
        } catch (error) {
          logger.error('Error getting score', { user, error });
          return 0n;
        }
      },

      hasMinimumScore: async (user: Address, minScore: bigint): Promise<boolean> => {
        try {
          return await contract.hasMinimumScore(user, minScore);
        } catch (error) {
          logger.error('Error checking minimum score', { user, minScore: minScore.toString(), error });
          return false;
        }
      },

      getAccessLevel: async (user: Address): Promise<number> => {
        try {
          const level = await contract.getAccessLevel(user);
          return Number(level);
        } catch (error) {
          logger.error('Error getting access level', { user, error });
          return 0;
        }
      },

      getTrustScore: async (user: Address): Promise<TrustScoreData> => {
        try {
          const data = await contract.getTrustScore(user);
          return {
            score: BigInt(data.score.toString()),
            lastUpdate: BigInt(data.lastUpdate.toString()),
            accountAge: BigInt(data.accountAge.toString()),
            totalActivity: BigInt(data.totalActivity.toString()),
            flagged: data.flagged,
          };
        } catch (error) {
          logger.error('Error getting trust score data', { user, error });
          return {
            score: 0n,
            lastUpdate: 0n,
            accountAge: 0n,
            totalActivity: 0n,
            flagged: false,
          };
        }
      },

      isScoreStale: async (user: Address): Promise<boolean> => {
        try {
          return await contract.isScoreStale(user);
        } catch (error) {
          logger.error('Error checking if score is stale', { user, error });
          return true;
        }
      },

      updateScore: async (
        user: Address,
        score: bigint,
        accountAge: bigint,
        totalActivity: bigint
      ): Promise<TransactionResult> => {
        logger.info('Updating trust score', {
          user,
          score: score.toString(),
          accountAge: accountAge.toString(),
          totalActivity: totalActivity.toString(),
        });

        try {
          const tx = await contract.updateScore(user, score, accountAge, totalActivity);
          const receipt = await tx.wait();

          logger.info('Trust score updated successfully', {
            hash: receipt.transactionHash,
            user,
            score: score.toString(),
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error updating trust score', { user, error });
          throw error;
        }
      },

      flagUser: async (user: Address, reason: string): Promise<TransactionResult> => {
        logger.info('Flagging user', { user, reason });

        try {
          const tx = await contract.flagUser(user, reason);
          const receipt = await tx.wait();

          logger.info('User flagged successfully', {
            hash: receipt.transactionHash,
            user,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error flagging user', { user, error });
          throw error;
        }
      },

      unflagUser: async (user: Address): Promise<TransactionResult> => {
        logger.info('Unflagging user', { user });

        try {
          const tx = await contract.unflagUser(user);
          const receipt = await tx.wait();

          logger.info('User unflagged successfully', {
            hash: receipt.transactionHash,
            user,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error unflagging user', { user, error });
          throw error;
        }
      },

      scoreDecayRate: async (): Promise<bigint> => {
        try {
          const rate = await contract.scoreDecayRate();
          return BigInt(rate.toString());
        } catch (error) {
          logger.error('Error getting decay rate', { error });
          return 1n; // Default decay rate
        }
      },

      maxScoreAge: async (): Promise<bigint> => {
        try {
          const age = await contract.maxScoreAge();
          return BigInt(age.toString());
        } catch (error) {
          logger.error('Error getting max score age', { error });
          return BigInt(30 * 24 * 60 * 60); // 30 días en segundos
        }
      },

      MAX_SCORE: async (): Promise<bigint> => {
        try {
          const maxScore = await contract.MAX_SCORE();
          return BigInt(maxScore.toString());
        } catch (error) {
          logger.error('Error getting MAX_SCORE', { error });
          return 1000n;
        }
      },
    };
  }
}
