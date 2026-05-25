/**
 * Utilidades para manejo de IPFS con múltiples gateways y fallback
 */

export const IPFS_GATEWAYS = [
  'https://peach-tiny-crawdad-788.mypinata.cloud/ipfs',  // Pinata gateway personalizado
  'https://ipfs.io/ipfs',                                 // Gateway público oficial
  'https://gateway.pinata.cloud/ipfs',                    // Pinata público (fallback)
  'https://dweb.link/ipfs',                               // Alternativo de Protocol Labs
  'https://w3s.link/ipfs',                                // Web3.Storage
] as const;

export interface IPFSFetchOptions {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

/**
 * Convierte una URI IPFS a URL HTTP usando el gateway especificado
 */
export function ipfsToHttp(uri: string, gateway: string = IPFS_GATEWAYS[0]): string {
  if (!uri) return '';
  
  // Ya es una URL HTTP
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  
  // ipfs://QmHash/path -> https://gateway/ipfs/QmHash/path
  if (uri.startsWith('ipfs://')) {
    const ipfsPath = uri.replace('ipfs://', '');
    return `${gateway}/${ipfsPath}`;
  }
  
  // QmHash/path -> https://gateway/ipfs/QmHash/path
  return `${gateway}/${uri}`;
}

/**
 * Intenta fetch con múltiples gateways en orden
 * Si uno falla (timeout, 429, etc), intenta con el siguiente
 */
export async function fetchFromIPFS(
  uri: string,
  options: IPFSFetchOptions = {}
): Promise<Response> {
  const { timeout = 10000, retries = 1, signal } = options;
  const errors: Error[] = [];

  for (const gateway of IPFS_GATEWAYS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = ipfsToHttp(uri, gateway);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          signal: signal || controller.signal,
          headers: {
            'Accept': 'application/json,image/*,video/*',
          },
        });
        
        clearTimeout(timeoutId);
        
        // Si obtenemos respuesta exitosa, retornar
        if (response.ok) {
          return response;
        }
        
        // Si es 429 (rate limit), intentar siguiente gateway inmediatamente
        if (response.status === 429) {
          console.warn(`[IPFS] Rate limit en ${gateway}, probando siguiente...`);
          break; // Salir del loop de retries y probar siguiente gateway
        }
        
        // Otros errores HTTP, reintentar con mismo gateway
        if (attempt < retries) {
          await sleep(1000 * (attempt + 1)); // Backoff exponencial
        }
        
      } catch (error: any) {
        errors.push(error);
        
        // Si es timeout o abort, probar siguiente gateway
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          console.warn(`[IPFS] Timeout en ${gateway}, probando siguiente...`);
          break;
        }
        
        // Otros errores, reintentar
        if (attempt < retries) {
          await sleep(500 * (attempt + 1));
        }
      }
    }
  }
  
  // Todos los gateways fallaron
  throw new Error(
    `Failed to fetch from IPFS after trying all gateways. URI: ${uri}. Errors: ${errors.map(e => e.message).join(', ')}`
  );
}

/**
 * Fetch JSON desde IPFS con fallback
 */
export async function fetchJSONFromIPFS<T = any>(
  uri: string,
  options?: IPFSFetchOptions
): Promise<T> {
  const response = await fetchFromIPFS(uri, options);
  return await response.json();
}

/**
 * Obtiene la URL HTTP más confiable para un asset IPFS
 * Intenta con el primer gateway, si falla retorna con segundo, etc.
 */
export async function getReliableIPFSUrl(
  uri: string,
  options: IPFSFetchOptions = {}
): Promise<string> {
  const { timeout = 5000 } = options;
  
  // Si ya es HTTP, verificar que funcione
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    try {
      const response = await fetch(uri, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(timeout)
      });
      if (response.ok) return uri;
    } catch {
      // Continuar probando con gateways
    }
  }
  
  // Probar cada gateway hasta encontrar uno que responda
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = ipfsToHttp(uri, gateway);
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(timeout)
      });
      
      if (response.ok) {
        return url;
      }
    } catch {
      continue;
    }
  }
  
  // Si ninguno respondió, retornar con gateway por defecto
  return ipfsToHttp(uri, IPFS_GATEWAYS[0]);
}

/**
 * Convierte múltiples URIs IPFS a URLs HTTP confiables
 */
export async function batchGetReliableIPFSUrls(
  uris: string[],
  options?: IPFSFetchOptions
): Promise<string[]> {
  return await Promise.all(
    uris.map(uri => getReliableIPFSUrl(uri, options))
  );
}

/**
 * Hook para React - convierte IPFS URI a URL HTTP con el mejor gateway
 */
export function useIPFSUrl(uri?: string): string {
  if (!uri) return '';
  
  // Por defecto usar Cloudflare (más confiable)
  return ipfsToHttp(uri, IPFS_GATEWAYS[0]);
}

/**
 * Helper para esperar
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Preload de assets IPFS (útil para videos/imágenes grandes)
 */
export async function preloadIPFSAsset(
  uri: string,
  type: 'image' | 'video' = 'image'
): Promise<string> {
  const url = await getReliableIPFSUrl(uri);
  
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    } else {
      const video = document.createElement('video');
      video.onloadedmetadata = () => resolve(url);
      video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
      video.src = url;
    }
  });
}
