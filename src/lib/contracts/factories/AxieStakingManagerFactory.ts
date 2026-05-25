/**
 * AxieStakingManagerFactory - Factory para crear instancias del contrato AxieStakingManager
 */

import { ethers } from 'ethers';
import type { Address } from 'viem';
import { AXIESTAKINGMANAGER_ABI } from '@/lib/abis/mining.abis';
import type { IAxieStakingManager, AxieStakeInfo } from '../interfaces/IEconomyContract';
import type { TransactionResult } from '../interfaces/IBlockchainContract';

export interface AxieStakingManagerConfig {
  address: Address;
  chainId: number;
  signerOrProvider?: ethers.Signer | ethers.Provider;
}

/**
 * Factory para crear instancias del contrato AxieStakingManager
 */
export class AxieStakingManagerFactory {
  /**
   * Crea una instancia del contrato AxieStakingManager
   */
  createAxieStakingManager(config: AxieStakingManagerConfig): IAxieStakingManager {
    const { address, signerOrProvider } = config;

    const contract = new ethers.Contract(
      address,
      AXIESTAKINGMANAGER_ABI,
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

      on: (eventName: string, callback: (event: unknown) => void) => {
        contract.on(eventName, callback);
        return () => contract.off(eventName, callback);
      },

      stakeAxie: async (axieId: bigint): Promise<TransactionResult> => {
        const tx = await contract.stakeAxie(axieId);
        const receipt = await tx.wait();
        return {
          hash: receipt.transactionHash,
          success: true,
          receipt,
        };
      },

      unstakeAxie: async (axieId: bigint): Promise<TransactionResult> => {
        const tx = await contract.unstakeAxie(axieId);
        const receipt = await tx.wait();
        return {
          hash: receipt.transactionHash,
          success: true,
          receipt,
        };
      },

      getStakeInfo: async (axieId: bigint): Promise<AxieStakeInfo> => {
        const stake = await contract.getStake(axieId);
        return {
          axieId: BigInt(stake.axieId.toString()),
          owner: stake.owner as Address,
          stakedAt: BigInt(stake.stakedAt.toString()),
          unstakedAt: 0n,
          rewardsClaimed: 0n,
          isStaked: stake.isActive || false,
        };
      },

      getStakedAxies: async (owner: Address): Promise<bigint[]> => {
        const axies = await contract.getStakedAxies(owner);
        return axies.map((id: any) => BigInt(id.toString()));
      },

      claimRewards: async (axieId: bigint): Promise<TransactionResult & { rewards: bigint }> => {
        const tx = await contract.claimRewards(axieId);
        const receipt = await tx.wait();
        return {
          hash: receipt.transactionHash,
          success: true,
          receipt,
          rewards: 0n,
        };
      },

      calculatePendingRewards: async (axieId: bigint): Promise<bigint> => {
        const rewards = await contract.calculatePendingRewards(axieId);
        return BigInt(rewards.toString());
      },

      getStakingConfig: async (): Promise<{ minStakeDuration: bigint; rewardMultiplier: bigint; enabled: boolean }> => {
        return {
          minStakeDuration: 0n,
          rewardMultiplier: 100n,
          enabled: true,
        };
      },
    };
  }
}
