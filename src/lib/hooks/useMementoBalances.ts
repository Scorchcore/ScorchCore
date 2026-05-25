/**
 * Hook para gestionar balances de Mementos
 * 
 * Los Mementos son tokens ERC-1155 con diferentes IDs por clase de Axie.
 * Este hook maneja la consulta de balances usando balanceOf(address, tokenId).
 * 
 * @category Balance
 * @example
 * ```tsx
 * function MementoPanel() {
 *   const { balances, isLoading, reload } = useMementoBalances();
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       {Object.entries(balances).map(([axieClass, data]) => (
 *         <div key={axieClass}>
 *           {data.symbol}: {data.formatted}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTokenService } from './useTokenService';
import { getContractAddresses } from '@/lib/config/contracts';
import { AXIE_CLASS_INFO, AxieClass } from '@/lib/constants/geodes';
import { createServiceLogger } from '@/lib/utils/logger';
import { ContractManager } from '@/lib/contracts/ContractManager';
import type { Address } from 'viem';

const logger = createServiceLogger('useMementoBalances');

/**
 * Balance de un Memento específico
 */
export interface MementoBalance {
  axieClass: AxieClass;
  balance: bigint;
  formatted: string;
  symbol: string;
  address: Address;
}

/**
 * Balances de todos los Mementos por clase de Axie
 */
export type MementoBalances = Record<AxieClass, MementoBalance>;

/**
 * Opciones de configuración
 */
export interface UseMementoBalancesOptions {
  /**
   * Si debe cargar automáticamente al montar
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Intervalo de recarga automática en ms (0 para deshabilitar)
   * @default 30000 (30 segundos)
   */
  refreshInterval?: number;
}

/**
 * Valor de retorno del hook
 */
export interface UseMementoBalancesReturn {
  /** Balances de Mementos por clase de Axie */
  balances: MementoBalances | null;
  
  /** Indica si está cargando */
  isLoading: boolean;
  
  /** Mensaje de error */
  error: string | null;
  
  /** Función para recargar balances */
  reload: () => Promise<void>;
}

/**
 * Hook para gestionar balances de Mementos
 */
export function useMementoBalances(
  options: UseMementoBalancesOptions = {}
): UseMementoBalancesReturn {
  const {
    autoLoad = true,
    refreshInterval = 30000,
  } = options;

  const { address, chain } = useAccount();
  const tokenService = useTokenService();
  
  const [balances, setBalances] = useState<MementoBalances | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga los balances de todos los Mementos
   */
  const loadBalances = useCallback(async () => {
    if (!address || !chain) {
      setBalances(null);
      return;
    }

    logger.info('Cargando balances de Mementos', { address });
    setIsLoading(true);
    setError(null);

    try {
      // Validar que hay provider disponible
      const contractManager = ContractManager.getInstance({ chainId: chain.id });
      const provider = contractManager.getProvider();
      if (!provider) {
        logger.warn('No provider available, skipping memento balances load');
        setBalances(null);
        setIsLoading(false);
        return;
      }

      // Obtener direcciones de Mementos
      const contracts = getContractAddresses(chain.id);
      const mementoAddresses = contracts.mementos;

      // Filtrar direcciones inválidas (0x0000...)
      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
      const validMementos = Object.entries(mementoAddresses).filter(
        ([_, address]) => address.toLowerCase() !== ZERO_ADDRESS.toLowerCase()
      );

      if (validMementos.length === 0) {
        logger.warn('No valid memento addresses configured for this network', { chainId: chain.id });
        setBalances({} as MementoBalances);
        setIsLoading(false);
        return;
      }

      // ERC-1155: Todas las clases apuntan al mismo contrato, pero con diferentes tokenIds
      // tokenId = axieClass (0=Beast, 1=Aqua, 2=Bird, etc.)
      const mementoAddress = validMementos[0][1] as Address; // Todas usan la misma dirección
      
      logger.info('Fetching ERC-1155 memento balances', { 
        contract: mementoAddress,
        classes: validMementos.length
      });

      // Obtener el contrato ERC-1155 usando ethers.Contract
      const { ethers } = await import('ethers');
      const mementoContract = new ethers.Contract(
        mementoAddress,
        [
          'function balanceOf(address account, uint256 id) view returns (uint256)',
        ],
        provider
      );

      // Mapeo de nombre de clase a tokenId (0-8)
      const classNameToTokenId: Record<string, number> = {
        'beast': 0,
        'aqua': 1,
        'bird': 2,
        'reptile': 3,
        'bug': 4,
        'plant': 5,
        'mech': 6,
        'dusk': 7,
        'dawn': 8,
      };

      // Mapear resultados a estructura MementoBalances
      const balancesData: Partial<MementoBalances> = {};
      
      // Leer balance para cada clase (tokenId según nombre)
      for (const [className, _] of validMementos) {
        const tokenId = classNameToTokenId[className.toLowerCase()];
        
        if (tokenId === undefined) {
          logger.warn(`Unknown class name: ${className}`);
          continue;
        }
        
        const classNumber = tokenId as AxieClass;
        const classInfo = AXIE_CLASS_INFO[classNumber];
        const symbol = `MEMENTO_${classInfo?.name || 'UNKNOWN'}`;
        
        try {
          // ERC-1155: balanceOf(address, tokenId)
          const balance = await mementoContract.balanceOf(address, tokenId);
          const formatted = (Number(balance) / 1e18).toFixed(2);
          
          balancesData[classNumber] = {
            axieClass: classNumber,
            balance: balance,
            formatted,
            symbol,
            address: mementoAddress,
          };
          
          // Balance fetched successfully
        } catch (err) {
          logger.warn(`Failed to fetch balance for ${classInfo?.name}`, { 
            classNumber,
            tokenId,
            error: err instanceof Error ? err.message : String(err)
          });
          
          // Set zero balance on error
          balancesData[classNumber] = {
            axieClass: classNumber,
            balance: 0n,
            formatted: '0.00',
            symbol,
            address: mementoAddress,
          };
        }
      }

      logger.info('Balances de Mementos cargados', { 
        count: Object.keys(balancesData).length
      });

      setBalances(balancesData as MementoBalances);
    } catch (err) {
      logger.error('Error cargando balances de Mementos', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      setBalances(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, chain, tokenService]);

  // Auto-load al montar o cuando cambia la wallet/chain
  useEffect(() => {
    if (autoLoad && address) {
      loadBalances();
    }
  }, [autoLoad, address, loadBalances]);

  // Refresh interval
  useEffect(() => {
    if (!address || !refreshInterval) return;

    const interval = setInterval(() => {
      loadBalances();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [address, refreshInterval, loadBalances]);

  return {
    balances,
    isLoading,
    error,
    reload: loadBalances,
  };
}
