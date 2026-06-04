"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import type { GeodeCategory, AxieClass } from "@/lib/constants/geodes";
import {
  getThumbnailPath,
  getStorageUrl,
  getThumbnailFilename,
} from "@/lib/constants/storagePaths";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import { Egg } from "lucide-react";

const logger = createServiceLogger("ForgeDemoRoulette");

interface ForgeDemoRouletteProps {
  category: GeodeCategory;
  axieClass: AxieClass;
  onComplete: (minerIndex: number) => void;
  compact?: boolean;
  /** If provided, the roulette will land on this index instead of a new random one */
  preselectedIndex?: number;
}

const getThumbnails = (
  category: GeodeCategory,
  axieClass: AxieClass,
): string[] => {
  const thumbnails: string[] = [];
  for (let i = 0; i < 7; i++) {
    const filename = getThumbnailFilename(category, axieClass, i);
    if (filename) {
      thumbnails.push(
        getStorageUrl(getThumbnailPath(category, axieClass, filename)),
      );
    } else {
      logger.warn("Missing thumbnail mapping", {
        category,
        axieClass,
        minerIndex: i,
      });
    }
  }
  return thumbnails;
};

const getRarityBarClass = (index: number): string => {
  const classes = [
    "bg-cyan-900/55", // common
    "bg-cyan-900/55",
    "bg-ethereal-cyan/45", // rare
    "bg-ethereal-cyan/45",
    "bg-emerald-400/45", // very-rare
    "bg-emerald-400/45",
    "bg-magma-orange/55", // epic
  ];
  return classes[index] || "bg-cyan-900/55";
};

