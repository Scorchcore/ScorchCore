"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const logger = createServiceLogger("ForgeTriadAnimation");

export interface TriadPoint {
  /** X position as percentage (0-100) of the stage width */
  x: number;
  /** Y position as percentage (0-100) of the stage height */
  y: number;
}

interface ForgeTriadAnimationProps {
  /** The three vertices of the triad (axie, memento, geode) in % coords */
  axie: TriadPoint;
  memento: TriadPoint;
  geode: TriadPoint;
  /** Center of the altar where converging traces meet (% coords) */
  center?: TriadPoint;
  /** Fired when the convergence traces reach the center (peak energy) */
  onConverge?: () => void;
  /** Fired when the whole animation is finished */
  onComplete?: () => void;
}

/* Convert % coords (0-100) to SVG viewBox coords (0-300 x 0-200) */
function toSvg(p: TriadPoint) {
  return { x: p.x * 3, y: p.y * 2 };
}

/* Euclidean distance */
function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/**
 * SVG overlay that traces a glowing triangle between three vertices, then
 * sends a converging trace from each vertex toward the altar center.
 * RAYO_ALTAR.png sprites travel along the edges and burst at the center.
 * ViewBox 300x200 matches the stage aspect ratio (3:2) so rotations are clean.
 */
export default function ForgeTriadAnimation({
  axie,
  memento,
  geode,
  center = { x: 50, y: 55 },
  onConverge,
  onComplete,
}: ForgeTriadAnimationProps) {
  const rootRef = useRef<SVGSVGElement>(null);
  const edgeAMRef = useRef<SVGPathElement>(null);
  const edgeMGRef = useRef<SVGPathElement>(null);
  const edgeGARef = useRef<SVGPathElement>(null);
  const convARef = useRef<SVGLineElement>(null);
  const convMRef = useRef<SVGLineElement>(null);
  const convGRef = useRef<SVGLineElement>(null);

  const spriteAMRef = useRef<SVGImageElement>(null);
  const spriteMGRef = useRef<SVGImageElement>(null);
  const spriteGARef = useRef<SVGImageElement>(null);
  const spriteCenterRef = useRef<SVGImageElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const onConvergeRef = useRef(onConverge);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onConvergeRef.current = onConverge;
    onCompleteRef.current = onComplete;
  }, [onConverge, onComplete]);

  /* ── Sprite geometry (pre-calculated, stable) ── */
  const aSvg = toSvg(axie);
  const mSvg = toSvg(memento);
  const gSvg = toSvg(geode);
  const cSvg = toSvg(center);

  const distAM = dist(aSvg, mSvg);
  const distMG = dist(mSvg, gSvg);
  const distGA = dist(gSvg, aSvg);
  const edgeH = 26;

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const edges = [edgeAMRef.current, edgeMGRef.current, edgeGARef.current];
    const convs = [convARef.current, convMRef.current, convGRef.current];
    const sprites = [
      spriteAMRef.current,
      spriteMGRef.current,
      spriteGARef.current,
      spriteCenterRef.current,
    ];

    if (prefersReduced) {
      for (const el of [...edges, ...convs]) {
        if (el) gsap.set(el, { strokeDashoffset: 0, opacity: 1 });
      }
      for (const el of sprites) {
        if (el) gsap.set(el, { opacity: 0.8 });
      }
      onConvergeRef.current?.();
      const t = setTimeout(() => onCompleteRef.current?.(), 400);
      return () => clearTimeout(t);
    }

    // Defer to next frame so SVG layout is ready and avoid forced reflow blocking UI
    let ctx: gsap.Context | undefined;
    const raf = requestAnimationFrame(() => {
      const t0 = performance.now();
      logger.info("Triad animation iniciando");

      ctx = gsap.context(() => {
        try {
          // Prepare dash strokes
          for (const el of edges) {
            if (!el) continue;
            let len = 100;
            try {
              len = el.getTotalLength();
            } catch {
              /* fallback if SVG not ready */
            }
            gsap.set(el, {
              strokeDasharray: len,
              strokeDashoffset: len,
              opacity: 1,
            });
          }
          for (const el of convs) {
            if (!el) continue;
            let len = 100;
            try {
              len = (el as SVGGeometryElement).getTotalLength();
            } catch {
              /* fallback */
            }
            gsap.set(el, {
              strokeDasharray: len,
              strokeDashoffset: len,
              opacity: 0,
            });
          }
          // Hide sprites initially
          for (const el of sprites) {
            if (el) gsap.set(el, { opacity: 0 });
          }

          const tl = gsap.timeline();
          tlRef.current = tl;

          // Phase A: trace triangle + travel edge sprites one by one
          tl.to(edgeAMRef.current, {
            strokeDashoffset: 0,
            duration: 0.55,
            ease: "power2.inOut",
          })
            .fromTo(
              spriteAMRef.current,
              { attr: { y: -edgeH / 2 }, opacity: 0 },
              {
                attr: { y: distAM - edgeH / 2 },
                opacity: 0.9,
                duration: 0.55,
                ease: "power2.inOut",
              },
              "<",
            )
            .to(edgeMGRef.current, {
              strokeDashoffset: 0,
              duration: 0.55,
              ease: "power2.inOut",
            })
            .fromTo(
              spriteMGRef.current,
              { attr: { y: -edgeH / 2 }, opacity: 0 },
              {
                attr: { y: distMG - edgeH / 2 },
                opacity: 0.9,
                duration: 0.55,
                ease: "power2.inOut",
              },
              "<",
            )
            .to(edgeGARef.current, {
              strokeDashoffset: 0,
              duration: 0.55,
              ease: "power2.inOut",
            })
            .fromTo(
              spriteGARef.current,
              { attr: { y: -edgeH / 2 }, opacity: 0 },
              {
                attr: { y: distGA - edgeH / 2 },
                opacity: 0.9,
                duration: 0.55,
                ease: "power2.inOut",
              },
              "<",
            );

          // Small hold
          tl.to({}, { duration: 0.2 });

          // Phase B: converge + center sprite burst
          tl.to(
            convs,
            {
              opacity: 1,
              strokeDashoffset: 0,
              duration: 0.7,
              ease: "power3.in",
            },
            "converge",
          );

          tl.to(
            spriteCenterRef.current,
            {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "back.out(1.4)",
              transformOrigin: "50% 50%",
              onComplete: () => onConvergeRef.current?.(),
            },
            "converge",
          );

          // Fade everything out
          tl.to(
            [...edges, ...convs, ...sprites],
            {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => onCompleteRef.current?.(),
            },
            ">+0.25",
          );
        } catch (err) {
          logger.error("GSAP error en triad animation", { err });
          onConvergeRef.current?.();
          onCompleteRef.current?.();
        }
      }, rootRef);

      logger.info("Triad animation timeline creada", {
        elapsedMs: Math.round(performance.now() - t0),
      });
    });

    // Pause/resume when user switches tabs to avoid RAF throttling glitches
    const handleVis = () => {
      if (document.hidden) {
        tlRef.current?.pause();
      } else {
        tlRef.current?.resume();
      }
    };
    document.addEventListener("visibilitychange", handleVis);

    return () => {
      document.removeEventListener("visibilitychange", handleVis);
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [distAM, distGA, distMG]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 300 200"
      className="pointer-events-none absolute inset-0 z-100 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <title>Forge triad animation</title>
      <defs>
        <linearGradient id="triad-fire" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7c65a" />
          <stop offset="55%" stopColor="#f06a12" />
          <stop offset="100%" stopColor="#ff3d00" />
        </linearGradient>
        <filter id="triad-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="triad-glow-strong"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Faint full triangle guide */}
      <path
        d={`M ${aSvg.x} ${aSvg.y} L ${mSvg.x} ${mSvg.y} L ${gSvg.x} ${gSvg.y} Z`}
        fill="rgba(240,106,18,0.04)"
        stroke="none"
      />

      {/* Strong white glow behind triangle edges */}
      <g
        stroke="#f7c65a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.35"
        fill="none"
        filter="url(#triad-glow-strong)"
      >
        <path d={`M ${aSvg.x} ${aSvg.y} L ${mSvg.x} ${mSvg.y}`} />
        <path d={`M ${mSvg.x} ${mSvg.y} L ${gSvg.x} ${gSvg.y}`} />
        <path d={`M ${gSvg.x} ${gSvg.y} L ${aSvg.x} ${aSvg.y}`} />
      </g>

      <g
        stroke="url(#triad-fire)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#triad-glow)"
        vectorEffect="non-scaling-stroke"
      >
        {/* Triangle edges */}
        <path
          ref={edgeAMRef}
          d={`M ${aSvg.x} ${aSvg.y} L ${mSvg.x} ${mSvg.y}`}
        />
        <path
          ref={edgeMGRef}
          d={`M ${mSvg.x} ${mSvg.y} L ${gSvg.x} ${gSvg.y}`}
        />
        <path
          ref={edgeGARef}
          d={`M ${gSvg.x} ${gSvg.y} L ${aSvg.x} ${aSvg.y}`}
        />

        {/* Converging traces toward center */}
        <line ref={convARef} x1={aSvg.x} y1={aSvg.y} x2={cSvg.x} y2={cSvg.y} />
        <line ref={convMRef} x1={mSvg.x} y1={mSvg.y} x2={cSvg.x} y2={cSvg.y} />
        <line ref={convGRef} x1={gSvg.x} y1={gSvg.y} x2={cSvg.x} y2={cSvg.y} />
      </g>
    </svg>
  );
}
