/**
 * Hook para cargar videos con validación, fallback y retry
 * Maneja detección de existencia, errores y estados de loading
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('useVideoLoader');

interface VideoLoaderState {
  /** URL del video a cargar (puede cambiar con fallbacks) */
  videoUrl: string | null;
  /** Estado de carga */
  isLoading: boolean;
  /** Si hubo error y se usó fallback */
  hasError: boolean;
  /** Si el video está usando fallback */
  isFallback: boolean;
  /** Reintentar carga */
  retry: () => void;
}

interface UseVideoLoaderOptions {
  /** URL del video principal */
  primaryUrl: string | null;
  /** URLs de fallback en orden de prioridad */
  fallbackUrls?: string[];
  /** URL de fallback final (imagen estática) */
  finalFallback?: string;
  /** Número máximo de reintentos */
  maxRetries?: number;
  /** Delay entre reintentos en ms */
  retryDelay?: number;
  /** Si debe validar existencia antes de intentar cargar */
  prevalidate?: boolean;
}

// Cache de URLs validadas para evitar verificaciones repetidas
const validatedUrlsCache = new Map<string, boolean>();

/**
 * Verifica si una URL de video existe y es accesible
 */
async function validateVideoUrl(url: string): Promise<boolean> {
  // Verificar cache
  if (validatedUrlsCache.has(url)) {
    return validatedUrlsCache.get(url)!;
  }

  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      cache: 'force-cache'
    });
    
    const isValid = response.ok;
    validatedUrlsCache.set(url, isValid);
    
    logger.debug('Video URL validation', { url, isValid, status: response.status });
    
    return isValid;
  } catch (error) {
    logger.warn('Video URL validation failed', { url, error });
    validatedUrlsCache.set(url, false);
    return false;
  }
}

/**
 * Hook para cargar videos con detección inteligente de errores
 */
export function useVideoLoader({
  primaryUrl,
  fallbackUrls = [],
  finalFallback = '/assets/miners/fallback.png',
  maxRetries = 2,
  retryDelay = 1000,
  prevalidate = true
}: UseVideoLoaderOptions): VideoLoaderState {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const mountedRef = useRef(true);

  /**
   * Intenta cargar un video desde una lista de URLs
   */
  const loadVideo = useCallback(async () => {
    if (!primaryUrl) {
      setVideoUrl(finalFallback);
      setIsLoading(false);
      setIsFallback(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const urlsToTry = [primaryUrl, ...fallbackUrls];
    let loadedUrl: string | null = null;
    let usedFallback = false;

    logger.info('Starting video load', { 
      primaryUrl, 
      fallbackCount: fallbackUrls.length,
      prevalidate,
      retryCount 
    });

    // Intentar cada URL en orden
    for (let i = 0; i < urlsToTry.length; i++) {
      const url = urlsToTry[i];
      
      if (!mountedRef.current) break;

      try {
        // Pre-validación opcional
        if (prevalidate) {
          const isValid = await validateVideoUrl(url);
          
          if (!isValid) {
            logger.debug('URL pre-validation failed, trying next', { url });
            continue;
          }
        }

        // URL válida encontrada
        loadedUrl = url;
        usedFallback = i > 0;
        
        logger.info('Video URL loaded successfully', { 
          url, 
          isFallback: usedFallback,
          attemptNumber: i + 1 
        });
        
        break;
      } catch (error) {
        logger.warn('Failed to load video URL', { 
          url, 
          error,
          attemptNumber: i + 1 
        });
      }
    }

    // Si ninguna URL funcionó, usar fallback final
    if (!loadedUrl && mountedRef.current) {
      logger.warn('All video URLs failed, using final fallback', { 
        primaryUrl,
        finalFallback 
      });
      
      loadedUrl = finalFallback;
      usedFallback = true;
      setHasError(true);
    }

    if (mountedRef.current) {
      setVideoUrl(loadedUrl);
      setIsFallback(usedFallback);
      setIsLoading(false);
    }
  }, [primaryUrl, fallbackUrls, finalFallback, prevalidate, retryCount]);

  /**
   * Reintentar carga
   */
  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      logger.info('Retrying video load', { 
        retryCount: retryCount + 1, 
        maxRetries 
      });
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, retryDelay);
    } else {
      logger.warn('Max retries reached', { maxRetries });
    }
  }, [retryCount, maxRetries, retryDelay]);

  // Cargar video cuando cambian las dependencias
  useEffect(() => {
    mountedRef.current = true;
    loadVideo();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadVideo]);

  return {
    videoUrl,
    isLoading,
    hasError,
    isFallback,
    retry
  };
}

/**
 * Hook simplificado para cargar video de un miner específico
 */
export function useMinerVideo(
  category: number,
  minerType: number,
  minerIndex: number
): VideoLoaderState {
  const [primaryUrl, setPrimaryUrl] = useState<string | null>(null);

  useEffect(() => {
    // Cargar URL del servicio de metadata
    import('@/lib/utils/data/localMinerData').then(({ getLocalMinerVideo }) => {
      getLocalMinerVideo(category, minerType, minerIndex).then(url => {
        setPrimaryUrl(url);
      });
    });
  }, [category, minerType, minerIndex]);

  return useVideoLoader({
    primaryUrl,
    fallbackUrls: [
      `/assets/miners/default-${category}.mp4`,
    ],
    finalFallback: '/assets/miners/fallback.png',
    prevalidate: true,
    maxRetries: 2
  });
}

/**
 * Limpia el cache de URLs validadas (útil para testing o refresh forzado)
 */
export function clearVideoUrlCache(): void {
  validatedUrlsCache.clear();
  logger.info('Video URL cache cleared');
}
