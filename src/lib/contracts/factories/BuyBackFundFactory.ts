/**
 * BuyBackFundFactory - Factory para crear instancias del contrato BuyBackFund
 * 
 * @pattern Factory Pattern (GoF)
 * @principle SRP - Responsabilidad única: creación de contratos BuyBackFund
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { BUYBACKFUND_ABI } from '@/lib/abis/economy.abis';
import type { IBuyBackFund } from '../interfaces/IEconomyContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('BuyBackFundFactory');

export interface BuyBackFundConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: ethers.Signer | ethers.Provider;
}

/**
 * Factory para crear instancias del contrato BuyBackFund
 */
export class BuyBackFundFactory {
  /**
   * Crea una instancia del contrato BuyBackFund
   */
  createBuyBackFund(config: BuyBackFundConfig): IBuyBackFund {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      BUYBACKFUND_ABI,
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

      executeBuyback: async (maxRonToSpend: bigint): Promise<TransactionResult> => {
        logger.info('Executing buyback', {
          maxRonToSpend: maxRonToSpend.toString(),
        });

        try {
          const tx = await contract.executeBuyback(maxRonToSpend);
          const receipt = await tx.wait();

          logger.info('Buyback executed successfully', {
            hash: receipt.transactionHash,
            ronSpent: maxRonToSpend.toString(),
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error executing buyback', { error });
          throw error;
        }
      },

      deposit: async (amount: bigint): Promise<TransactionResult> => {
        logger.info('Depositing to buyback fund', {
          amount: amount.toString(),
        });

        try {
          const tx = await contract.deposit({ value: amount });
          const receipt = await tx.wait();

          logger.info('Deposit successful', {
            hash: receipt.transactionHash,
            amount: amount.toString(),
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error depositing', { error });
          throw error;
        }
      },

      getBalance: async (): Promise<bigint> => {
        try {
          const balance = await contract.getBalance();
          return BigInt(balance.toString());
        } catch (error) {
          logger.error('Error getting balance', { error });
          return 0n;
        }
      },

      totalBuybacks: async (): Promise<bigint> => {
        try {
          const total = await contract.totalBuybacks();
          return BigInt(total.toString());
        } catch (error) {
          logger.error('Error getting total buybacks', { error });
          return 0n;
        }
      },

      totalBuybackAmount: async (): Promise<bigint> => {
        try {
          const total = await contract.totalBuybackAmount();
          return BigInt(total.toString());
        } catch (error) {
          logger.error('Error getting total buyback amount', { error });
          return 0n;
        }
      },

      priceThreshold: async (): Promise<bigint> => {
        try {
          const threshold = await contract.priceThreshold();
          return BigInt(threshold.toString());
        } catch (error) {
          logger.error('Error getting price threshold', { error });
          return 0n;
        }
      },

      minBuybackAmount: async (): Promise<bigint> => {
        try {
          const min = await contract.minBuybackAmount();
          return BigInt(min.toString());
        } catch (error) {
          logger.error('Error getting min buyback amount', { error });
          return 0n;
        }
      },

      autoBurnEnabled: async (): Promise<boolean> => {
        try {
          return await contract.autoBurnEnabled();
        } catch (error) {
          logger.error('Error getting auto burn status', { error });
          return false;
        }
      },

      shouldExecuteBuyback: async (): Promise<boolean> => {
        try {
          return await contract.shouldExecuteBuyback();
        } catch (error) {
          logger.error('Error checking should execute buyback', { error });
          return false;
        }
      },

      setPriceThreshold: async (threshold: bigint): Promise<TransactionResult> => {
        logger.info('Setting price threshold', {
          threshold: threshold.toString(),
        });

        try {
          const tx = await contract.setPriceThreshold(threshold);
          const receipt = await tx.wait();

          logger.info('Price threshold updated', {
            hash: receipt.transactionHash,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error setting price threshold', { error });
          throw error;
        }
      },

      setMinBuybackAmount: async (amount: bigint): Promise<TransactionResult> => {
        logger.info('Setting min buyback amount', {
          amount: amount.toString(),
        });

        try {
          const tx = await contract.setMinBuybackAmount(amount);
          const receipt = await tx.wait();

          logger.info('Min buyback amount updated', {
            hash: receipt.transactionHash,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error setting min buyback amount', { error });
          throw error;
        }
      },

      setAutoBurn: async (enabled: boolean): Promise<TransactionResult> => {
        logger.info('Setting auto burn', { enabled });

        try {
          const tx = await contract.setAutoBurn(enabled);
          const receipt = await tx.wait();

          logger.info('Auto burn updated', {
            hash: receipt.transactionHash,
            enabled,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error setting auto burn', { error });
          throw error;
        }
      },
    };
  }
}
