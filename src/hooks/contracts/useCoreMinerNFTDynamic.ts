/**
 * React hooks dinámicos para CoreMinerNFT
 * Soporte para supply dinámico con escucha de eventos y cache
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useEthersSigner, useEthersProvider } from "@/hooks/web3/useEthers";
import { CoreMinerNFTService } from "@/services/coreMinerNFTService";
import { metadataCache, type CacheOptions } from "@/lib/cache/metadataCache";
import type { MinerData, MinerMintedEvent } from "@/lib/abis/coreMinerNFT";

// Helper para generar cache keys consistentes
const generateCacheKey = (
  prefix: string,
  ...parts: (string | number)[]
): string => {
  return `${prefix}-${parts.join("-")}`;
};

export interface UseMinerOptions {
  autoRefresh?: boolean; // Escuchar eventos para actualizar
  cache?: boolean; // Usar cache para metadata
  cacheTTL?: number; // TTL del cache en ms
  cacheStorage?: "memory" | "session" | "local";
}

/**
 * Hook base con servicio (reutiliza lógica existente)
 */
export function useCoreMinerNFT() {
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const service = useMemo(() => {
    if (!provider) return null;
    return new CoreMinerNFTService(provider, signer || undefined);
  }, [provider, signer]);

  return service;
}

/**
 * Hook para total supply CON actualización automática
 */
export function useMinerTotalSupply(options?: UseMinerOptions) {
  const service = useCoreMinerNFT();
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
      console.error("[useMinerTotalSupply] Error:", err);
      setError(err.message || "Error fetching total supply");
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Fetch inicial
  useEffect(() => {
    fetchSupply();
  }, [fetchSupply]);

  // Escuchar eventos de minteo si autoRefresh está activado
  useEffect(() => {
    if (!service || !options?.autoRefresh) return;

    const handleMinerMinted = (event: MinerMintedEvent) => {
      console.log(
        "[useMinerTotalSupply] New miner minted, updating supply...",
        event,
      );
      fetchSupply();
    };

    service.onMinerMinted(handleMinerMinted);

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
 * Hook para miners de usuario CON actualización en tiempo real
 */
export function useUserMiners(address?: string, options?: UseMinerOptions) {
  const service = useCoreMinerNFT();
  const [miners, setMiners] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchMiners = useCallback(async () => {
    if (!service || !address) {
      setMiners([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenIds = await service.getTokensOfOwner(address);
      if (isMountedRef.current) {
        setMiners(tokenIds);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error("[useUserMiners] Error:", err);
        setError(err.message || "Error fetching miners");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [service, address]);

  // Fetch inicial
  useEffect(() => {
    isMountedRef.current = true;
    fetchMiners();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchMiners]);

  // Escuchar eventos si autoRefresh está activado
  useEffect(() => {
    if (!service || !address || !options?.autoRefresh) return;

    const handleMinerMinted = (event: any) => {
      // Si se mintea a esta dirección, refetch
      const mintedTo = event.to || event.args?.[0];
      if (mintedTo?.toLowerCase() === address.toLowerCase()) {
        console.log("[useUserMiners] New miner minted to user, refreshing...");
        fetchMiners();
      }
    };

    const handleTransfer = (from: string, to: string, tokenId: bigint) => {
      // Si se transfiere desde o hacia esta dirección, refetch
      if (
        from.toLowerCase() === address.toLowerCase() ||
        to.toLowerCase() === address.toLowerCase()
      ) {
        console.log("[useUserMiners] Transfer detected, refreshing...", {
          from,
          to,
          tokenId,
        });
        fetchMiners();
      }
    };

    service.onMinerMinted(handleMinerMinted);
    service.onTransfer(handleTransfer);

    return () => {
      service.removeAllListeners();
    };
  }, [service, address, options?.autoRefresh, fetchMiners]);

  return {
    miners,
    loading,
    error,
    refetch: fetchMiners,
  };
}

/**
 * Hook para metadata CON cache persistente
 */
export function useMinerMetadata(tokenId?: number, options?: UseMinerOptions) {
  const service = useCoreMinerNFT();
  const [metadata, setMetadata] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const cacheKey = useMemo(
    () => generateCacheKey("metadata-miner", tokenId || 0),
    [tokenId],
  );

  const fetchMetadata = useCallback(
    async (forceRefresh = false) => {
      if (!service || tokenId === undefined) {
        setMetadata(null);
        return;
      }

      // Intentar obtener del cache primero (si no es force refresh)
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

          // Guardar en cache si está habilitado
          if (options?.cache && meta) {
            metadataCache.set(cacheKey, meta, {
              storage: options.cacheStorage,
              ttl: options.cacheTTL,
            });
          }
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          console.error("[useMinerMetadata] Error:", err);
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
 * Hook para datos de miner CON cache
 */
export function useMinerData(tokenId?: number, options?: UseMinerOptions) {
  const service = useCoreMinerNFT();
  const [data, setData] = useState<MinerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const cacheKey = useMemo(
    () => generateCacheKey("miner-data", tokenId || 0),
    [tokenId],
  );

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!service || tokenId === undefined) {
        setData(null);
        return;
      }

      // Intentar cache primero
      if (options?.cache && !forceRefresh) {
        const cached = metadataCache.get<MinerData>(cacheKey, {
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
        const minerData = await service.getMinerData(tokenId);

        if (isMountedRef.current) {
          setData(minerData);

          if (options?.cache && minerData) {
            metadataCache.set(cacheKey, minerData, {
              storage: options.cacheStorage,
              ttl: options.cacheTTL,
            });
          }
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          console.error("[useMinerData] Error:", err);
          setError(err.message || "Error fetching miner data");
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
 * Hook para escuchar eventos de minteo en tiempo real
 */
export function useMinerMintedEvents(
  callback: (event: MinerMintedEvent) => void,
  dependencies: any[] = [],
) {
  const service = useCoreMinerNFT();
  const callbackRef = useRef(callback);

  // Actualizar ref cuando callback cambia
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!service) return;

    const handleEvent = (event: MinerMintedEvent) => {
      callbackRef.current(event);
    };

    service.onMinerMinted(handleEvent);

    return () => {
      service.removeAllListeners();
    };
  }, [service, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook para escuchar transfers en tiempo real
 */
export function useTransferEvents(
  callback: (from: string, to: string, tokenId: bigint) => void,
  dependencies: any[] = [],
) {
  const service = useCoreMinerNFT();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!service) return;

    const handleEvent = (from: string, to: string, tokenId: bigint) => {
      callbackRef.current(from, to, tokenId);
    };

    service.onTransfer(handleEvent);

    return () => {
      service.removeAllListeners();
    };
  }, [service, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook combinado con datos + metadata con cache
 */
export function useCompleteMinerInfo(
  tokenId?: number,
  options?: UseMinerOptions,
) {
  const {
    data,
    loading: loadingData,
    error: errorData,
    refetch: refetchData,
  } = useMinerData(tokenId, options);

  const {
    metadata,
    loading: loadingMetadata,
    error: errorMetadata,
    refetch: refetchMetadata,
  } = useMinerMetadata(tokenId, options);

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
