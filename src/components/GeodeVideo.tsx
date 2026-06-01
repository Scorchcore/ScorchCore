import React, { useState, useMemo } from 'react';
import {
  GeodeCategory,
  AxieClass,
  CATEGORY_INFO,
  AXIE_CLASS_INFO,
  isCategoryAvailable,
} from '@/lib/constants/geodes';
import { getGeodeStoragePath, getStorageUrl } from '@/lib/constants/storagePaths';
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
  const [shouldHide, setShouldHide] = useState(false);

  const videoUrl = useMemo(() => {
    const storagePath = getGeodeStoragePath(category, axieClass);
    const url = getStorageUrl(storagePath);
    log.info('Geode video URL from Supabase', {
      category: categoryInfo.name,
      class: classInfo.name,
      url,
    });
    return url;
  }, [category, axieClass, categoryInfo.name, classInfo.name]);

  if (!isAvailable || !videoUrl) {
    if (!showFallback) return null;
    return (
      <div className={`flex items-center justify-center border border-cyan-100/8 bg-black/38 ${className}`}>
        <div className="text-center">
          <Gem className="mx-auto mb-2 h-8 w-8 text-cyan-50/18" />
          <p className="text-[0.65rem] text-cyan-50/35">
            {categoryInfo.name} {classInfo.displayName}
          </p>
          <p className="mt-1 text-[0.6rem] text-cyan-50/22">Coming soon</p>
        </div>
      </div>
    );
  }

  if (shouldHide) {
    if (!showFallback) return null;
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
        onError={() => {
          if (shouldHide) return;
          log.warn('Supabase video failed, showing fallback', {
            url: videoUrl,
            category: categoryInfo.name,
            class: classInfo.name,
          });
          setShouldHide(true);
        }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${categoryInfo.color}20, transparent)`
        }}
      />
    </div>
  );
}

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
      <div className="absolute inset-0 z-0">
        <GeodeVideo
          category={category}
          axieClass={axieClass}
          className="w-full h-full"
          autoPlay={true}
        />
      </div>

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
