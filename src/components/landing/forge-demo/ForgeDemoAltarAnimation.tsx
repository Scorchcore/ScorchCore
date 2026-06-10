"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { FORGE_DEMO_ASSETS } from "@/lib/constants/forgeDemo";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const logger = createServiceLogger("ForgeDemoAltarAnimation");

interface ForgeDemoAltarAnimationProps {
  onComplete: () => void;
}

export default function ForgeDemoAltarAnimation({
  onComplete,
}: ForgeDemoAltarAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef<HTMLDivElement>(null);
  const rayoRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const energy = energyRef.current;
    const rayo = rayoRef.current;
    if (!container || !energy || !rayo) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      setTimeout(onComplete, 1500);
      return;
    }

    gsap.set(energy, { opacity: 0, scale: 0.95 });
    gsap.set(rayo, { opacity: 0, scale: 1.05, x: "-50%" });

    const tl = gsap.timeline({
      onComplete: () => {
        logger.info("Animación de altar completada");
        onComplete();
      },
    });

    // Fase 1: altar energía aparece con pulso
    tl.to(energy, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "power2.out",
    });

    // Fase 2: rayo aparece con flash
    tl.to(
      rayo,
      {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power4.out",
      },
      "-=0.2",
    );

    // Fase 3: pulso continuo del rayo
    tl.to(rayo, {
      opacity: 0.85,
      scale: 1.03,
      duration: 0.4,
      yoyo: true,
      repeat: 3,
      ease: "sine.inOut",
    });

    // Fase 4: intensificación final
    tl.to(
      rayo,
      {
        opacity: 1,
        scale: 1.08,
        duration: 0.3,
        ease: "power2.in",
      },
      "-=0.1",
    );

    tl.to(
      energy,
      {
        opacity: 0.9,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.in",
      },
      "-=0.3",
    );

    // Fase 5: fade out rápido para transición
    tl.to([energy, rayo], {
      opacity: 0,
      scale: 1.1,
      duration: 0.4,
      ease: "power2.in",
    });

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex aspect-video max-w-2xl items-center justify-center overflow-hidden border border-cyan-100/10 bg-black/60"
    >
      {/* Altar energía (fondo base) */}
      <div ref={energyRef} className="absolute inset-0">
        <Image
          src={FORGE_DEMO_ASSETS.altarEnergy}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 768px) 92vw, 672px"
        />
      </div>

      {/* Texto de estado */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 text-center">
        <p className="alchemy-eyebrow mb-1 text-[0.62rem]">Elemental Forge</p>
        <p className="alchemy-heading text-lg">Transmuting...</p>
      </div>
    </div>
  );
}
