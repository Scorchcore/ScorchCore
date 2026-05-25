/**
 * IGeodeHatcher - Interface para el contrato GeodeHatcher
 * 
 * @pattern Interface Segregation (SOLID)
 * @category Contracts
 */

import type { Address } from 'viem';
import type { HatchResult } from './SharedTypes';

// Re-exportar HatchResult para uso externo
export type { HatchResult };

/**
 * Interface para el contrato GeodeHatcher
 * Maneja la eclosión de geodas en miners
 */
export interface IGeodeHatcher {
  /**
   * Abre una geoda para crear un minero
   * @param geodeId ID de la geoda
   * @returns Resultado del hatching con ID del minero creado
   * @throws Si el usuario no es el dueño
   * @throws Si el hatching está pausado
   */
  openGeode(geodeId: bigint): Promise<HatchResult>;

  /**
   * Simula el hatching sin ejecutarlo (útil para previews en UI)
   * @param geodeId ID de la geoda
   * @returns Resultado simulado del hatching
   */
  simulateHatching(geodeId: bigint): Promise<{
    minerIndex: number;
    isCritical: boolean;
    finalPower: number;
  }>;

  /**
   * Verifica si un usuario puede abrir una geoda
   * @param userAddress Dirección del usuario
   * @param geodeId ID de la geoda
   * @returns true si el usuario puede abrir la geoda
   */
  canOpenGeode(userAddress: string, geodeId: bigint): Promise<boolean>;

  /**
   * Verifica si el hatching está pausado
   * @returns true si está pausado
   */
  isPaused(): Promise<boolean>;

  /**
   * Obtiene el base power de una categoría
   * @param category Categoría (0-4)
   * @returns Base power
   */
  getBasePower(category: number): Promise<number>;
}
