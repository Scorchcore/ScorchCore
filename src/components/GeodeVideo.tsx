import React, { useState } from 'react';
import {
  GeodeCategory,
  AxieClass,
  CATEGORY_INFO,
  AXIE_CLASS_INFO,
  isCategoryAvailable,
} from '@/lib/constants/geodes';
import { useGeodeMetadata } from '@/hooks/metadata/useGeodeMetadata';
import { useIPFSUrl } from '@/hooks/web3/useIPFS';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { Gem } from 'lucide-react';

const log = createServiceLogger('GeodeVideo');

interface GeodeVideoProps {
  category: GeodeCategory;
  axieClass: AxieClass;
  className?: string;
  autoPlay?: boolean;
  showFallback?: boolean;
}

/**
 * Componente para renderizar video de geoda con fallback a emoji
 * ACTUALIZADO para sistema de categorías + clases
 */
export function GeodeVideo({ 
  category,
  axieClass,
  className = '',
  autoPlay = true,
  showFallback = true 
}: GeodeVideoProps) {
  const categoryInfo = CATEGORY_INFO[category];
  const classInfo = AXIE_CLASS_INFO[axieClass];
  const isAvailable = isCategoryAvailable(category);
  const [useIPFS, setUseIPFS] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);
  
  // Cargar metadata desde IPFS
  const { metadata, loading, error } = useGeodeMetadata(category, axieClass);
  
  // Gateways IPFS en orden de prioridad (usados solo si local falla)
  const GATEWAYS = [
    'https://peach-tiny-crawdad-788.mypinata.cloud/ipfs',  // Pinata personalizado - mejor para videos
    'https://ipfs.io/ipfs',                                 // Gateway público oficial
    'https://gateway.pinata.cloud/ipfs',                    // Pinata público (fallback)
    'https://dweb.link/ipfs',                               // Alternativo
  ];
  
  // Construir ruta de video local como PRIMERA OPCIÓN
  // IMPORTANTE: Debe estar ANTES de cualquier return para cumplir reglas de Hooks
  const localVideoPath = React.useMemo(() => {
    const categoryName = categoryInfo.name.toUpperCase();
    // Usar 'name' (inglés) en lugar de 'displayName' (español) para archivos
    const className = classInfo.name.toUpperCase();
    return `/assets/geodes/${categoryInfo.name.toLowerCase()}/GEODA_${categoryName}_${className}.mp4`;
  }, [categoryInfo, classInfo]);
  
  // Construir URL de video: LOCAL primero, luego IPFS como fallback
  const videoUrl = React.useMemo(() => {
    // Prioridad 1: Video local (más rápido)
    if (!useIPFS) {
      log.info('Using local video (first priority)', {
        localPath: localVideoPath,
        category: categoryInfo.name,
        class: classInfo.name
      });
      return localVideoPath;
    }
    
    // Prioridad 2: IPFS gateways (fallback si local falla)
    if (!metadata?.animation_url) return '';
    const uri = metadata.animation_url;
    
    if (uri.startsWith('http')) return uri;
    
    const cid = uri.replace('ipfs://', '');
    const url = `${GATEWAYS[gatewayIndex]}/${cid}`;
    
    log.info('Using IPFS gateway (fallback)', {
      originalUri: uri,
      cid,
      gateway: GATEWAYS[gatewayIndex],
      gatewayIndex,
      finalUrl: url,
      category: categoryInfo.name,
      class: classInfo.name
    });
    
    return url;
  }, [useIPFS, localVideoPath, metadata?.animation_url, gatewayIndex, categoryInfo, classInfo]);

  // Loading
  if (loading) {
    return (
      <div className={`flex items-center justify-center border border-cyan-100/8 bg-black/38 ${className}`}>
        <div className="text-center">
          <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/25 border-t-ethereal-cyan" />
          <p className="text-[0.65rem] text-cyan-50/38">Loading…</p>
        </div>
      </div>
    );
  }

  // Unavailable / no metadata fallback
  if (error || !isAvailable || !metadata || !metadata.animation_url) {
    if (!showFallback) return null;
    return (
      <div className={`flex items-center justify-center border border-cyan-100/8 bg-black/38 ${className}`}>
        <div className="text-center">
          <Gem className="mx-auto mb-2 h-8 w-8 text-cyan-50/18" />
          <p className="text-[0.65rem] text-cyan-50/35">
            {categoryInfo.name} {classInfo.displayName}
          </p>
          <p className="mt-1 text-[0.6rem] text-cyan-50/22">
            {error ? 'Video unavailable' : 'Coming soon'}
          </p>
        </div>
      </div>
    );
  }

  // All sources failed
  if (shouldHide) {
    return (
      <div className={`flex items-center justify-center border border-cyan-100/8 bg-black/38 ${className}`}>
        <div className="text-center">
          <Gem className="mx-auto mb-2 h-8 w-8 text-cyan-50/18" />
          <p className="text-[0.65rem] text-cyan-50/35">
            {categoryInfo.name} {classInfo.displayName}
          </p>
          <p className="mt-1 text-[0.6rem] text-cyan-50/22">Video unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <video
        key={videoUrl}
        autoPlay={autoPlay}
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-contain"
        onError={(e) => {
          // Si ya se decidió ocultar, no hacer nada más
          if (shouldHide) return;
          
          // Si estamos usando local y falla, cambiar a IPFS
          if (!useIPFS) {
            log.warn('Local video failed, trying IPFS gateways...', {
              localPath: localVideoPath,
              category: categoryInfo.name,
              class: classInfo.name
            });
            setUseIPFS(true);
            return;
          }
          
          // Si estamos usando IPFS, intentar siguiente gateway
          if (gatewayIndex < GATEWAYS.length - 1) {
            log.warn(`IPFS Gateway ${GATEWAYS[gatewayIndex]} failed, trying next...`, { 
              currentGateway: GATEWAYS[gatewayIndex],
              nextGateway: GATEWAYS[gatewayIndex + 1],
              videoUrl,
            });
            setGatewayIndex(prev => prev + 1);
          } else {
            // Todo falló (local + todos los gateways IPFS), mostrar fallback visual
            log.warn('All video sources failed (local + all IPFS gateways), showing visual fallback', {
              localPath: localVideoPath,
              attemptedGateways: GATEWAYS,
              category: categoryInfo.name,
              class: classInfo.name
            });
            setShouldHide(true);
          }
        }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      
      {/* Gradient overlay para mejor apariencia */}
      <div 
        className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${categoryInfo.color}20, transparent)`
        }}
      />
    </div>
  );
}

/**
 * Componente para thumbnail estático (sin autoplay)
 */
export function GeodeThumbnail({ 
  category,
  axieClass,
  className = '' 
}: Omit<GeodeVideoProps, 'autoPlay'>) {
  return (
    <GeodeVideo 
      category={category}
      axieClass={axieClass}
      className={className}
      autoPlay={false}
      showFallback={true}
    />
  );
}

/**
 * Componente para card de geoda con video de fondo
 */
export function GeodeCard({ 
  category,
  axieClass,
  children,
  className = ''
}: {
  category: GeodeCategory;
  axieClass: AxieClass;
  children?: React.ReactNode;
  className?: string;
}) {
  const categoryInfo = CATEGORY_INFO[category];
  
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Video de fondo */}
      <div className="absolute inset-0 z-0">
        <GeodeVideo 
          category={category}
          axieClass={axieClass}
          className="w-full h-full"
          autoPlay={true}
        />
      </div>
      
      {/* Contenido encima */}
      <div 
        className="relative z-10 p-6 bg-linear-to-t from-black/80 via-black/40 to-transparent"
        style={{
          background: `linear-gradient(to top, ${categoryInfo.color}80, ${categoryInfo.color}40, transparent)`
        }}
      >
        {children}
      </div>
    </div>
  );
}
