/**
 * Utilidades para servicios NFT (ERC721)
 * 
 * Funciones reutilizables para operaciones comunes con NFTs,
 * eliminando duplicación de código entre servicios.
 */

import type { ethers } from 'ethers';
import type { Address } from 'viem';

/**
 * Obtiene todos los token IDs de un owner de forma paralela
 * 
 * Ejecuta todas las consultas `tokenOfOwnerByIndex` en paralelo
 * para mejorar el rendimiento en lugar de hacerlas secuencialmente.
 * 
 * **NOTA:** Requiere que el contrato implemente ERC721Enumerable.
 * 
 * @param contract - Contrato NFT con soporte ERC721Enumerable
 * @param owner - Dirección del propietario
 * @param balance - Balance de tokens (obtenido previamente con balanceOf)
 * @returns Array de token IDs
 * 
 * @example
 * ```typescript
 * const balance = await contract.balanceOf(owner);
 * const tokenIds = await getTokenIdsFromOwner(contract, owner, Number(balance));
 * // tokenIds: [1n, 5n, 10n, ...]
 * ```
 */
export async function getTokenIdsFromOwner(
  contract: ethers.Contract,
  owner: Address,
  balance: number
): Promise<bigint[]> {
  if (balance === 0) return [];
  
  // Ejecutar todas las consultas en paralelo para mejor rendimiento
  const promises = Array.from({ length: balance }, (_, index) =>
    contract.tokenOfOwnerByIndex(owner, index)
  );
  
  return Promise.all(promises);
}

/**
 * Mapea items de forma asíncrona y filtra nulls de forma type-safe
 * 
 * Ejecuta el mapper en paralelo sobre todos los items y elimina
 * los resultados null, manteniendo type safety con TypeScript.
 * 
 * @param items - Array de items a mapear
 * @param mapper - Función que transforma item en resultado o null
 * @returns Array de resultados sin nulls
 * 
 * @example
 * ```typescript
 * const tokenIds = [1n, 2n, 3n, 999n];
 * const nfts = await mapAndFilterNulls(
 *   tokenIds,
 *   async id => {
 *     try {
 *       return await getNFTData(id);
 *     } catch {
 *       return null; // Token no existe
 *     }
 *   }
 * );
 * // nfts: NFT[] (sin nulls, solo tokens válidos)
 * ```
 */
export async function mapAndFilterNulls<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R | null>
): Promise<R[]> {
  const results = await Promise.all(items.map(mapper));
  return results.filter((result): result is Exclude<typeof result, null> => result !== null) as R[];
}

/**
 * Verifica si un contrato está desplegado en la red
 * 
 * Útil para detectar si un contrato existe antes de interactuar con él.
 * 
 * @param contract - Contrato a verificar
 * @returns true si el contrato está desplegado, false si no
 * 
 * @example
 * ```typescript
 * if (!await isContractDeployed(contract)) {
 *   console.warn('Contrato no desplegado en esta red');
 *   return [];
 * }
 * ```
 */
export async function isContractDeployed(contract: ethers.Contract): Promise<boolean> {
  try {
    const address = await contract.getAddress();
    const code = await contract.runner?.provider?.getCode(address);
    return code !== undefined && code !== '0x';
  } catch {
    return false;
  }
}

/**
 * Chunking para operaciones batch con límite de concurrencia
 * 
 * Divide un array en chunks y los procesa en batches para evitar
 * sobrecargar el RPC con demasiadas requests simultáneas.
 * 
 * @param items - Items a procesar
 * @param processor - Función que procesa cada item
 * @param chunkSize - Tamaño de cada chunk (default: 10)
 * @returns Array con todos los resultados
 * 
 * @example
 * ```typescript
 * // Procesar 100 NFTs en batches de 10
 * const metadatas = await processInChunks(
 *   tokenIds,
 *   id => fetchMetadata(id),
 *   10
 * );
 * ```
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  chunkSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
  }
  
  return results;
}
