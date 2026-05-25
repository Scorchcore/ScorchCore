/**
 * Hook para interactuar con GeodeStakingManager
 * Staking de Geodas NFT con poder específico por categoría
 */

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useContractManager } from "../contracts/useContractManager";
import type { IGeodeStakingManager } from "@/lib/contracts/interfaces";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import type { Address } from "viem";

const log = createServiceLogger("useGeodeStaking");

export interface GeodeStakeInfo {
  geodeId: bigint;
  owner: Address;
  stakedAt: bigint;
  power: bigint;
  canUnstake: boolean;
}

export function useGeodeStaking() {
  const { address } = useAccount();
  const { contractManager } = useContractManager();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getContract = useCallback((): IGeodeStakingManager | null => {
    try {
      return contractManager?.getGeodeStakingManager();
    } catch (err) {
      log.error("Failed to get GeodeStakingManager contract", err);
      return null;
    }
  }, [contractManager]);

  const getGeodeNFTContract = useCallback(() => {
    try {
      return contractManager?.getGeodeNFT();
    } catch (err) {
      log.error("Failed to get GeodeNFT contract", err);
      return null;
    }
  }, [contractManager]);

  /**
   * Stakea una Geoda
   */
  const stake = useCallback(
    async (geodeId: bigint) => {
      if (!address) throw new Error("Wallet not connected");

      const contract = getContract();
      const geodeContract = getGeodeNFTContract();
      if (!contract || !geodeContract)
        throw new Error("Contract not available");

      setIsLoading(true);
      setError(null);

      try {
        log.info("Staking geode", {
          geodeId: geodeId.toString(),
          user: address,
        });

        // ✅ Verificar si el contrato de staking ya está aprobado
        const stakingAddress = contract.address;
        const approved = await geodeContract.getApproved(geodeId);
        const isApprovedForAll = await geodeContract.isApprovedForAll(
          address,
          stakingAddress,
        );

        // Si no está aprobado, aprobar primero
        if (
          approved.toLowerCase() !== stakingAddress.toLowerCase() &&
          !isApprovedForAll
        ) {
          log.info("Geode not approved, requesting approval...", {
            geodeId: geodeId.toString(),
          });
          const approveTx = await geodeContract.approve(
            stakingAddress,
            geodeId,
          );
          // Esperar confirmación de la transacción
          const receipt = (await approveTx.wait?.()) || (await approveTx);
          log.info("Geode approved successfully", {
            geodeId: geodeId.toString(),
            receipt,
          });
        }

        // Ahora stakear (usando interfaz tipada)
        log.info("Executing stake transaction...", {
          geodeId: geodeId.toString(),
        });
        const tx = await contract.stakeGeode(geodeId);
        const receipt = (await tx.wait?.()) || (await tx);
        log.info("Geode staked successfully", {
          geodeId: geodeId.toString(),
          receipt,
        });
        return tx;
      } catch (err) {
        log.error("Failed to stake geode", err);
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, getContract, getGeodeNFTContract],
  );

  /**
   * Unstakea una Geoda
   */
  const unstake = useCallback(
    async (geodeId: bigint) => {
      if (!address) throw new Error("Wallet not connected");

      const contract = getContract();
      if (!contract) throw new Error("Contract not available");

      setIsLoading(true);
      setError(null);

      try {
        log.info("Unstaking geode", {
          geodeId: geodeId.toString(),
          user: address,
        });
        const tx = await contract.unstakeGeode(geodeId);
        const receipt = (await tx.wait?.()) || (await tx);
        log.info("Geode unstaked successfully", {
          geodeId: geodeId.toString(),
          receipt,
        });
        return tx;
      } catch (err) {
        log.error("Failed to unstake geode", err);
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, getContract],
  );

  /**
   * Obtiene el poder total de staking del usuario
   */
  const getUserStakingPower = useCallback(
    async (userAddress?: Address): Promise<bigint> => {
      const targetAddress = userAddress || address;
      if (!targetAddress) throw new Error("No address provided");

      const contract = getContract();
      if (!contract) throw new Error("Contract not available");

      try {
        return await contract.getUserStakingPower(targetAddress);
      } catch (err) {
        log.error("Failed to get user staking power", err);
        throw err;
      }
    },
    [address, getContract],
  );

  /**
   * Obtiene todas las Geodas stakeadas por el usuario
   */
  const getStakedGeodes = useCallback(
    async (userAddress?: Address): Promise<bigint[]> => {
      const targetAddress = userAddress || address;
      if (!targetAddress) throw new Error("No address provided");

      const contract = getContract();
      if (!contract) throw new Error("Contract not available");

      try {
        return await contract.getUserStakedGeodes(targetAddress);
      } catch (err) {
        log.error("Failed to get staked geodes", err);
        throw err;
      }
    },
    [address, getContract],
  );

  /**
   * Obtiene información detallada de una Geoda stakeada
   */
  const getStakeInfo = useCallback(
    async (geodeId: bigint): Promise<GeodeStakeInfo | null> => {
      const contract = getContract();
      if (!contract) throw new Error("Contract not available");

      try {
        const info = await contract.getStake(geodeId);

        return {
          geodeId,
          owner: info.owner,
          stakedAt: info.stakedAt,
          power: info.power,
          canUnstake: info.active, // Si está activo, puede ser unstakeado
        };
      } catch (err) {
        log.error("Failed to get stake info", err);
        return null;
      }
    },
    [getContract],
  );

  /**
   * Obtiene el poder total de staking del sistema
   */
  const getTotalStakingPower = useCallback(async (): Promise<bigint> => {
    const contract = getContract();
    if (!contract) throw new Error("Contract not available");

    try {
      return await contract.getTotalStakingPower();
    } catch (err) {
      log.error("Failed to get total staking power", err);
      throw err;
    }
  }, [getContract]);

  return {
    // Actions
    stake,
    unstake,

    // Queries
    getUserStakingPower,
    getStakedGeodes,
    getStakeInfo,
    getTotalStakingPower,

    // State
    isLoading,
    error,
  };
}

export default useGeodeStaking;
