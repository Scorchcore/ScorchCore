/**
 * useAxies - Hook para gestionar Axies NFT y staking
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../user/useWallet';
import { NFTFacade } from '@/lib/facades/NFTFacade';
import { ContractManager } from '@/lib/contracts/ContractManager';
import type { AxieNFT } from '@/lib/facades/NFTFacade';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('useAxies');

export function useAxies() {
  const { address, isConnected } = useWallet();
  const [axies, setAxies] = useState<AxieNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar Axies del usuario
  const loadAxies = useCallback(async () => {
    if (!address || !isConnected) {
      setAxies([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contractManager = ContractManager.getInstance();
      const nftFacade = new NFTFacade(contractManager);

      const userAxies = await nftFacade.getAxiesFromWallet(address);
      setAxies(userAxies);

      logger.info('Axies cargados', { count: userAxies.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error cargando Axies', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Stakear un Axie
  const stakeAxie = useCallback(async (axieId: string) => {
    if (!address) {
      throw new Error('Wallet no conectada');
    }

    logger.info('Stakeando Axie', { axieId });

    try {
      const contractManager = ContractManager.getInstance();
      const stakingManager = contractManager.getAxieStakingManager();

      await stakingManager.stakeAxie(BigInt(axieId));

      logger.info('Axie stakeado exitosamente', { axieId });

      // Recargar Axies
      await loadAxies();
    } catch (err) {
      logger.error('Error stakeando Axie', err);
      throw err;
    }
  }, [address, loadAxies]);

  // Unstakear un Axie
  const unstakeAxie = useCallback(async (axieId: string) => {
    if (!address) {
      throw new Error('Wallet no conectada');
    }

    logger.info('Unstakeando Axie', { axieId });

    try {
      const contractManager = ContractManager.getInstance();
      const stakingManager = contractManager.getAxieStakingManager();

      await stakingManager.unstakeAxie(BigInt(axieId));

      logger.info('Axie unstakeado exitosamente', { axieId });

      // Recargar Axies
      await loadAxies();
    } catch (err) {
      logger.error('Error unstakeando Axie', err);
      throw err;
    }
  }, [address, loadAxies]);

  // Cargar Axies cuando cambia la wallet
  useEffect(() => {
    loadAxies();
  }, [loadAxies]);

  return {
    axies,
    isLoading,
    error,
    stakeAxie,
    unstakeAxie,
    reload: loadAxies,
  };
}
