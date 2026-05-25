"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

type TransmuteProps = {
  onTransmute?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

const assets = {
  background: {
    src: "/assets/landing/background-transmute.webp",
    width: 1672,
    height: 941,
  },
  center: {
    src: "/assets/landing/center-transmute.webp",
    width: 1536,
    height: 1024,
  },
  button: {
    src: "/assets/landing/buttom-transmute.webp",
    width: 1536,
    height: 1024,
  },
} as const;

export default function Transmute({
  onTransmute,
  disabled = false,
  ariaLabel = "Transmute",
}: TransmuteProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const background = backgroundRef.current;
    const center = centerRef.current;
    const action = actionRef.current;

    if (!section || !background || !center || !action) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([background, center, action], {
          clearProps: "all",
          opacity: 1,
          y: 0,
          scale: 1,
        });
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(background, { opacity: 0.18, scale: 1.08 });
        gsap.set(center, { opacity: 0, y: -96, scale: 0.94 });
        gsap.set(action, { opacity: 0, y: -28, scale: 0.96 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 74%",
            end: "center 42%",
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            background,
            { opacity: 1, scale: 1, duration: 0.62, ease: "none" },
            0,
          )
          .to(
            center,
            { opacity: 1, y: 0, scale: 1, duration: 0.58, ease: "power2.out" },
            0.18,
          )
          .to(
            action,
            { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "power2.out" },
            0.54,
          );

        return () => timeline.kill();
      });
    }, section);

    return () => context.revert();
  }, []);

  const handleClick = () => {
    if (!disabled) {
      onTransmute?.();
    }
  };

  return (
    <section
      ref={sectionRef}
      className="transmute-section alchemy-copy relative isolate overflow-hidden bg-deep-abyss text-white"
    >
      <div ref={backgroundRef} className="transmute-bg absolute inset-0 z-0">
        <Image
          src={assets.background.src}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="transmute-stage relative z-[2] mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-center justify-center px-5 py-20 md:px-8 md:py-24">
        <div ref={centerRef} className="transmute-center">
          <Image
            src={assets.center.src}
            alt=""
            aria-hidden="true"
            width={assets.center.width}
            height={assets.center.height}
            sizes="(max-width: 767px) 92vw, 62vw"
            className="h-auto w-full object-contain"
          />
        </div>

        <div ref={actionRef} className="transmute-action">
          <button
            type="button"
            className="transmute-button"
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={handleClick}
          >
            <Image
              src={assets.button.src}
              alt=""
              aria-hidden="true"
              width={assets.button.width}
              height={assets.button.height}
              sizes="(max-width: 767px) 72vw, 26vw"
              className="h-auto w-full object-contain"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
