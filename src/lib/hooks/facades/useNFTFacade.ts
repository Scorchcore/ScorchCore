/**
 * Hook para acceder a NFTFacade
 * 
 * Proporciona acceso al facade de NFTs que unifica operaciones
 * con Core Miners y Axies.
 * 
 * @category NFT
 * @example
 * ```tsx
 * function NFTList() {
 *   const nftFacade = useNFTFacade();
 *   const { address } = useAccount();
 *   
 *   const loadMiners = async () => {
 *     const miners = await nftFacade.getMinersFromWallet(address);
 *     console.log('Miners:', miners);
 *   };
 * }
 * ```
 */

import { useMemo } from 'react';
import { useContractManager } from '../contracts/useContractManager';
import { NFTFacade } from '@/lib/facades/NFTFacade';

/**
 * Hook que proporciona una instancia de NFTFacade
 * 
 * @returns Instancia memoizada de NFTFacade
 */
export function useNFTFacade(): NFTFacade {
  const { contractManager } = useContractManager();

  return useMemo(() => {
    return new NFTFacade(contractManager);
  }, [contractManager]);
}
