/**
 * Sistema de cache para metadata de NFTs
 * Evita re-fetchear constantemente desde IPFS
 */

export interface CacheOptions {
  ttl?: number; // Time to live en ms (default: 1 hora)
  storage?: 'memory' | 'session' | 'local'; // Tipo de storage
}

export interface CachedMetadata<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MetadataCache {
  private memoryCache: Map<string, CachedMetadata<any>> = new Map();
  private readonly DEFAULT_TTL = 3600000; // 1 hora

  /**
   * Obtiene metadata del cache
   */
  get<T = any>(key: string, options?: CacheOptions): T | null {
    const storage = options?.storage || 'memory';
    
    try {
      let cached: CachedMetadata<T> | null = null;

      // Intentar obtener del storage especificado
      if (storage === 'memory') {
        cached = this.memoryCache.get(key) || null;
      } else if (storage === 'session') {
        const item = sessionStorage.getItem(key);
        cached = item ? JSON.parse(item) : null;
      } else if (storage === 'local') {
        const item = localStorage.getItem(key);
        cached = item ? JSON.parse(item) : null;
      }

      // Verificar si existe y no expiró
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      // Si expiró, eliminar
      if (cached) {
        this.delete(key, storage);
      }

      return null;
    } catch (error) {
      console.error('[MetadataCache] Error getting cache:', error);
      return null;
    }
  }

  /**
   * Guarda metadata en cache
   */
  set<T = any>(key: string, data: T, options?: CacheOptions): void {
    const storage = options?.storage || 'memory';
    const ttl = options?.ttl || this.DEFAULT_TTL;
    
    const cached: CachedMetadata<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    try {
      if (storage === 'memory') {
        this.memoryCache.set(key, cached);
      } else if (storage === 'session') {
        sessionStorage.setItem(key, JSON.stringify(cached));
      } else if (storage === 'local') {
        localStorage.setItem(key, JSON.stringify(cached));
      }
    } catch (error) {
      console.error('[MetadataCache] Error setting cache:', error);
    }
  }

  /**
   * Elimina item del cache
   */
  delete(key: string, storage: 'memory' | 'session' | 'local' = 'memory'): void {
    try {
      if (storage === 'memory') {
        this.memoryCache.delete(key);
      } else if (storage === 'session') {
        sessionStorage.removeItem(key);
      } else if (storage === 'local') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('[MetadataCache] Error deleting cache:', error);
    }
  }

  /**
   * Limpia todo el cache
   */
  clear(storage?: 'memory' | 'session' | 'local'): void {
    try {
      if (!storage || storage === 'memory') {
        this.memoryCache.clear();
      }
      if (!storage || storage === 'session') {
        // Solo limpiar items relacionados con metadata
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('metadata-') || key?.startsWith('miner-data-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
      }
      if (!storage || storage === 'local') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('metadata-') || key?.startsWith('miner-data-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('[MetadataCache] Error clearing cache:', error);
    }
  }

  /**
   * Limpia items expirados del cache
   */
  clearExpired(storage?: 'memory' | 'session' | 'local'): void {
    const now = Date.now();

    try {
      if (!storage || storage === 'memory') {
        for (const [key, cached] of this.memoryCache.entries()) {
          if (cached.expiresAt <= now) {
            this.memoryCache.delete(key);
          }
        }
      }

      if (!storage || storage === 'session') {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('metadata-') || key?.startsWith('miner-data-')) {
            const item = sessionStorage.getItem(key);
            if (item) {
              const cached = JSON.parse(item);
              if (cached.expiresAt <= now) {
                sessionStorage.removeItem(key);
              }
            }
          }
        }
      }

      if (!storage || storage === 'local') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('metadata-') || key?.startsWith('miner-data-')) {
            const item = localStorage.getItem(key);
            if (item) {
              const cached = JSON.parse(item);
              if (cached.expiresAt <= now) {
                localStorage.removeItem(key);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('[MetadataCache] Error clearing expired:', error);
    }
  }

  /**
   * Invalida cache de un token específico
   */
  invalidateToken(tokenId: number, contractType: 'miner' | 'geode' = 'miner'): void {
    const metadataKey = `metadata-${contractType}-${tokenId}`;
    const dataKey = `${contractType}-data-${tokenId}`;
    
    this.delete(metadataKey, 'memory');
    this.delete(metadataKey, 'session');
    this.delete(metadataKey, 'local');
    
    this.delete(dataKey, 'memory');
    this.delete(dataKey, 'session');
  }

  /**
   * Genera una key de cache consistente
   */
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}-${parts.join('-')}`;
  }
}

// Singleton instance
export const metadataCache = new MetadataCache();

// Limpiar expirados cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    metadataCache.clearExpired();
  }, 300000); // 5 minutos
}
