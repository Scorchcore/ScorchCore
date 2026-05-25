/**
 * PohOracleFactory - Factory para crear instancias de ProofOfHumanityOracle
 * @pattern Factory Method (GoF)
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import type { Signer, Provider } from 'ethers';
import type { IPohContract, VerificationData } from '../interfaces/IPohContract';
import type { TransactionResult, ContractStatus } from '../interfaces/IBlockchainContract';
import { CONTRACT_ABIS } from '@/lib/abis';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const log = createServiceLogger('PohOracleFactory');

export interface PohOracleConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: Signer | Provider;
}

/**
 * Factory para ProofOfHumanityOracle
 */
export class PohOracleFactory {
  /**
   * Crea una instancia del contrato ProofOfHumanityOracle
   */
  createPohOracle(config: PohOracleConfig): IPohContract {
    log.info('Creating ProofOfHumanityOracle contract', {
      address: config.address,
      chainId: config.chainId,
    });

    const contract = new ethers.Contract(
      config.address,
      CONTRACT_ABIS.ProofOfHumanityOracle,
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
          await contract.verificationDuration();
          return true;
        } catch {
          return false;
        }
      },

      on(eventName: string, callback: (event: any) => void): () => void {
        contract.on(eventName, callback);
        return () => contract.off(eventName, callback);
      },

      async isHuman(wallet: Address): Promise<boolean> {
        try {
          return await contract.isHuman(wallet);
        } catch (error) {
          log.error('Error checking verification status', { wallet, error });
          return false;
        }
      },

      async getVerificationLevel(wallet: Address): Promise<number> {
        try {
          return await contract.getVerificationLevel(wallet);
        } catch (error) {
          log.error('Error getting verification level', { wallet, error });
          return 0;
        }
      },

      async getVerificationTime(wallet: Address): Promise<bigint> {
        try {
          const timestamp = await contract.getVerificationTime(wallet);
          return BigInt(timestamp.toString());
        } catch (error) {
          log.error('Error getting verification time', { wallet, error });
          return 0n;
        }
      },

      async getVerificationData(wallet: Address): Promise<VerificationData> {
        try {
          const data = await contract.getVerificationData(wallet);
          return {
            verified: data.verified,
            level: Number(data.level),
            timestamp: BigInt(data.timestamp.toString()),
            expiresAt: BigInt(data.expiresAt.toString()),
          };
        } catch (error) {
          log.error('Error getting verification data', { wallet, error });
          return {
            verified: false,
            level: 0,
            timestamp: 0n,
            expiresAt: 0n,
          };
        }
      },

      async verifyHuman(wallet: Address, level: number): Promise<TransactionResult> {
        try {
          log.info('Verifying humanity', { wallet, level });
          const tx = await contract.verifyHuman(wallet, level);
          const receipt = await tx.wait();
          log.info('Humanity verified', { wallet, level, hash: tx.hash });
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error verifying humanity', { wallet, level, error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      async revokeVerification(wallet: Address, reason: string): Promise<TransactionResult> {
        try {
          log.info('Revoking verification', { wallet, reason });
          const tx = await contract.revokeVerification(wallet, reason);
          const receipt = await tx.wait();
          log.info('Verification revoked', { wallet, reason, hash: tx.hash });
          return {
            hash: tx.hash,
            success: receipt.status === 1,
            receipt,
          };
        } catch (error) {
          log.error('Error revoking verification', { wallet, reason, error });
          return {
            hash: '',
            success: false,
            error: error as Error,
          };
        }
      },

      async verificationDuration(): Promise<bigint> {
        try {
          const duration = await contract.verificationDuration();
          return BigInt(duration.toString());
        } catch (error) {
          log.error('Error getting verification duration', { error });
          throw error;
        }
      },

      async totalVerified(): Promise<bigint> {
        try {
          const total = await contract.totalVerified();
          return BigInt(total.toString());
        } catch (error) {
          log.error('Error getting total verified', { error });
          return 0n;
        }
      },

      async VERIFIER_ROLE(): Promise<string> {
        return await contract.VERIFIER_ROLE();
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
