'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { GeodeCategory, AxieClass, CATEGORY_INFO, AXIE_CLASS_INFO } from '@/lib/constants/geodes';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { getCIDForCategory } from '@/lib/utils/ipfs/ipfsCids';
import { getLocalMinerVideo } from '@/lib/utils/data/localMinerData';

const log = createServiceLogger('CoreMinerVideo');

interface CoreMinerVideoProps {
  category: GeodeCategory;
  axieClass: AxieClass;
  minerIndex?: number; // Índice del miner (0-based) - CRÍTICO para video correcto
  ipfsUrl?: string; // URL desde metadata IPFS (fallback)
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showFallback?: boolean;
}

/**
 * Componente para renderizar video de CoreMiner con fallback local→IPFS
 * Prioridad: LOCAL primero, luego IPFS si local falla
 * 
 * Similar a GeodeVideo pero para CoreMiners
 */
export function CoreMinerVideo({ 
  category,
  axieClass,
  minerIndex = 0,
  ipfsUrl,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  showFallback = true 
}: CoreMinerVideoProps) {
  const categoryInfo = CATEGORY_INFO[category];
  const classInfo = AXIE_CLASS_INFO[axieClass];
  
  const [useIPFS, setUseIPFS] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);
  const [localVideoPath, setLocalVideoPath] = useState<string>('');
  const [isLoadingPath, setIsLoadingPath] = useState(true);
  
  // Gateways IPFS en orden de prioridad (usados solo si local falla)
  const GATEWAYS = [
    'https://peach-tiny-crawdad-788.mypinata.cloud/ipfs',  // Pinata personalizado
    'https://ipfs.io/ipfs',                                 // Gateway público oficial
    'https://gateway.pinata.cloud/ipfs',                    // Pinata público
    'https://dweb.link/ipfs',                               // Alternativo
  ];
  
  // Obtener ruta de video local desde metadata real
  useEffect(() => {
    async function loadVideoPath() {
      try {
        const path = await getLocalMinerVideo(category, axieClass, minerIndex);
        setLocalVideoPath(path);
        log.info('Local CoreMiner video path loaded from metadata', {
          path,
          category: categoryInfo.name,
          class: classInfo.name,
          minerIndex
        });
      } catch (error) {
        log.error('Failed to load video path from metadata', error);
        setLocalVideoPath('');
      } finally {
        setIsLoadingPath(false);
      }
    }
    loadVideoPath();
  }, [category, axieClass, minerIndex, categoryInfo.name, classInfo.name]);
  
  // Construir URL de video: LOCAL primero, luego IPFS como fallback
  const videoUrl = useMemo(() => {
    // Prioridad 1: Video local (más rápido)
    if (!useIPFS) {
      log.info('Using local CoreMiner video (first priority)', {
        localPath: localVideoPath,
        category: categoryInfo.name,
        class: classInfo.name
      });
      return localVideoPath;
    }
    
    // Prioridad 2: IPFS gateways (fallback si local falla)
    // Construir URL usando el CID correcto de la categoría
    const categoryCID = getCIDForCategory(category);
    
    if (!categoryCID) {
      log.warn('No CID configured for category, falling back to ipfsUrl prop', {
        category: categoryInfo.name
      });
      
      // Fallback al ipfsUrl prop si está disponible
      if (!ipfsUrl) return '';
      if (ipfsUrl.startsWith('http')) return ipfsUrl;
      
      const cid = ipfsUrl.replace('ipfs://', '');
      return `${GATEWAYS[gatewayIndex]}/${cid}`;
    }
    
    // Construir path: [CID]/[CATEGORY]/[CATEGORY]_[CLASS]/[filename desde metadata]
    // Si tenemos ipfsUrl, extraer el filename
    let filename = '';
    if (ipfsUrl) {
      const parts = ipfsUrl.split('/');
      filename = parts[parts.length - 1]; // último elemento es el filename
    } else {
      // Si no hay ipfsUrl, construir filename esperado
      const categoryName = categoryInfo.name.toUpperCase();
      const className = classInfo.name.toUpperCase();
      // El filename exacto debería venir de metadata, pero podemos estimarlo
      log.warn('No ipfsUrl provided, cannot construct full IPFS path', {
        category: categoryInfo.name,
        class: classInfo.name
      });
      return '';
    }
    
    // Path completo en IPFS
    const categoryUpper = categoryInfo.name.toUpperCase();
    const classUpper = classInfo.name.toUpperCase();
    const ipfsPath = `${categoryCID}/${categoryUpper}/${categoryUpper}_${classUpper}/${filename}`;
    const url = `${GATEWAYS[gatewayIndex]}/${ipfsPath}`;
    
    log.info('Using IPFS gateway for CoreMiner (fallback)', {
      categoryCID,
      ipfsPath,
      gateway: GATEWAYS[gatewayIndex],
      gatewayIndex,
      finalUrl: url,
      category: categoryInfo.name,
      class: classInfo.name
    });
    
    return url;
  }, [useIPFS, localVideoPath, ipfsUrl, gatewayIndex, categoryInfo, classInfo, category]);

  // Loading state mientras se carga la ruta del video
  if (isLoadingPath) {
    return (
      <div className={`flex items-center justify-center bg-slate-800/50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⚙️</div>
          <p className="text-xs text-gray-400">Cargando video...</p>
        </div>
      </div>
    );
  }

  // Si todo falló, mostrar fallback visual
  if (shouldHide) {
    if (!showFallback) return null;
    
    return (
      <div className={`flex items-center justify-center bg-slate-800/50 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-2">⚡</div>
          <p className="text-sm text-gray-400">
            {categoryInfo.displayName} {classInfo.displayName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Video no disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        key={videoUrl}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        preload="auto"
        className="w-full h-full object-contain"
        onError={(e) => {
          // Si ya se decidió ocultar, no hacer nada más
          if (shouldHide) return;
          
          // Si estamos usando local y falla, cambiar a IPFS
          if (!useIPFS) {
            log.warn('Local CoreMiner video failed, trying IPFS gateways...', {
              localPath: localVideoPath,
              category: categoryInfo.name,
              class: classInfo.name,
              hasIpfsUrl: !!ipfsUrl
            });
            
            // Solo intentar IPFS si tenemos una URL IPFS
            if (ipfsUrl) {
              setUseIPFS(true);
            } else {
              // Sin IPFS URL, ir directamente a fallback
              log.warn('No IPFS URL available, showing fallback', {
                localPath: localVideoPath,
                category: categoryInfo.name,
                class: classInfo.name
              });
              setShouldHide(true);
            }
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
            log.warn('All CoreMiner video sources failed (local + all IPFS gateways), showing visual fallback', {
              localPath: localVideoPath,
              attemptedGateways: GATEWAYS,
              category: categoryInfo.name,
              class: classInfo.name
            });
            setShouldHide(true);
          }
        }}
        onLoadStart={() => {
          log.debug('CoreMiner video loading started', { videoUrl });
        }}
        onLoadedData={() => {
          log.info('CoreMiner video loaded successfully', { 
            videoUrl: useIPFS ? 'IPFS' : 'local',
            category: categoryInfo.name,
            class: classInfo.name
          });
        }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
