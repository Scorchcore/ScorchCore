/**
 * Hook para interactuar con ScholarshipManager
 * Sistema de préstamo de CoreMiners (Becas 2.0)
 */

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useContractManager } from '../contracts/useContractManager';
import type { IScholarshipManager, ScholarshipOffer } from '@/lib/contracts/interfaces';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import type { Address } from 'viem';

const log = createServiceLogger('useScholarship');

export function useScholarship() {
  const { address } = useAccount();
  const { contractManager } = useContractManager();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getContract = useCallback((): IScholarshipManager | null => {
    try {
      return contractManager?.getScholarshipManager();
    } catch (err) {
      log.error('Failed to get ScholarshipManager contract', err);
      return null;
    }
  }, [contractManager]);

  /**
   * Crea una oferta de scholarship
   */
  const createOffer = useCallback(async (
    minerId: bigint,
    scholar: Address,
    ownerShare: number,
    scholarShare: number,
    duration: bigint
  ) => {
    if (!address) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    setIsLoading(true);
    setError(null);

    try {
      log.info('Creating scholarship offer', {
        minerId: minerId.toString(),
        scholar,
        ownerShare,
        scholarShare,
        duration: duration.toString()
      });
      
      const tx = await contract.createOffer(minerId, scholar, ownerShare, scholarShare, duration);
      await tx.wait();
      
      log.info('Scholarship offer created', { minerId: minerId.toString() });
      return tx;
    } catch (err) {
      log.error('Failed to create scholarship offer', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, getContract]);

  /**
   * Acepta una oferta pública de scholarship
   */
  const acceptOffer = useCallback(async (minerId: bigint) => {
    if (!address) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    setIsLoading(true);
    setError(null);

    try {
      log.info('Accepting scholarship offer', { minerId: minerId.toString() });
      const tx = await contract.acceptOffer(minerId);
      await tx.wait();
      log.info('Scholarship offer accepted', { minerId: minerId.toString() });
      return tx;
    } catch (err) {
      log.error('Failed to accept scholarship offer', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, getContract]);

  /**
   * Cancela una oferta de scholarship
   */
  const cancelOffer = useCallback(async (minerId: bigint) => {
    if (!address) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    setIsLoading(true);
    setError(null);

    try {
      log.info('Canceling scholarship offer', { minerId: minerId.toString() });
      const tx = await contract.cancelOffer(minerId);
      await tx.wait();
      log.info('Scholarship offer canceled', { minerId: minerId.toString() });
      return tx;
    } catch (err) {
      log.error('Failed to cancel scholarship offer', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, getContract]);

  /**
   * Finaliza un préstamo activo
   */
  const endLoan = useCallback(async (minerId: bigint) => {
    if (!address) throw new Error('Wallet not connected');
    
    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    setIsLoading(true);
    setError(null);

    try {
      log.info('Ending loan', { minerId: minerId.toString() });
      const tx = await contract.endLoan(minerId);
      await tx.wait();
      log.info('Loan ended', { minerId: minerId.toString() });
      return tx;
    } catch (err) {
      log.error('Failed to end loan', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, getContract]);

  /**
   * Verifica si un CoreMiner está en préstamo
   */
  const isInLoan = useCallback(async (minerId: bigint): Promise<boolean> => {
    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    try {
      return await contract.isInLoan(minerId);
    } catch (err) {
      log.error('Failed to check loan status', err);
      throw err;
    }
  }, [getContract]);

  /**
   * Obtiene información de una scholarship
   */
  const getScholarship = useCallback(async (minerId: bigint): Promise<ScholarshipOffer | null> => {
    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    try {
      return await contract.getScholarship(minerId);
    } catch (err) {
      log.error('Failed to get scholarship', err);
      return null;
    }
  }, [getContract]);

  /**
   * Obtiene todas las scholarships que el usuario posee (como owner)
   */
  const getOwnedScholarships = useCallback(async (ownerAddress?: Address): Promise<bigint[]> => {
    const targetAddress = ownerAddress || address;
    if (!targetAddress) throw new Error('No address provided');

    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    try {
      return await contract.getOwnedScholarships(targetAddress);
    } catch (err) {
      log.error('Failed to get owned scholarships', err);
      throw err;
    }
  }, [address, getContract]);

  /**
   * Obtiene todos los préstamos que el usuario usa (como scholar)
   */
  const getScholarLoans = useCallback(async (scholarAddress?: Address): Promise<bigint[]> => {
    const targetAddress = scholarAddress || address;
    if (!targetAddress) throw new Error('No address provided');

    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    try {
      return await contract.getScholarLoans(targetAddress);
    } catch (err) {
      log.error('Failed to get scholar loans', err);
      throw err;
    }
  }, [address, getContract]);

  /**
   * Obtiene ofertas públicas disponibles
   */
  const getPublicOffers = useCallback(async (): Promise<bigint[]> => {
    const contract = getContract();
    if (!contract) throw new Error('Contract not available');

    try {
      return await contract.getPublicOffers();
    } catch (err) {
      log.error('Failed to get public offers', err);
      throw err;
    }
  }, [getContract]);

  return {
    // Actions
    createOffer,
    acceptOffer,
    cancelOffer,
    endLoan,
    
    // Queries
    isInLoan,
    getScholarship,
    getOwnedScholarships,
    getScholarLoans,
    getPublicOffers,
    
    // State
    isLoading,
    error,
  };
}

export default useScholarship;
