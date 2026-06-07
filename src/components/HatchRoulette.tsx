'use client';

import { useState, useEffect, useRef } from 'react';
import { GeodeCategory, AxieClass } from '@/lib/constants/geodes';
import {
  getThumbnailPath,
  getStorageUrl,
  getThumbnailFilename,
} from '@/lib/constants/storagePaths';
import { gsap } from 'gsap';
import type { HatchResult as ComponentHatchResult } from './types/HatchTypes';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { Egg } from 'lucide-react';

const logger = createServiceLogger('HatchRoulette');

interface HatchRouletteProps {
  category: GeodeCategory;
  axieClass: AxieClass;
  isVisible: boolean;
  onComplete: (result: ComponentHatchResult) => void;
  loopUntilConfirm?: boolean;
  isConfirmed?: boolean;
  selectedMinerIndex?: number;
}

const getThumbnails = (category: GeodeCategory, axieClass: AxieClass): string[] => {
  const thumbnails: string[] = [];
  // Each category/class combo has 7 miners (indices 0-6)
  for (let i = 0; i < 7; i++) {
    const filename = getThumbnailFilename(category, axieClass, i);
    if (filename) {
      const url = getStorageUrl(getThumbnailPath(category, axieClass, filename));
      console.log(`[HatchRoulette] thumbnail ${i}: ${url}`);
      thumbnails.push(url);
    } else {
      logger.warn('Missing thumbnail mapping', { category, axieClass, minerIndex: i });
    }
  }
  return thumbnails;
};

interface MinerData {
  name: string;
  rarity: 'common' | 'rare' | 'very-rare' | 'epic' | 'legendary';
  probability: number;
  power: number;
}

const getMinerData = (category: GeodeCategory): MinerData[] => {
  switch (category) {
    case GeodeCategory.PETIT:
      return [
        { name: '', rarity: 'common', probability: 20, power: 50 },
        { name: '', rarity: 'common', probability: 20, power: 60 },
        { name: '', rarity: 'rare', probability: 18, power: 70 },
        { name: '', rarity: 'rare', probability: 16, power: 80 },
        { name: '', rarity: 'very-rare', probability: 13, power: 90 },
        { name: '', rarity: 'very-rare', probability: 12, power: 100 },
        { name: '', rarity: 'epic', probability: 1, power: 500 },
      ];
    case GeodeCategory.ALTO:
      return [
        { name: '', rarity: 'common', probability: 20, power: 100 },
        { name: '', rarity: 'common', probability: 20, power: 110 },
        { name: '', rarity: 'common', probability: 18, power: 120 },
        { name: '', rarity: 'common', probability: 16, power: 130 },
        { name: '', rarity: 'rare', probability: 13, power: 140 },
        { name: '', rarity: 'rare', probability: 12, power: 150 },
        { name: '', rarity: 'epic', probability: 1, power: 750 },
      ];
    case GeodeCategory.ANIMAL:
    case GeodeCategory.ULTRAMECH:
      return [
        { name: '', rarity: 'common', probability: 20, power: 120 },
        { name: '', rarity: 'common', probability: 20, power: 140 },
        { name: '', rarity: 'rare', probability: 18, power: 160 },
        { name: '', rarity: 'rare', probability: 16, power: 180 },
        { name: '', rarity: 'rare', probability: 13, power: 200 },
        { name: '', rarity: 'rare', probability: 12, power: 220 },
        { name: '', rarity: 'epic', probability: 1, power: 1000 },
      ];
    case GeodeCategory.TANQUE:
      return [
        { name: '', rarity: 'rare', probability: 20, power: 150 },
        { name: '', rarity: 'rare', probability: 20, power: 170 },
        { name: '', rarity: 'rare', probability: 18, power: 190 },
        { name: '', rarity: 'rare', probability: 16, power: 210 },
        { name: '', rarity: 'rare', probability: 13, power: 230 },
        { name: '', rarity: 'rare', probability: 12, power: 250 },
        { name: '', rarity: 'legendary', probability: 1, power: 1500 },
      ];
    default:
      return [
        { name: '', rarity: 'common', probability: 20, power: 50 },
        { name: '', rarity: 'common', probability: 20, power: 60 },
        { name: '', rarity: 'common', probability: 18, power: 70 },
        { name: '', rarity: 'common', probability: 16, power: 80 },
        { name: '', rarity: 'rare', probability: 13, power: 90 },
        { name: '', rarity: 'rare', probability: 12, power: 100 },
        { name: '', rarity: 'epic', probability: 1, power: 500 },
      ];
  }
};

