/**
 * Hook para gestionar datos agregados del usuario
 * 
 * Combina información de NFTs y estadísticas de mining para proporcionar
 * una vista consolidada de los assets y actividad del usuario.
 * 
 * @category Core
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { axies, miners, stats, isLoading } = useUserData();
 *   
 *   if (isLoading) return <Loading />;
 *   
 *   return (
 *     <div>
 *       <p>Axies: {stats.axiesOwned}</p>
 *       <p>Miners: {stats.coreMinersActive}</p>
 *       <p>CORE Mined: {stats.totalCOREMined}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useMemo } from 'react';
import { useNFTs } from '../nfts/useNFTs';
import { useMiningStats } from '../mining/useMiningStats';
import type { CoreMinerNFT, AxieNFT } from '@/lib/facades/NFTFacade';

/**
 * Estadísticas agregadas del usuario
 */
export interface UserStats {
  /** Número total de Axies */
  totalAxies: number;
  
  /** Número total de Core Miners */
  totalMiners: number;
  
  /** Valor total estimado (placeholder) */
  totalValue: string;
  
  /** Número de Axies en posesión */
  axiesOwned: number;
  
  /** Número de Core Miners activos */
  coreMinersActive: number;
  
  /** Total de CORE minado */
  totalCOREMined: string;
  
  /** Tasa de minado diaria */
  dailyRate: string;
}

/**
 * Valor de retorno del hook useUserData
 */
export interface UseUserDataReturn {
  /** Lista de Axies NFT del usuario */
  axies: AxieNFT[];
  
  /** Lista de Core Miners NFT del usuario */
  miners: CoreMinerNFT[];
  
  /** Estadísticas agregadas */
  stats: UserStats;
  
  /** Indica si está cargando datos */
  isLoading: boolean;
  
  /** Mensaje de error si ocurrió alguno */
  error: string | null;
  
  /** Función para recargar todos los datos */
  reload: () => Promise<void>;
}

/**
 * Hook que proporciona datos agregados del usuario
 * 
 * Combina NFTs y estadísticas de mining en una sola interfaz
 */
export function useUserData(): UseUserDataReturn {
  // Cargar NFTs
  const {
    miners,
    axies,
    isLoading: isLoadingNFTs,
    error: nftError,
    reload: reloadNFTs,
  } = useNFTs({
    autoLoad: true,
  });

  // Calcular estadísticas agregadas
  const stats = useMemo<UserStats>(() => {
    const totalMiners = miners.length;
    const totalAxies = axies.length;
    
    // Contar miners activos (asumiendo que tienen mining session)
    const activeMiners = miners.filter(m => m.isMining).length;
    
    // Calcular recompensas totales de todos los miners
    const totalMined = miners.reduce((sum, m) => {
      return sum + (m.totalMined ? Number(m.totalMined) : 0);
    }, 0);
    
    // Calcular tasa diaria basada en miners activos
    // Fórmula: suma de (miningPower/1000 * emissionRate * 24h) para cada miner activo
    const hourlyEmission = 100; // 100 CORE/hora en año 1
    const dailyRate = miners
      .filter(m => m.isMining)
      .reduce((sum, m) => {
        const basePower = m.miningPower || 0;
        return sum + ((basePower / 1000) * hourlyEmission * 24);
      }, 0);
    
    return {
      totalAxies,
      totalMiners,
      totalValue: '0', // Valor en USD - requiere oracle de precios externo
      axiesOwned: totalAxies,
      coreMinersActive: activeMiners,
      totalCOREMined: totalMined.toFixed(2),
      dailyRate: dailyRate.toFixed(2),
    };
  }, [miners, axies]);

  // Función para recargar todos los datos
  const reload = async (): Promise<void> => {
    await reloadNFTs();
  };

  return {
    axies,
    miners,
    stats,
    isLoading: isLoadingNFTs,
    error: nftError,
    reload,
  };
}
