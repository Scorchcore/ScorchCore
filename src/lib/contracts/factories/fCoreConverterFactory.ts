/**
 * fCoreConverterFactory - Factory para crear instancias de fCoreConverter
 * @pattern Factory Method (GoF)
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import type { Signer, Provider } from 'ethers';
import type { IFCoreConverter } from '../interfaces/ITokenContract';
import type { TransactionResult, ContractStatus } from '../interfaces/IBlockchainContract';
import { CONTRACT_ABIS } from '@/lib/abis';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('fCoreConverterFactory');

export interface fCoreConverterConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: Signer | Provider;
}

/**
 * Factory para fCoreConverter
 */
export class fCoreConverterFactory {
  /**
   * Crea una instancia del contrato fCoreConverter
   */
  createfCoreConverter(config: fCoreConverterConfig): IFCoreConverter {
    log.info('Creating fCoreConverter contract', {
      address: config.address,
      chainId: config.chainId,
    });

    const contract = new ethers.Contract(
      config.address,
      CONTRACT_ABIS.fCoreConverter,
      config.signerOrProvider
    );

    return {
      address: config.address as Address,
      chainId: config.chainId,

      async getStatus(): Promise<ContractStatus> {
        return {
          address: config.address as Address,
          isConnected: !!config.signerOrProvider,
          chainId: config.chainId,
        };
      },

      async isDeployed(): Promise<boolean> {
        try {
          await contract.getConversionRate();
          return true;
        } catch {
          return false;
        }
      },

      on(eventName: string, callback: (event: any) => void): () => void {
        contract.on(eventName, callback);
        return () => contract.off(eventName, callback);
      },

      async convert(amount: bigint): Promise<TransactionResult> {
        try {
          log.info('Converting fCORE to CORE', { amount: amount.toString() });
          const tx = await contract.convert(amount);
          const receipt = await tx.wait();
          log.info('fCORE converted successfully', { hash: tx.hash });
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error converting fCORE', { amount: amount.toString(), error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      async convertAll(): Promise<TransactionResult> {
        try {
          log.info('Converting all fCORE to CORE');
          const tx = await contract.convertAll();
          const receipt = await tx.wait();
          log.info('All fCORE converted successfully', { hash: tx.hash });
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error converting all fCORE', { error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      async canConvert(user: Address): Promise<boolean> {
        try {
          return await contract.canConvert(user);
        } catch (error) {
          log.error('Error checking if user can convert', { user, error });
          return false;
        }
      },

      async getConversionRate(): Promise<bigint> {
        const rate = await contract.getConversionRate();
        return BigInt(rate.toString());
      },

      async getConvertibleAmount(user: Address): Promise<bigint> {
        try {
          const amount = await contract.getConvertibleAmount(user);
          return BigInt(amount.toString());
        } catch (error) {
          log.error('Error getting convertible amount', { user, error });
          return 0n;
        }
      },

      async fCoreToken(): Promise<Address> {
        return (await contract.fCoreToken()) as Address;
      },

      async coreToken(): Promise<Address> {
        return (await contract.coreToken()) as Address;
      },

      async pohOracle(): Promise<Address> {
        return (await contract.pohOracle()) as Address;
      },

      async paused(): Promise<boolean> {
        try {
          return await contract.paused();
        } catch (error) {
          log.error('Error checking pause status', { error });
          return false;
        }
      },
    };
  }
}
