/**
 * Componente mejorado para reproducir videos con manejo robusto de errores
 */

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, RotateCw } from 'lucide-react';
import { useVideoLoader } from '@/lib/hooks/ui/useVideoLoader';
import { createServiceLogger } from '@/lib/utils/logging/logger';

const logger = createServiceLogger('VideoPlayer');

interface VideoPlayerProps {
  /** URL principal del video */
  src: string;
  /** URLs de fallback opcionales */
  fallbackSrcs?: string[];
  /** Autoplay */
  autoPlay?: boolean;
  /** Loop */
  loop?: boolean;
  /** Muted */
  muted?: boolean;
  /** Controles */
  controls?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Poster (imagen mientras carga) */
  poster?: string;
  /** Callback cuando carga exitosamente */
  onLoad?: () => void;
  /** Callback cuando falla */
  onError?: (error: Error) => void;
}

export function VideoPlayer({
  src,
  fallbackSrcs = [],
  autoPlay = false,
  loop = false,
  muted = true,
  controls = false,
  className = '',
  poster,
  onLoad,
  onError
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  const { 
    videoUrl, 
    isLoading, 
    hasError, 
    isFallback,
    retry 
  } = useVideoLoader({
    primaryUrl: src,
    fallbackUrls: fallbackSrcs,
    prevalidate: false, // Dejar que el navegador maneje la carga
    maxRetries: 2
  });

  // Manejar errores de carga del elemento <video>
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = new Error(`Failed to load video: ${videoUrl}`);
    setLoadError(error);
    
    logger.error('Video element load error', { videoUrl, isFallback });
    
    if (onError) {
      onError(error);
    }
  };

  // Manejar carga exitosa
  const handleVideoLoad = () => {
    setLoadError(null);
    
    logger.info('Video loaded successfully', { videoUrl, isFallback });
    
    if (onLoad) {
      onLoad();
    }
  };

  // Intentar reproducir cuando cambie la URL
  useEffect(() => {
    if (videoRef.current && videoUrl && autoPlay) {
      videoRef.current.play().catch(err => {
        logger.warn('Autoplay prevented by browser', { error: err.message });
      });
    }
  }, [videoUrl, autoPlay]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-center space-y-3">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm text-gray-400">Cargando video...</p>
        </div>
      </div>
    );
  }

  if (hasError && loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-center space-y-4 p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Error al cargar video</p>
            <p className="text-xs text-gray-400">
              {isFallback ? 'Todos los videos fallaron' : 'Intentando alternativa...'}
            </p>
          </div>
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay URL disponible, mostrar placeholder
  if (!videoUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-gray-500 mx-auto" />
          <p className="text-sm text-gray-400">Video no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        poster={poster}
        className="w-full h-full object-contain"
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      >
        <source src={videoUrl} type="video/mp4" />
        Su navegador no soporta el elemento video.
      </video>
      
      {/* Indicador de fallback */}
      {isFallback && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-600/80 rounded text-xs text-white">
          Video alternativo
        </div>
      )}
    </div>
  );
}

/**
 * Componente específico para videos de miners
 */
interface MinerVideoPlayerProps {
  category: number;
  minerType: number;
  minerIndex: number;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function MinerVideoPlayer({
  category,
  minerType,
  minerIndex,
  autoPlay = true,
  loop = true,
  className = '',
  onLoad,
  onError
}: MinerVideoPlayerProps) {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  // Lazy loading: cargar metadata del video
  useEffect(() => {
    import('@/lib/utils/data/localMinerData').then(({ getLocalMinerVideo }) => {
      getLocalMinerVideo(category, minerType, minerIndex).then(src => {
        setVideoSrc(src);
      });
    });
  }, [category, minerType, minerIndex]);

  // Intersection Observer: detectar cuando el video está en viewport
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        root: null,
        rootMargin: '50px', // Pre-cargar 50px antes de entrar al viewport
        threshold: 0.1 // 10% del elemento visible
      }
    );

    observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  if (!videoSrc) {
    return (
      <div ref={videoRef} className={`flex items-center justify-center bg-gray-900 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div ref={videoRef} className="w-full h-full">
      {isVisible ? (
        <VideoPlayer
          src={videoSrc}
          fallbackSrcs={[
            `/assets/videos/coreminers/default-${category}.mp4`,
          ]}
          autoPlay={autoPlay}
          loop={loop}
          muted={true}
          className={className}
          onLoad={onLoad}
          onError={onError}
        />
      ) : (
        <div className={`flex items-center justify-center bg-gray-900 ${className}`}>
          <Loader2 className="w-6 h-6 text-gray-600" />
        </div>
      )}
    </div>
  );
}
