/**
 * Hook para acceder a InventoryFacade
 * 
 * Proporciona acceso al facade de inventario que maneja
 * la consulta de geodas y NFTs del usuario.
 * 
 * @category Forge
 * @example
 * ```tsx
 * function InventoryPanel() {
 *   const inventoryFacade = useInventoryFacade();
 *   const { address } = useAccount();
 *   
 *   const loadGeodes = async () => {
 *     const geodes = await inventoryFacade.getUserGeodes(address);
 *     console.log('Geodas:', geodes);
 *   };
 * }
 * ```
 */

import { useMemo } from 'react';
import { useContractManager } from './useContractManager';
import { InventoryFacade } from '@/lib/facades/InventoryFacade';

/**
 * Hook que proporciona una instancia de InventoryFacade
 * 
 * @returns Instancia memoizada de InventoryFacade
 */
export function useInventoryFacade(): InventoryFacade {
  const { contractManager } = useContractManager();

  return useMemo(() => {
    return new InventoryFacade(contractManager);
  }, [contractManager]);
}
