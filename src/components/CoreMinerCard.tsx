'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import { useCoreMinerMetadata, getMiningPower, getRarity } from '@/hooks/metadata/useCoreMinerMetadata';
import { Card } from '@/components/ui/Card';
import { GeodeCategory } from '@/lib/constants/geodes';

interface CoreMinerCardProps {
  tokenId: bigint;
  category: GeodeCategory;
  className: string;
  index: number;
  isVoracious?: boolean;
  level?: bigint;
  showDetails?: boolean;
}

export function CoreMinerCard({ 
  tokenId, 
  category, 
  className, 
  index,
  isVoracious = false,
  level,
  showDetails = true 
}: CoreMinerCardProps) {
  const { metadata, loading, error } = useCoreMinerMetadata(category, className, index);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (loading) {
    return <CoreMinerCardSkeleton />;
  }

  if (error || !metadata) {
    return <CoreMinerCardError tokenId={tokenId} />;
  }

  const power = getMiningPower(metadata);
  const rarity = getRarity(metadata);
  const videoUrl = metadata.animation_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');

  const rarityColors: Record<string, string> = {
    Common: 'text-gray-400',
    Rare: 'text-blue-400',
    Epic: 'text-purple-400',
    Legendary: 'text-orange-400',
    Mythic: 'text-red-400',
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxOpen(true);
  };

  return (
    <>
    <Link href={`/coreminer/${tokenId.toString()}`}>
      <Card className="overflow-hidden hover:scale-105 transition-transform cursor-pointer bg-gray-800 border-gray-700">
        {/* Video preview con overlay */}
        <div className="aspect-square bg-gray-900 relative group">
          <div onClick={handleVideoClick} className="relative w-full h-full cursor-zoom-in">
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Badge voraz */}
          {isVoracious && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium shadow-lg">
              ⚠️ Voraz
            </div>
          )}

          {/* Overlay con quick stats */}
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-400">⚡ {power}</span>
                {level && (
                  <span className="text-xs bg-blue-500/80 px-2 py-1 rounded">
                    Nv. {level.toString()}
                  </span>
                )}
              </div>
              <span className={`text-sm font-semibold ${rarityColors[rarity] || 'text-gray-400'}`}>
                {rarity}
              </span>
            </div>
          </div>

        </div>

        {/* Info del CoreMiner */}
        {showDetails && (
          <div className="p-4">
            <h3 className="font-bold text-lg text-white mb-1 truncate">
              {metadata.name}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
              {metadata.description}
            </p>
            
            {/* Token ID */}
            <div className="mt-2 text-xs text-gray-500">
              Token ID: #{tokenId.toString()}
            </div>
          </div>
        )}
      </Card>
    </Link>

    <Lightbox
      open={lightboxOpen}
      close={() => setLightboxOpen(false)}
      slides={[
        {
          src: videoUrl,
          width: 1920,
          height: 1080,
        }
      ]}
      render={{
        slide: () => (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <video
              src={videoUrl}
              autoPlay
              loop
              controls
              playsInline
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-2">{metadata.name}</h2>
                <div className="flex items-center gap-4 text-lg">
                  <span className="text-green-400 font-semibold">⚡ {power} Power</span>
                  <span className={`font-semibold ${rarityColors[rarity]}`}>{rarity}</span>
                  {level && (
                    <span className="text-blue-400">Nivel {level.toString()}</span>
                  )}
                </div>
                <p className="text-gray-300 mt-3 text-sm line-clamp-2">{metadata.description}</p>
                <Link 
                  href={`/coreminer/${tokenId.toString()}`}
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  onClick={() => setLightboxOpen(false)}
                >
                  Ver Detalles Completos →
                </Link>
              </div>
            </div>
          </div>
        ),
      }}
      carousel={{
        finite: true,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
    />
    </>
  );
}

function CoreMinerCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-gray-800 border-gray-700">
      <div className="aspect-square bg-gray-700 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse" />
        <div className="h-3 bg-gray-700 rounded w-1/3 animate-pulse" />
      </div>
    </Card>
  );
}

function CoreMinerCardError({ tokenId }: { tokenId: bigint }) {
  return (
    <Card className="overflow-hidden bg-red-900/20 border-red-500/50">
      <div className="aspect-square bg-red-900/30 flex items-center justify-center">
        <span className="text-4xl">❌</span>
      </div>
      <div className="p-4">
        <p className="text-red-400 font-semibold">Error al cargar metadata</p>
        <p className="text-xs text-gray-500 mt-1">Token ID: #{tokenId.toString()}</p>
      </div>
    </Card>
  );
}
