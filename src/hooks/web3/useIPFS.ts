/**
 * React hooks para manejo de IPFS assets
 */

import { useState, useEffect, useMemo } from 'react';
import { ipfsToHttp, getReliableIPFSUrl, IPFS_GATEWAYS } from '@/lib/utils/ipfs/ipfs';

/**
 * Hook para convertir IPFS URI a URL HTTP
 * Por defecto usa Cloudflare gateway
 */
export function useIPFSUrl(uri?: string, gatewayIndex: number = 0): string {
  return useMemo(() => {
    if (!uri) return '';
    return ipfsToHttp(uri, IPFS_GATEWAYS[gatewayIndex]);
  }, [uri, gatewayIndex]);
}

/**
 * Hook para obtener la URL más confiable con verificación
 * Intenta con múltiples gateways hasta encontrar uno que funcione
 */
export function useReliableIPFSUrl(uri?: string) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uri) {
      setUrl('');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getReliableIPFSUrl(uri, { timeout: 5000 })
      .then(reliableUrl => {
        if (isMounted) {
          setUrl(reliableUrl);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          // Fallback a Cloudflare
          setUrl(ipfsToHttp(uri, IPFS_GATEWAYS[0]));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [uri]);

  return { url, loading, error };
}

/**
 * Hook para cargar metadata JSON desde IPFS
 */
export function useIPFSMetadata<T = any>(uri?: string) {
  const [metadata, setMetadata] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uri) {
      setMetadata(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    import('@/lib/utils/ipfs/ipfs').then(({ fetchJSONFromIPFS }) => {
      return fetchJSONFromIPFS<T>(uri, { timeout: 15000, retries: 1 });
    })
      .then(data => {
        if (isMounted) {
          setMetadata(data);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [uri]);

  return { metadata, loading, error };
}

/**
 * Hook para precargar asset IPFS (imagen o video)
 */
export function useIPFSPreload(uri?: string, type: 'image' | 'video' = 'image') {
  const [preloaded, setPreloaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    if (!uri) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    import('@/lib/utils/ipfs/ipfs').then(({ preloadIPFSAsset }) => {
      return preloadIPFSAsset(uri, type);
    })
      .then(loadedUrl => {
        if (isMounted) {
          setUrl(loadedUrl);
          setPreloaded(true);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          // Fallback
          setUrl(ipfsToHttp(uri, IPFS_GATEWAYS[0]));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [uri, type]);

  return { url, preloaded, loading, error };
}
