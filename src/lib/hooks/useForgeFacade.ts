/**
 * Hook para acceder a ForgeFacade
 * 
 * Proporciona acceso al facade de Forge que maneja operaciones
 * de forja y eclosión de geodas.
 * 
 * @category Forge
 * @example
 * ```tsx
 * function ForgePanel() {
 *   const forgeFacade = useForgeFacade();
 *   
 *   const handleForge = async () => {
 *     const result = await forgeFacade.forgeGeode({
 *       category: GeodeCategory.PLANT,
 *       axieClass: AxieClass.PLANT
 *     });
 *   };
 * }
 * ```
 */

import { useMemo } from 'react';
import { useContractManager } from './useContractManager';
import { ForgeFacade } from '@/lib/services/forge/ForgeFacade';

/**
 * Hook que proporciona una instancia de ForgeFacade
 * 
 * @returns Instancia memoizada de ForgeFacade
 */
export function useForgeFacade(): ForgeFacade {
  const { contractManager } = useContractManager();

  return useMemo(() => {
    return new ForgeFacade(contractManager);
  }, [contractManager]);
}
