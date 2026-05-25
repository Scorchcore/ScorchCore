/**
 * React hooks dinámicos para GeodeNFT
 * Soporte para supply dinámico con escucha de eventos y cache
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useEthersSigner, useEthersProvider } from "@/hooks/web3/useEthers";
import { GeodeNFTService } from "@/services/geodeNFTService";
import { metadataCache, type CacheOptions } from "@/lib/cache/metadataCache";
import type { GeodeData, GeodeMintedEvent } from "@/lib/abis/geodeNFT";

// Helper para generar cache keys
const generateCacheKey = (
  prefix: string,
  ...parts: (string | number)[]
): string => {
  return `${prefix}-${parts.join("-")}`;
};

export interface UseGeodeOptions {
  autoRefresh?: boolean;
  cache?: boolean;
  cacheTTL?: number;
  cacheStorage?: "memory" | "session" | "local";
}

/**
 * Hook base con servicio
 */
export function useGeodeNFT() {
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const service = useMemo(() => {
    if (!provider) return null;
    return new GeodeNFTService(provider, signer || undefined);
  }, [provider, signer]);

  return service;
}

/**
 * Hook para total supply CON actualización automática
 */
export function useGeodeTotalSupply(options?: UseGeodeOptions) {
  const service = useGeodeNFT();
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupply = useCallback(async () => {
    if (!service) return;

    setLoading(true);
    setError(null);

    try {
      const supply = await service.totalSupply();
      setTotalSupply(supply);
    } catch (err: any) {
      console.error("[useGeodeTotalSupply] Error:", err);
      setError(err.message || "Error fetching total supply");
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchSupply();
  }, [fetchSupply]);

  // Escuchar eventos de minteo
  useEffect(() => {
    if (!service || !options?.autoRefresh) return;

    const handleGeodeMinted = (event: any) => {
      console.log(
        "[useGeodeTotalSupply] New geode minted, updating supply...",
        event,
      );
      fetchSupply();
    };

    service.onGeodeMinted(handleGeodeMinted);

    return () => {
      service.removeAllListeners();
    };
  }, [service, options?.autoRefresh, fetchSupply]);

  return {
    totalSupply,
    loading,
    error,
    refetch: fetchSupply,
  };
}

/**
 * Hook para geodas de usuario CON actualización en tiempo real
 */
export function useUserGeodes(address?: string, options?: UseGeodeOptions) {
  const service = useGeodeNFT();
  const [geodes, setGeodes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchGeodes = useCallback(async () => {
    if (!service || !address) {
      setGeodes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenIds = await service.getTokensOfOwner(address);
      if (isMountedRef.current) {
        setGeodes(tokenIds);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error("[useUserGeodes] Error:", err);
        setError(err.message || "Error fetching geodes");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [service, address]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchGeodes();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchGeodes]);

  // Escuchar eventos
  useEffect(() => {
    if (!service || !address || !options?.autoRefresh) return;

    const handleGeodeMinted = (event: any) => {
      const mintedTo = event.to || event.args?.[0];
      if (mintedTo?.toLowerCase() === address.toLowerCase()) {
        console.log("[useUserGeodes] New geode minted to user, refreshing...");
        fetchGeodes();
      }
    };

    const handleTransfer = (from: string, to: string, tokenId: bigint) => {
      if (
        from.toLowerCase() === address.toLowerCase() ||
        to.toLowerCase() === address.toLowerCase()
      ) {
        console.log("[useUserGeodes] Transfer detected, refreshing...", {
          from,
          to,
          tokenId,
        });
        fetchGeodes();
      }
    };

    const handleGeodeBurned = (tokenId: bigint) => {
      console.log("[useUserGeodes] Geode burned, refreshing...", tokenId);
      fetchGeodes();
    };

    service.onGeodeMinted(handleGeodeMinted);
    service.onTransfer(handleTransfer);
    service.onGeodeBurned(handleGeodeBurned);

    return () => {
      service.removeAllListeners();
    };
  }, [service, address, options?.autoRefresh, fetchGeodes]);

  return {
    geodes,
    loading,
    error,
    refetch: fetchGeodes,
  };
}

/**
 * Hook para metadata CON cache persistente
 */
export function useGeodeMetadata(tokenId?: number, options?: UseGeodeOptions) {
  const service = useGeodeNFT();
  const [metadata, setMetadata] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const cacheKey = useMemo(
    () => generateCacheKey("metadata-geode", tokenId || 0),
    [tokenId],
  );

  const fetchMetadata = useCallback(
    async (forceRefresh = false) => {
      if (!service || tokenId === undefined) {
        setMetadata(null);
        return;
      }

      if (options?.cache && !forceRefresh) {
        const cached = metadataCache.get(cacheKey, {
          storage: options.cacheStorage,
          ttl: options.cacheTTL,
        });

        if (cached) {
          setMetadata(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const meta = await service.getMetadata(tokenId);

        if (isMountedRef.current) {
          setMetadata(meta);

          if (options?.cache && meta) {
            metadataCache.set(cacheKey, meta, {
              storage: options.cacheStorage,
              ttl: options.cacheTTL,
            });
          }
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          console.error("[useGeodeMetadata] Error:", err);
          setError(err.message || "Error fetching metadata");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [
      service,
      tokenId,
      options?.cache,
      options?.cacheStorage,
      options?.cacheTTL,
      cacheKey,
    ],
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchMetadata();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchMetadata]);

  return {
    metadata,
    loading,
    error,
    refetch: () => fetchMetadata(true),
    invalidateCache: () =>
      metadataCache.delete(cacheKey, options?.cacheStorage),
  };
}

/**
 * Hook para datos de geoda CON cache
 */
export function useGeodeData(tokenId?: number, options?: UseGeodeOptions) {
  const service = useGeodeNFT();
  const [data, setData] = useState<GeodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const cacheKey = useMemo(
    () => generateCacheKey("geode-data", tokenId || 0),
    [tokenId],
  );

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!service || tokenId === undefined) {
        setData(null);
        return;
      }

      if (options?.cache && !forceRefresh) {
        const cached = metadataCache.get<GeodeData>(cacheKey, {
          storage: options.cacheStorage,
          ttl: options.cacheTTL,
        });

        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const geodeData = await service.getGeodeData(tokenId);

        if (isMountedRef.current) {
          setData(geodeData);

          if (options?.cache && geodeData) {
            metadataCache.set(cacheKey, geodeData, {
              storage: options.cacheStorage,
              ttl: options.cacheTTL,
            });
          }
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          console.error("[useGeodeData] Error:", err);
          setError(err.message || "Error fetching geode data");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [
      service,
      tokenId,
      options?.cache,
      options?.cacheStorage,
      options?.cacheTTL,
      cacheKey,
    ],
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidateCache: () =>
      metadataCache.delete(cacheKey, options?.cacheStorage),
  };
}

/**
 * Hook para escuchar eventos de minteo de geodas
 */
export function useGeodeMintedEvents(
  callback: (event: any) => void,
  dependencies: any[] = [],
) {
  const service = useGeodeNFT();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!service) return;

    const handleEvent = (event: any) => {
      callbackRef.current(event);
    };

    service.onGeodeMinted(handleEvent);

    return () => {
      service.removeAllListeners();
    };
  }, [service, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook para escuchar eventos de burn de geodas
 */
export function useGeodeBurnedEvents(
  callback: (tokenId: bigint) => void,
  dependencies: any[] = [],
) {
  const service = useGeodeNFT();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!service) return;

    const handleEvent = (tokenId: bigint) => {
      callbackRef.current(tokenId);
    };

    service.onGeodeBurned(handleEvent);

    return () => {
      service.removeAllListeners();
    };
  }, [service, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook combinado con datos + metadata con cache
 */
export function useCompleteGeodeInfo(
  tokenId?: number,
  options?: UseGeodeOptions,
) {
  const {
    data,
    loading: loadingData,
    error: errorData,
    refetch: refetchData,
  } = useGeodeData(tokenId, options);

  const {
    metadata,
    loading: loadingMetadata,
    error: errorMetadata,
    refetch: refetchMetadata,
  } = useGeodeMetadata(tokenId, options);

  const loading = loadingData || loadingMetadata;
  const error = errorData || errorMetadata;

  const refetch = useCallback(() => {
    refetchData();
    refetchMetadata();
  }, [refetchData, refetchMetadata]);

  return {
    data,
    metadata,
    loading,
    error,
    refetch,
  };
}