export default function ForgeDemoRoulette({
  category,
  axieClass,
  onComplete,
  compact = false,
  preselectedIndex,
}: ForgeDemoRouletteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const hasStopped = useRef(false);
  const winnerIndexRef = useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const thumbnails = getThumbnails(category, axieClass);

  const [metrics, setMetrics] = useState({
    thumbnailWidth: compact ? 144 : 192,
    gap: 16,
  });

  // Measure real thumbnail width + gap via ResizeObserver
  useEffect(() => {
    if (!firstItemRef.current) return;

    const measure = () => {
      const item = firstItemRef.current;
      if (!item) return;
      const rect = item.getBoundingClientRect();
      setMetrics({
        thumbnailWidth: rect.width,
        gap: 16, // space-x-4 is always 16px in Tailwind
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(firstItemRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const rouletteItems = useMemo(() => {
    const items: { id: string; thumbPath: string; thumbIndex: number }[] = [];
    for (let copyIndex = 0; copyIndex < 100; copyIndex++) {
      for (let thumbIndex = 0; thumbIndex < thumbnails.length; thumbIndex++) {
        items.push({
          id: `thumb-${copyIndex}-${thumbIndex}`,
          thumbPath: thumbnails[thumbIndex],
          thumbIndex,
        });
      }
    }
    return items;
  }, [thumbnails]);

  // Determinar índice ganador (use preselected if provided)
  useEffect(() => {
    const next =
      preselectedIndex !== undefined && preselectedIndex >= 0
        ? preselectedIndex
        : Math.floor(Math.random() * 7);
    logger.info("Ruleta winnerIndex set", {
      preselectedIndex,
      next,
    });
    winnerIndexRef.current = next;
  }, [preselectedIndex]);

  useEffect(() => {
    hasStopped.current = false;
    setSelectedIndex(null);

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
      hasStopped.current = false;
    };
  }, []);

  // Infinite-scroll loop animation (recreated when metrics change)
  useEffect(() => {
    if (!containerRef.current) return;
    if (hasStopped.current) return;

    const { thumbnailWidth, gap } = metrics;
    const itemsPerCycle = thumbnails.length;
    const cycleWidth = itemsPerCycle * (thumbnailWidth + gap);

    // Kill previous loop if metrics changed mid-animation
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;
    }

    animationRef.current = gsap.to(containerRef.current, {
      x: -cycleWidth,
      duration: 2.5,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x: string) => {
          const numX = parseFloat(x);
          return `${numX % -cycleWidth}px`;
        },
      },
    });

    // Auto-stop after ~4 seconds
    const stopTimer = setTimeout(() => {
      if (hasStopped.current || !animationRef.current || !containerRef.current)
        return;
      hasStopped.current = true;

      const chosenIndex =
        winnerIndexRef.current ?? Math.floor(Math.random() * 7);
      logger.info("Demo ruleta deteniéndose", {
        chosenIndex,
        winnerIndex: winnerIndexRef.current,
      });

      animationRef.current.kill();
      animationRef.current = null;

      const { thumbnailWidth, gap } = metrics;
      const containerPadding = 16;
      const itemsPerCycle = thumbnails.length;
      const cycleWidth = itemsPerCycle * (thumbnailWidth + gap);
      const rouletteContainer = containerRef.current.parentElement;
      if (!rouletteContainer) return;

      const containerCenter =
        rouletteContainer.getBoundingClientRect().width / 2;
      const targetCycle = 20;
      const thumbnailLeftPosition =
        containerPadding +
        targetCycle * cycleWidth +
        chosenIndex * (thumbnailWidth + gap);
      const thumbnailCenterPosition =
        thumbnailLeftPosition + thumbnailWidth / 2;
      const finalPosition = thumbnailCenterPosition - containerCenter;

      setSelectedIndex(chosenIndex);

      animationRef.current = gsap.to(containerRef.current, {
        x: -finalPosition,
        duration: 5,
        ease: "power4.out",
        onComplete: () => {
          logger.info("Demo ruleta completada");
          setTimeout(() => {
            onComplete(chosenIndex);
          }, 1200);
        },
      });
    }, 4000);

    return () => clearTimeout(stopTimer);
  }, [metrics, thumbnails.length, onComplete]);

  const realMinerNames = thumbnails.map((path) => {
    const fileName = path.split("/").pop() || "";
    return fileName
      .replace(/-thumbnail\.webp$/i, "")
      .replace(/\.png$/i, "")
      .replace(/\.webp$/i, "");
  });

  const panelCn = compact
    ? "max-w-2xl border border-magma-gold/18 bg-black/80 shadow-[0_16px_48px_rgba(0,0,0,0.60),0_0_32px_rgba(247,198,90,0.06)]"
    : "max-w-4xl border border-magma-gold/28 bg-black/92 shadow-[0_32px_100px_rgba(0,0,0,0.80),0_0_56px_rgba(247,198,90,0.08)]";
  const padCn = compact
    ? "px-4 py-2.5 md:px-6 md:py-3"
    : "px-6 py-4 md:px-8 md:py-6";
  const trackH = compact ? "h-44 md:h-56" : "h-64 md:h-80";
  const thumbW = compact ? "w-32 sm:w-36" : "w-48";
  const thumbH = compact ? "h-36 md:h-44" : "h-52 md:h-64";

  return (
    <div className={`relative mx-auto w-full overflow-hidden ${panelCn}`}>
      {/* Inner gradient */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-cyan-300/5" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/65 to-transparent" />

      {/* Header */}
      <div className={`relative border-b border-cyan-100/10 ${padCn}`}>
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <Egg
            className={`text-magma-gold ${compact ? "h-4 w-4" : "h-5 w-5"}`}
          />
          <h2
            className={`alchemy-heading ${compact ? "text-base md:text-lg" : "text-xl md:text-2xl"}`}
          >
            Abriendo Geoda
          </h2>
        </div>
      </div>

      {/* Roulette */}
      <div className={`relative ${padCn}`}>
        {/* Center selection indicator */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-4 left-1/2 z-10 -translate-x-px border-l border-dashed border-magma-gold/35 md:inset-y-6"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 text-[10px] leading-none text-magma-gold md:top-6"
        >
          ▼
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-[10px] leading-none text-magma-gold md:bottom-6"
        >
          ▲
        </div>

        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-4 left-6 z-10 w-20 bg-linear-to-r from-black/95 to-transparent md:inset-y-6 md:left-8 md:w-28" />
        <div className="pointer-events-none absolute inset-y-4 right-6 z-10 w-20 bg-linear-to-l from-black/95 to-transparent md:inset-y-6 md:right-8 md:w-28" />

        {/* Scrolling track */}
        <div
          className={`relative ${trackH} overflow-hidden border border-cyan-100/8 bg-black/38`}
        >
          <div
            ref={containerRef}
            className="flex space-x-4 p-4"
            style={{ willChange: "transform" }}
          >
            {rouletteItems.map((item, idx) => {
              const isSelected =
                selectedIndex === item.thumbIndex &&
                item.id.startsWith("thumb-20-");
              return (
                <div
                  key={item.id}
                  ref={idx === 0 ? firstItemRef : undefined}
                  className={`flex ${thumbW} shrink-0 flex-col transition-all duration-500 ${
                    isSelected ? "z-30 scale-110" : ""
                  }`}
                >
                  <div
                    className={`relative ${thumbH} overflow-hidden border bg-black/42 transition-all duration-500 ${
                      isSelected
                        ? "border-magma-gold/80 shadow-[0_0_34px_rgba(247,198,90,0.48)]"
                        : "border-cyan-100/10"
                    }`}
                  >
                    <Image
                      src={item.thumbPath}
                      alt={`Miner ${item.thumbIndex}`}
                      fill
                      className="object-cover"
                      sizes="192px"
                      unoptimized
                      onError={() => {
                        // Fallback handled by empty state
                      }}
                    />
                  </div>
                  {/* Rarity bar */}
                  <div
                    className={`h-1.5 transition-all duration-300 ${getRarityBarClass(
                      item.thumbIndex,
                    )}`}
                  />
                  {/* Name */}
                  <p className="mt-1 truncate text-center text-[0.6rem] text-cyan-50/50">
                    {realMinerNames[item.thumbIndex] ||
                      `Miner ${item.thumbIndex}`}
                  </p>
                </div>
              );
            })}
            ,
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div
        className={`relative border-t border-cyan-100/10 text-center ${padCn}`}
      >
        <div className="flex items-center justify-center gap-2.5 text-sm text-cyan-50/50">
          <span className="inline-block h-1.5 w-1.5 animate-pulse bg-magma-gold" />
          <span className="alchemy-copy tracking-wide">
            {selectedIndex !== null
              ? "¡Resultado revelado!"
              : "Esperando destino cristalino..."}
          </span>
        </div>
      </div>
    </div>
  );
}
