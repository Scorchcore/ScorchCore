/**
 * RoyaltyManagerFactory - Factory para crear instancias del contrato RoyaltyManager
 * 
 * @pattern Factory Pattern (GoF)
 * @principle SRP - Responsabilidad única: creación de contratos RoyaltyManager
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { ROYALTYMANAGER_ABI } from '@/lib/abis/economy.abis';
import type { IRoyaltyContract, RoyaltyInfo } from '../interfaces/IRoyaltyContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('RoyaltyManagerFactory');

export interface RoyaltyManagerConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: ethers.Signer | ethers.Provider;
}

/**
 * Factory para crear instancias del contrato RoyaltyManager
 */
export class RoyaltyManagerFactory {
  /**
   * Crea una instancia del contrato RoyaltyManager
   */
  createRoyaltyManager(config: RoyaltyManagerConfig): IRoyaltyContract {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      ROYALTYMANAGER_ABI,
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

      getRoyaltyInfoFor: async (collection: Address, salePrice: bigint): Promise<RoyaltyInfo> => {
        try {
          const [receiver, royaltyAmount] = await contract.getRoyaltyInfoFor(collection, salePrice);
          
          // Calcular royaltyFraction a partir del monto si es necesario
          const royaltyFraction = salePrice > 0n 
            ? Number((royaltyAmount * 10000n) / salePrice)
            : 0;

          return {
            receiver: receiver as Address,
            royaltyAmount: BigInt(royaltyAmount.toString()),
            royaltyFraction,
          };
        } catch (error) {
          logger.error('Error getting royalty info', { collection, salePrice: salePrice.toString(), error });
          return {
            receiver: '0x0000000000000000000000000000000000000000' as Address,
            royaltyAmount: 0n,
            royaltyFraction: 0,
          };
        }
      },

      getCollectionRoyalty: async (collection: Address) => {
        try {
          const [receiver, royaltyFraction] = await contract.getCollectionRoyalty(collection);
          return {
            receiver: receiver as Address,
            royaltyFraction: BigInt(royaltyFraction.toString()),
          };
        } catch (error) {
          logger.error('Error getting collection royalty', { collection, error });
          return {
            receiver: '0x0000000000000000000000000000000000000000' as Address,
            royaltyFraction: 0n,
          };
        }
      },

      setDefaultRoyalty: async (receiver: Address, royaltyFraction: bigint): Promise<TransactionResult> => {
        logger.info('Setting default royalty', {
          receiver,
          royaltyFraction: royaltyFraction.toString(),
        });

        try {
          const tx = await contract.setDefaultRoyalty(receiver, royaltyFraction);
          const receipt = await tx.wait();

          logger.info('Default royalty set successfully', {
            hash: receipt.transactionHash,
            receiver,
            royaltyFraction: royaltyFraction.toString(),
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error setting default royalty', { receiver, error });
          throw error;
        }
      },

      setCollectionRoyalty: async (
        collection: Address,
        receiver: Address,
        royaltyFraction: bigint
      ): Promise<TransactionResult> => {
        logger.info('Setting collection royalty', {
          collection,
          receiver,
          royaltyFraction: royaltyFraction.toString(),
        });

        try {
          const tx = await contract.setCollectionRoyalty(collection, receiver, royaltyFraction);
          const receipt = await tx.wait();

          logger.info('Collection royalty set successfully', {
            hash: receipt.transactionHash,
            collection,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error setting collection royalty', { collection, error });
          throw error;
        }
      },

      removeCollectionRoyalty: async (collection: Address): Promise<TransactionResult> => {
        logger.info('Removing collection royalty', { collection });

        try {
          const tx = await contract.removeCollectionRoyalty(collection);
          const receipt = await tx.wait();

          logger.info('Collection royalty removed successfully', {
            hash: receipt.transactionHash,
            collection,
          });

          return {
            hash: receipt.transactionHash,
            success: true,
            receipt,
          };
        } catch (error) {
          logger.error('Error removing collection royalty', { collection, error });
          throw error;
        }
      },

      defaultReceiver: async (): Promise<Address> => {
        try {
          const receiver = await contract.defaultReceiver();
          return receiver as Address;
        } catch (error) {
          logger.error('Error getting default receiver', { error });
          return '0x0000000000000000000000000000000000000000' as Address;
        }
      },

      defaultRoyaltyFraction: async (): Promise<bigint> => {
        try {
          const fraction = await contract.defaultRoyaltyFraction();
          return BigInt(fraction.toString());
        } catch (error) {
          logger.error('Error getting default royalty fraction', { error });
          return 500n; // Default 5%
        }
      },

      MAX_ROYALTY: async (): Promise<bigint> => {
        try {
          const max = await contract.MAX_ROYALTY();
          return BigInt(max.toString());
        } catch (error) {
          logger.error('Error getting MAX_ROYALTY', { error });
          return 1000n; // 10%
        }
      },

      DEFAULT_ROYALTY: async (): Promise<bigint> => {
        try {
          const defaultRoyalty = await contract.DEFAULT_ROYALTY();
          return BigInt(defaultRoyalty.toString());
        } catch (error) {
          logger.error('Error getting DEFAULT_ROYALTY', { error });
          return 500n; // 5%
        }
      },
    };
  }
}
