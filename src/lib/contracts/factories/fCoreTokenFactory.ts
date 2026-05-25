/**
 * fCoreTokenFactory - Factory para crear instancias de fCoreToken
 * @pattern Factory Method (GoF)
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import type { Signer, Provider } from 'ethers';
import type { IFCoreToken } from '../interfaces/ITokenContract';
import type { TransactionResult, ContractStatus } from '../interfaces/IBlockchainContract';
import { CONTRACT_ABIS } from '@/lib/abis';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('fCoreTokenFactory');

export interface fCoreTokenConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: Signer | Provider;
}

/**
 * Factory para fCoreToken
 */
export class fCoreTokenFactory {
  /**
   * Crea una instancia del contrato fCoreToken
   */
  createfCoreToken(config: fCoreTokenConfig): IFCoreToken {
    log.info('Creating fCoreToken contract', {
      address: config.address,
      chainId: config.chainId,
    });

    const contract = new ethers.Contract(
      config.address,
      CONTRACT_ABIS.fCoreToken,
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
          await contract.totalSupply();
          return true;
        } catch {
          return false;
        }
      },

      on(eventName: string, callback: (event: any) => void): () => void {
        contract.on(eventName, callback);
        return () => contract.off(eventName, callback);
      },

      // ITokenContract methods
      async name(): Promise<string> {
        return await contract.name();
      },

      async symbol(): Promise<string> {
        return await contract.symbol();
      },

      async decimals(): Promise<number> {
        return await contract.decimals();
      },

      async totalSupply(): Promise<bigint> {
        const supply = await contract.totalSupply();
        return BigInt(supply.toString());
      },

      async balanceOf(account: Address): Promise<bigint> {
        const balance = await contract.balanceOf(account);
        return BigInt(balance.toString());
      },

      async transfer(to: Address, amount: bigint): Promise<TransactionResult> {
        try {
          const tx = await contract.transfer(to, amount);
          const receipt = await tx.wait();
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error transferring fCORE', { to, amount: amount.toString(), error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      async allowance(owner: Address, spender: Address): Promise<bigint> {
        const allowance = await contract.allowance(owner, spender);
        return BigInt(allowance.toString());
      },

      async approve(spender: Address, amount: bigint): Promise<TransactionResult> {
        try {
          const tx = await contract.approve(spender, amount);
          const receipt = await tx.wait();
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error approving fCORE', { spender, amount: amount.toString(), error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      async transferFrom(from: Address, to: Address, amount: bigint): Promise<TransactionResult> {
        try {
          const tx = await contract.transferFrom(from, to, amount);
          const receipt = await tx.wait();
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error transferFrom fCORE', { from, to, amount: amount.toString(), error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      // IMintableToken methods
      async mint(to: Address, amount: bigint): Promise<TransactionResult> {
        try {
          const tx = await contract.mint(to, amount);
          const receipt = await tx.wait();
          log.info('fCORE minted', { to, amount: amount.toString(), hash: tx.hash });
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error minting fCORE', { to, amount: amount.toString(), error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      async isMinter(account: Address): Promise<boolean> {
        try {
          const MINTER_ROLE = await contract.MINTER_ROLE();
          return await contract.hasRole(MINTER_ROLE, account);
        } catch (error) {
          log.error('Error checking minter role', { account, error });
          return false;
        }
      },

      // IBurnableToken methods
      async burn(amount: bigint): Promise<TransactionResult> {
        try {
          const tx = await contract.burn(amount);
          const receipt = await tx.wait();
          log.info('fCORE burned', { amount: amount.toString(), hash: tx.hash });
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error burning fCORE', { amount: amount.toString(), error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      async burnFrom(account: Address, amount: bigint): Promise<TransactionResult> {
        try {
          const tx = await contract.burnFrom(account, amount);
          const receipt = await tx.wait();
          log.info('fCORE burned from account', { account, amount: amount.toString(), hash: tx.hash });
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error burning fCORE from account', { account, amount: amount.toString(), error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      // IFCoreToken specific methods
      async convertToCore(amount: bigint): Promise<TransactionResult & { coreReceived: bigint }> {
        // Note: fCoreToken no tiene convertToCore, eso lo hace fCoreConverter
        // Este método debería lanzar error o no estar en la interfaz
        throw new Error('convertToCore should be called on fCoreConverter, not fCoreToken');
      },

      async getConversionInfo(): Promise<any> {
        // Similar - esto es del converter
        throw new Error('getConversionInfo should be called on fCoreConverter, not fCoreToken');
      },

      async previewConversion(fCoreAmount: bigint): Promise<bigint> {
        // Similar - esto es del converter
        throw new Error('previewConversion should be called on fCoreConverter, not fCoreToken');
      },
    };
  }
}
