/**
 * Hook para gestionar NFTs del usuario
 * 
 * Proporciona acceso reactivo a Core Miners y Axies NFT del usuario.
 * Maneja loading states, errores y recarga automática.
 * 
 * @category NFT
 * @example
 * ```tsx
 * function InventoryPage() {
 *   const { miners, axies, isLoading, error, reload } = useNFTs({
 *     autoLoad: true
 *   });
 *   
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *   
 *   return <NFTGrid miners={miners} axies={axies} />;
 * }
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useNFTFacade } from './useNFTFacade';
import type { CoreMinerNFT, AxieNFT } from '@/lib/facades/NFTFacade';
import { createServiceLogger } from '@/lib/utils/logger';

const logger = createServiceLogger('useNFTs');

/**
 * Opciones de configuración para useNFTs
 */
export interface UseNFTsOptions {
  /**
   * Si debe cargar automáticamente al montar el componente
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Si debe cargar solo mineros (ignorar Axies)
   * @default false
   */
  minersOnly?: boolean;

  /**
   * Si debe cargar solo Axies (ignorar mineros)
   * @default false
   */
  axiesOnly?: boolean;
}

/**
 * Valor de retorno del hook useNFTs
 */
export interface UseNFTsReturn {
  /** Lista de Core Miners NFT */
  miners: CoreMinerNFT[];
  
  /** Lista de Axies NFT */
  axies: AxieNFT[];
  
  /** Indica si está cargando */
  isLoading: boolean;
  
  /** Indica si está cargando mineros específicamente */
  isLoadingMiners: boolean;
  
  /** Indica si está cargando Axies específicamente */
  isLoadingAxies: boolean;
  
  /** Mensaje de error si ocurrió alguno */
  error: string | null;
  
  /** Función para recargar todos los NFTs */
  reload: () => Promise<void>;
  
  /** Función para recargar solo mineros */
  reloadMiners: () => Promise<void>;
  
  /** Función para recargar solo Axies */
  reloadAxies: () => Promise<void>;
}

/**
 * Hook para gestionar NFTs del usuario
 */
export function useNFTs(options: UseNFTsOptions = {}): UseNFTsReturn {
  const {
    autoLoad = true,
    minersOnly = false,
    axiesOnly = false,
  } = options;

  const { address } = useAccount();
  const nftFacade = useNFTFacade();

  const [miners, setMiners] = useState<CoreMinerNFT[]>([]);
  const [axies, setAxies] = useState<AxieNFT[]>([]);
  const [isLoadingMiners, setIsLoadingMiners] = useState(false);
  const [isLoadingAxies, setIsLoadingAxies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga todos los Core Miners del usuario
   */
  const loadMiners = useCallback(async () => {
    if (!address || axiesOnly) {
      setMiners([]);
      return;
    }

    logger.info('Cargando mineros', { address });
    setIsLoadingMiners(true);
    setError(null);

    try {
      const loadedMiners = await nftFacade.getMinersFromWallet(address);
      setMiners(loadedMiners);
      logger.info('Mineros cargados exitosamente', { count: loadedMiners.length });
    } catch (err) {
      logger.error('Error cargando mineros', err);
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar mineros';
      setError(errorMsg);
      setMiners([]);
    } finally {
      setIsLoadingMiners(false);
    }
  }, [address, nftFacade, axiesOnly]);

  /**
   * Carga todos los Axies del usuario
   */
  const loadAxies = useCallback(async () => {
    if (!address || minersOnly) {
      setAxies([]);
      return;
    }

    logger.info('Cargando Axies', { address });
    setIsLoadingAxies(true);
    setError(null);

    try {
      const loadedAxies = await nftFacade.getAxiesFromWallet(address);
      setAxies(loadedAxies);
      logger.info('Axies cargados exitosamente', { count: loadedAxies.length });
    } catch (err) {
      logger.warn('No se pudieron cargar Axies (contrato no disponible)', { error: err });
      // No establecer error para Axies ya que es opcional
      setAxies([]);
    } finally {
      setIsLoadingAxies(false);
    }
  }, [address, nftFacade, minersOnly]);

  /**
   * Recarga todos los NFTs
   */
  const reload = useCallback(async () => {
    await Promise.all([
      !axiesOnly && loadMiners(),
      !minersOnly && loadAxies(),
    ]);
  }, [loadMiners, loadAxies, minersOnly, axiesOnly]);

  // Auto-load al montar si está habilitado
  useEffect(() => {
    if (autoLoad && address) {
      reload();
    }
  }, [autoLoad, address]); // No incluir reload para evitar loops

  // Calcular isLoading general
  const isLoading = isLoadingMiners || isLoadingAxies;

  return {
    miners,
    axies,
    isLoading,
    isLoadingMiners,
    isLoadingAxies,
    error,
    reload,
    reloadMiners: loadMiners,
    reloadAxies: loadAxies,
  };
}
