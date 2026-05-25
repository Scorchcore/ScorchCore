/**
 * Hook para acceder al TokenService
 * 
 * Proporciona acceso al servicio de tokens ERC20 con caché automático.
 * Útil para consultar balances, aprobaciones y realizar transferencias.
 * 
 * @category Core
 * @example
 * ```tsx
 * function TokenBalance() {
 *   const { address } = useAccount();
 *   const tokenService = useTokenService();
 *   
 *   const fetchBalance = async () => {
 *     const balance = await tokenService.getBalance(tokenAddress, address);
 *     console.log('Balance:', balance);
 *   };
 * }
 * ```
 */

import { useMemo } from 'react';
import { useContractManager } from '../contracts/useContractManager';
import { TokenService, createCachedTokenService, type ITokenService } from '@/lib/services';

/**
 * Hook que proporciona TokenService con caché
 * 
 * @param options - Opciones de configuración del caché
 * @returns Instancia de ITokenService con caché
 */
export function useTokenService(options?: {
  ttl?: number;
  debug?: boolean;
}): ITokenService {
  const { contractManager } = useContractManager();

  return useMemo(() => {
    // Crear TokenService con ContractManager
    const tokenService = new TokenService(contractManager);
    
    // Envolver con caché
    return createCachedTokenService(tokenService, {
      ttl: options?.ttl || 30000, // 30 segundos por defecto
      debug: options?.debug || process.env.NODE_ENV === 'development',
    });
  }, [contractManager, options?.ttl, options?.debug]);
}