// Rarity → brand color bar
const getRarityBarClass = (rarity: string): string => {
  const classes: Record<string, string> = {
    common: 'bg-cyan-900/55',
    rare: 'bg-ethereal-cyan/45',
    'very-rare': 'bg-emerald-400/45',
    epic: 'bg-magma-orange/55',
    legendary: 'bg-magma-gold/65',
  };
  return classes[rarity] || 'bg-cyan-900/55';
};

export function HatchRoulette({
  category,
  axieClass,
  isVisible,
  onComplete,
  loopUntilConfirm = false,
  isConfirmed = false,
  selectedMinerIndex,
}: HatchRouletteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const hasAppliedRNG = useRef<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const thumbnails = getThumbnails(category, axieClass);
  const minerData = getMinerData(category);

  const realMinerNames = thumbnails.map(path => {
    const fileName = path.split('/').pop() || '';
    return fileName
      .replace(/-thumbnail\.webp$/i, '')
      .replace(/\.png$/i, '')
      .replace(/\.webp$/i, '');
  });

  useEffect(() => {
    logger.debug('Componente montado');
    if (isVisible) {
      hasAppliedRNG.current = false;
      setSelectedIndex(null);
    }
    return () => {
      logger.debug('Componente desmontando - limpiando animación GSAP');
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
      hasAppliedRNG.current = false;
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    if (animationRef.current) return;

    logger.info('Iniciando animación placeholder infinita', { thumbnailCount: thumbnails.length });
    const cycleDistance = thumbnails.length * 208;

    animationRef.current = gsap.to(containerRef.current, {
      x: -cycleDistance,
      duration: 2.5,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: (x: string) => {
          const numX = parseFloat(x);
          return `${numX % -cycleDistance}px`;
        },
      },
      onRepeat: () => {
        logger.debug('Ciclo de animación completado');
      },
    });

    logger.debug('Animación GSAP creada exitosamente');
  }, [isVisible, thumbnails.length]);

  useEffect(() => {
    if (!isConfirmed || !loopUntilConfirm) return;
    if (!animationRef.current || !containerRef.current) return;
    if (hasAppliedRNG.current) return;

    logger.info('Contrato confirmado - determinando miner seleccionado');
    hasAppliedRNG.current = true;

    animationRef.current.kill();
    animationRef.current = null;

    let chosenIndex: number;
    if (selectedMinerIndex !== undefined && selectedMinerIndex !== null) {
      chosenIndex = Number(selectedMinerIndex);
      logger.info('Usando minerIndex REAL del contrato', { chosenIndex });
    } else {
      const random = Math.random() * 100;
      let cumulative = 0;
      chosenIndex = 0;
      for (let i = 0; i < minerData.length; i++) {
        cumulative += minerData[i].probability;
        if (random < cumulative) {
          chosenIndex = i;
          break;
        }
      }
      logger.warn('Usando RNG frontend (fallback)', { chosenIndex });
    }

    const selectedMiner = minerData[chosenIndex];
    const realMinerName = realMinerNames[chosenIndex] || selectedMiner.name;

    logger.info('Miner seleccionado para animación', {
      name: realMinerName,
      rarity: selectedMiner.rarity,
      power: selectedMiner.power,
      index: chosenIndex,
      source: selectedMinerIndex !== undefined ? 'contract' : 'frontend-rng',
    });

    const thumbnailWidth = 192;
    const gap = 16;
    const containerPadding = 16;
    const thumbnailTotalWidth = thumbnailWidth + gap;
    const rouletteContainer = containerRef.current.parentElement;
    if (!rouletteContainer) return;

    const containerCenter = rouletteContainer.getBoundingClientRect().width / 2;
    const targetCycle = 10;
    const thumbnailAbsoluteIndex = targetCycle * minerData.length + chosenIndex;
    const thumbnailLeftPosition = containerPadding + thumbnailAbsoluteIndex * thumbnailTotalWidth;
    const thumbnailCenterPosition = thumbnailLeftPosition + thumbnailWidth / 2;
    const finalPosition = thumbnailCenterPosition - containerCenter;

    logger.debug('Cálculo de posición final', { chosenIndex, targetCycle, thumbnailAbsoluteIndex, finalPosition });

    setSelectedIndex(chosenIndex);

    animationRef.current = gsap.to(containerRef.current, {
      x: -finalPosition,
      duration: 5,
      ease: 'power4.out',
      onComplete: () => {
        logger.info('Animación de desaceleración completada');
        setSelectedIndex(chosenIndex);

        setTimeout(() => {
          onComplete({
            id: BigInt(chosenIndex),
            minerId: BigInt(chosenIndex),
            name: realMinerName,
            rarity: selectedMiner.rarity,
            power: selectedMiner.power,
            efficiency: 100,
            category,
            minerType: axieClass,
            minerIndex: chosenIndex,
            axieClass,
            videoPath: '',
          });
        }, 1500);
      },
    });
  }, [isConfirmed, loopUntilConfirm, onComplete, minerData, realMinerNames, selectedMinerIndex]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(247,198,90,0.06),transparent_55%),radial-gradient(circle_at_50%_50%,rgba(125,249,255,0.04),transparent_70%)]" />

      <div className="relative mx-4 w-full max-w-4xl overflow-hidden border border-magma-gold/28 bg-black/92 shadow-[0_32px_100px_rgba(0,0,0,0.80),0_0_56px_rgba(247,198,90,0.08)] backdrop-blur-xl">
        {/* Inner gradient */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-cyan-300/5" />
        {/* Left accent */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/65 to-transparent" />

        {/* Header */}
        <div className="relative border-b border-cyan-100/10 px-8 py-6">
          <div className="flex items-center justify-center gap-3">
            <Egg className="h-5 w-5 text-magma-gold" />
            <h2 className="alchemy-heading text-2xl">Hatching Geode</h2>
          </div>
        </div>

        {/* Roulette */}
        <div className="relative px-8 py-6">
          {/* Center selection indicator — siblings of overflow container */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-6 left-1/2 z-10 -translate-x-px border-l border-dashed border-magma-gold/35"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 text-[10px] leading-none text-magma-gold"
          >
            ▼
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] leading-none text-magma-gold"
          >
            ▲
          </div>

          {/* Edge fade masks */}
          <div className="pointer-events-none absolute inset-y-6 left-8 z-10 w-28 bg-linear-to-r from-black/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-6 right-8 z-10 w-28 bg-linear-to-l from-black/95 to-transparent" />

          {/* Scrolling track */}
          <div className="relative h-80 overflow-hidden border border-cyan-100/8 bg-black/38">
            <div
              ref={containerRef}
              className="flex space-x-4 p-4"
              style={{ willChange: 'transform' }}
            >
              {Array.from({ length: 20 }).map((_, copyIndex) =>
                thumbnails.map((thumbPath, thumbIndex) => {
                  const isSelected = selectedIndex === thumbIndex && copyIndex === 10;
                  return (
                    <div
                      key={`${copyIndex}-${thumbIndex}`}
                      className={`flex shrink-0 w-48 flex-col transition-all duration-500 ${
                        isSelected ? 'z-30 scale-110' : ''
                      }`}
                    >
                      <div
                        className={`h-64 overflow-hidden border bg-black/42 transition-all duration-500 ${
                          isSelected
                            ? 'border-magma-gold/80 shadow-[0_0_34px_rgba(247,198,90,0.48)]'
                            : 'border-cyan-100/10'
                        }`}
                      >
                        <img
                          src={thumbPath}
                          alt={`Miner ${thumbIndex}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.error(`[HatchRoulette] Failed to load image: ${thumbPath}`);
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="flex h-full w-full items-center justify-center bg-black/60 text-xs text-red-400">Broken<br/>${thumbPath.split('/').pop()}</div>`;
                            }
                          }}
                        />
                      </div>
                      {/* Rarity bar */}
                      <div
                        className={`h-1.5 transition-all duration-300 ${getRarityBarClass(
                          minerData[thumbIndex % minerData.length]?.rarity || 'common',
                        )}`}
                      />
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        {/* Footer status */}
        <div className="relative border-t border-cyan-100/10 px-8 py-5 text-center">
          <div className="flex items-center justify-center gap-2.5 text-sm text-cyan-50/50">
            <span className="inline-block h-1.5 w-1.5 animate-pulse bg-magma-gold" />
            <span className="alchemy-copy tracking-wide">
              Waiting for blockchain confirmation…
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
