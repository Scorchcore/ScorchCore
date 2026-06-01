'use client';

import React, { useState, useMemo } from 'react';
import { GeodeCategory, AxieClass, CATEGORY_INFO, AXIE_CLASS_INFO } from '@/lib/constants/geodes';
import {
  getCoreMinerVideoPath,
  getCoreMinerVideoFilename,
  getStorageUrl,
} from '@/lib/constants/storagePaths';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { Zap } from 'lucide-react';

const log = createServiceLogger('CoreMinerVideo');

interface CoreMinerVideoProps {
  category: GeodeCategory;
  axieClass: AxieClass;
  minerIndex?: number;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showFallback?: boolean;
}

export function CoreMinerVideo({
  category,
  axieClass,
  minerIndex = 0,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  showFallback = true,
}: CoreMinerVideoProps) {
  const categoryInfo = CATEGORY_INFO[category];
  const classInfo = AXIE_CLASS_INFO[axieClass];
  const [shouldHide, setShouldHide] = useState(false);

  const videoUrl = useMemo(() => {
    const filename = getCoreMinerVideoFilename(category, axieClass, minerIndex);
    if (!filename) {
      log.warn('No video filename mapped', {
        category: categoryInfo.name,
        class: classInfo.name,
        minerIndex,
      });
      return '';
    }
    const path = getCoreMinerVideoPath(category, axieClass, filename);
    return getStorageUrl(path);
  }, [category, axieClass, minerIndex, categoryInfo.name, classInfo.name]);

  if (shouldHide || !videoUrl) {
    if (!showFallback) return null;
    return (
      <div className={`flex items-center justify-center border border-cyan-100/8 bg-black/38 ${className}`}>
        <div className="text-center">
          <Zap className="mx-auto mb-2 h-8 w-8 text-cyan-50/18" />
          <p className="text-[0.65rem] text-cyan-50/35">
            {categoryInfo.displayName} {classInfo.displayName}
          </p>
          <p className="mt-1 text-[0.6rem] text-cyan-50/22">Video unavailable</p>
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
        onError={() => {
          if (shouldHide) return;
          log.warn('Supabase video failed, showing fallback', {
            url: videoUrl,
            category: categoryInfo.name,
            class: classInfo.name,
          });
          setShouldHide(true);
        }}
        onLoadedData={() => {
          log.info('CoreMiner video loaded', {
            category: categoryInfo.name,
            class: classInfo.name,
            minerIndex,
          });
        }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
