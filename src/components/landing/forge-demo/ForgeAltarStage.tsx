"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { FORGE_DEMO_ASSETS } from "@/lib/constants/forgeDemo";

export type BeamPhase = "idle" | "growing" | "active" | "fading";
export type SealPhase = "dim" | "pulsing" | "intense";
export type SealSpin = "normal" | "fast";

interface ForgeAltarStageProps {
  beamPhase?: BeamPhase;
  sealPhase?: SealPhase;
  sealSpin?: SealSpin;
  children?: React.ReactNode;
}

export default function ForgeAltarStage({
  beamPhase = "idle",
  sealPhase = "dim",
  sealSpin = "normal",
  children,
}: ForgeAltarStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const altarRef = useRef<HTMLDivElement>(null);
  const beamTweenRef = useRef<gsap.core.Tween | null>(null);
  const flickerRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);

  /* ── Seal continuous rotation (full opacity, no fade) ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const seal = sealRef.current;
    if (!seal || prefersReduced) return;

    const ctx = gsap.context(() => {
      // Reveal to full opacity once and keep it (only spin afterwards)
      gsap.to(seal, { opacity: 1, duration: 0.6, ease: "power2.out" });

      // Continuous rotation; speed controlled via timeScale
      spinTweenRef.current = gsap.to(seal, {
        rotation: "+=360",
        duration: 45,
        repeat: -1,
        ease: "none",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /* ── Seal spin speed (normal ↔ fast) ramps smoothly ── */
  useEffect(() => {
    const tween = spinTweenRef.current;
    if (!tween) return;
    // fast ≈ 7x faster than normal
    const target = sealSpin === "fast" ? 7 : 1;
    gsap.to(tween, { timeScale: target, duration: 0.8, ease: "power2.inOut" });
  }, [sealSpin]);

  /* ── Seal brightness per phase (steady, no fade) ── */
  useEffect(() => {
    const seal = sealRef.current;
    if (!seal) return;
    const brightness =
      sealPhase === "intense" ? 1.6 : sealPhase === "pulsing" ? 1.25 : 1;
    gsap.to(seal, {
      filter: `brightness(${brightness})`,
      duration: 0.8,
      ease: "power2.out",
    });
  }, [sealPhase]);

  /* ── Beam grow / flicker / fade ── */
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const beam = beamRef.current;
    const altar = altarRef.current;
    if (!beam || !altar || prefersReduced) return;

    // Kill previous
    if (beamTweenRef.current) beamTweenRef.current.kill();
    if (flickerRef.current) flickerRef.current.kill();

    const ctx = gsap.context(() => {
      if (beamPhase === "idle") {
        gsap.set(beam, { opacity: 0, scaleY: 0.3, scaleX: 0.95 });
      } else if (beamPhase === "growing") {
        // One-shot grow from emitter
        beamTweenRef.current = gsap.fromTo(
          beam,
          { opacity: 0, scaleY: 0.15, scaleX: 0.92 },
          {
            opacity: 1,
            scaleY: 1,
            scaleX: 1,
            duration: 1.2,
            ease: "power2.out",
          },
        );
      } else if (beamPhase === "active") {
        gsap.set(beam, { opacity: 1, scaleY: 1, scaleX: 1 });
        // Very subtle steady flicker — no scale bounce
        flickerRef.current = gsap.to(beam, {
          opacity: 0.92,
          duration: 0.15,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else if (beamPhase === "fading") {
        beamTweenRef.current = gsap.to(beam, {
          opacity: 0,
          scaleY: 0.6,
          scaleX: 0.95,
          duration: 0.7,
          ease: "power2.in",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [beamPhase]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-md select-none sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
      style={{ aspectRatio: "3 / 2" }}
    >
      {/* Sello energía — behind altar, centered & responsive */}
      <div
        className="pointer-events-none absolute z-10 flex items-center justify-center"
        style={{
          top: "50%",
          left: "50%",
          width: "140%",
          height: "140%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          ref={sealRef}
          className="relative h-[50%] min-w-[50%] opacity-0 aspect-square"
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src={FORGE_DEMO_ASSETS.altarEnergy}
            alt=""
            fill
            className="object-contain aspect-square"
            sizes="(max-width: 640px) 92vw, (max-width: 768px) 80vw, 672px "
            unoptimized
          />
        </div>
      </div>

      {/* Beam — grows from emitter area */}
      <div
        ref={beamRef}
        className="pointer-events-none absolute inset-0 z-20 opacity-0 min-h-32 max-h-[60%] top-1/8"
        style={{
          willChange: "transform, opacity",
          transformOrigin: "50% 58%",
        }}
      >
        <Image
          src={FORGE_DEMO_ASSETS.rayoAltar}
          alt=""
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Altar base */}
      <div
        ref={altarRef}
        className="absolute inset-0 z-30"
        style={{ willChange: "transform" }}
      >
        <Image
          src={FORGE_DEMO_ASSETS.altar}
          alt="Altar de forja"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 92vw, (max-width: 768px) 80vw, 672px"
          priority
          unoptimized
        />
      </div>

      {/* Floating content slot */}
      <div className="absolute inset-0 z-40 overflow-hidden">{children}</div>
    </div>
  );
}
