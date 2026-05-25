"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

const emberCount = 22;
const runeMarks = ["ᚠ", "ᚱ", "ᚲ", "ᚷ", "ᛟ", "ᛞ"];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const stoneRef = useRef<HTMLDivElement>(null);
  const stoneImageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const eclipseRef = useRef<HTMLDivElement>(null);
  const sideRocksRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const frame = frameRef.current;
    const stone = stoneRef.current;
    const stoneImage = stoneImageRef.current;
    const glow = glowRef.current;
    const text = textRef.current;
    const eclipse = eclipseRef.current;
    const sideRocks = sideRocksRef.current;
    const particles = particlesRef.current;

    if (
      !section ||
      !frame ||
      !stone ||
      !stoneImage ||
      !glow ||
      !text ||
      !eclipse
    ) {
      return;
    }

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(min-width: 768px)", () => {
        gsap.set(stone, { xPercent: -50, yPercent: -47, scale: 1 });
        gsap.set(stoneImage, {
          filter:
            "brightness(1) saturate(1) drop-shadow(0 0 26px rgba(255,104,20,0.58)) drop-shadow(0 0 58px rgba(255,67,4,0.28))",
        });
        gsap.set(glow, { opacity: 1, scale: 1 });
        gsap.set(text, { opacity: 1, y: 0, filter: "blur(0px)" });
        gsap.set(eclipse, {
          opacity: 0,
          scale: 0.35,
          backgroundColor: "#000000",
        });
        gsap.set(frame, { opacity: 1 });
        if (sideRocks) gsap.set(sideRocks, { opacity: 1, scale: 1, y: 0 });
        if (particles) gsap.set(particles, { opacity: 1, y: 0 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            text,
            { opacity: 0, y: -72, filter: "blur(8px)", duration: 0.28 },
            0.05,
          )
          .to(
            stone,
            { scale: 2.35, yPercent: -48.5, duration: 0.74, ease: "none" },
            0,
          )
          .to(
            stoneImage,
            {
              opacity: 0.96,
              filter:
                "brightness(1.45) saturate(1.28) drop-shadow(0 0 58px rgba(255,128,22,0.84)) drop-shadow(0 0 120px rgba(255,68,0,0.52))",
              duration: 0.66,
              ease: "none",
            },
            0.03,
          )
          .to(
            glow,
            { opacity: 1, scale: 5.8, duration: 0.68, ease: "none" },
            0.02,
          )
          .to(
            sideRocks,
            {
              opacity: 0.28,
              scale: 1.08,
              y: -28,
              duration: 0.55,
              ease: "none",
            },
            0.08,
          )
          .to(
            particles,
            { opacity: 0.75, y: -72, duration: 0.6, ease: "none" },
            0.08,
          )
          .to(
            eclipse,
            {
              opacity: 0.58,
              scale: 1.65,
              backgroundColor: "#f06a12",
              duration: 0.18,
              ease: "none",
            },
            0.58,
          )
          .to(
            eclipse,
            {
              opacity: 0.96,
              scale: 2.8,
              backgroundColor: "#020607",
              duration: 0.22,
              ease: "none",
            },
            0.74,
          )
          .to(stoneImage, { opacity: 0.08, duration: 0.22, ease: "none" }, 0.72)
          .to(glow, { opacity: 0.05, duration: 0.2, ease: "none" }, 0.78)
          .to(frame, { opacity: 0, duration: 0.14, ease: "none" }, 0.94);

        return () => timeline.kill();
      });

      media.add("(max-width: 767px)", () => {
        gsap.set(stone, { xPercent: -50, yPercent: -50, scale: 1 });
        gsap.set(stoneImage, { opacity: 0.72 });
        gsap.set(text, { opacity: 1, y: 0, filter: "blur(0px)" });
        gsap.set(glow, { opacity: 0.9, scale: 1 });
        gsap.set(eclipse, {
          opacity: 0,
          scale: 0.45,
          backgroundColor: "#000000",
        });
        gsap.set(frame, { opacity: 1 });
        if (sideRocks) gsap.set(sideRocks, { opacity: 0.85, scale: 1 });
        if (particles) gsap.set(particles, { opacity: 0.75, y: 0 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .to(
            text,
            { opacity: 0, y: -36, filter: "blur(5px)", duration: 0.3 },
            0.05,
          )
          .to(
            stone,
            { scale: 1.62, yPercent: -50, duration: 0.64, ease: "none" },
            0,
          )
          .to(
            glow,
            { opacity: 0.95, scale: 2.05, duration: 0.62, ease: "none" },
            0.02,
          )
          .to(sideRocks, { opacity: 0.14, duration: 0.42, ease: "none" }, 0.15)
          .to(
            eclipse,
            {
              opacity: 0.5,
              scale: 1.4,
              backgroundColor: "#f06a12",
              duration: 0.18,
              ease: "none",
            },
            0.58,
          )
          .to(
            eclipse,
            {
              opacity: 0.95,
              scale: 2.35,
              backgroundColor: "#020607",
              duration: 0.24,
              ease: "none",
            },
            0.74,
          )
          .to(stoneImage, { opacity: 0.1, duration: 0.18, ease: "none" }, 0.76)
          .to(frame, { opacity: 0, duration: 0.12, ease: "none" }, 0.94);

        return () => timeline.kill();
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="scorch-hero-scroll alchemy-copy relative bg-deep-abyss text-white"
    >
      <div
        ref={frameRef}
        className="scorch-hero sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-deep-abyss px-4 pt-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(6,45,55,0.5)_0%,rgba(2,15,18,0.56)_30%,rgba(0,0,0,0.96)_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0)_38%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(ellipse_at_bottom,rgba(255,92,12,0.18)_0%,rgba(255,92,12,0.06)_34%,transparent_70%)]" />

        <div
          ref={sideRocksRef}
          className="absolute inset-0 z-20"
          aria-hidden="true"
        >
          <Image
            src="/assets/landing/cueva.webp"
            alt=""
            aria-hidden="true"
            width={1086}
            height={1448}
            priority
            className="pointer-events-none absolute bottom-[-4vh] left-[-42vw] z-20 h-[98vh] max-h-[980px] w-auto select-none object-contain opacity-95 drop-shadow-[0_0_34px_rgba(255,91,18,0.16)] sm:left-[-25vw] lg:left-[-7vw] xl:left-0"
          />
          <Image
            src="/assets/landing/cueva2.webp"
            alt=""
            aria-hidden="true"
            width={1024}
            height={1536}
            priority
            className="pointer-events-none absolute bottom-[-5vh] right-[-42vw] z-20 h-[100vh] max-h-[1000px] w-auto select-none object-contain opacity-95 drop-shadow-[0_0_34px_rgba(255,91,18,0.2)] sm:right-[-25vw] lg:right-[-7vw] xl:right-0"
          />
        </div>

        <div
          ref={particlesRef}
          className="scorch-hero__embers absolute inset-0 z-10"
          aria-hidden="true"
        >
          {Array.from({ length: emberCount }, (_, index) => (
            <span key={`ember-${index + 1}`} />
          ))}
        </div>

        <div className="absolute inset-0 z-10 opacity-45" aria-hidden="true">
          <div className="scorch-hero__circuit scorch-hero__circuit--left" />
          <div className="scorch-hero__circuit scorch-hero__circuit--right" />
          {runeMarks.map((rune) => (
            <span key={rune} className="scorch-hero__rune">
              {rune}
            </span>
          ))}
        </div>

        <div
          ref={stoneRef}
          className="scorch-hero__stone-wrap pointer-events-none absolute z-20 opacity-72"
        >
          <div
            ref={glowRef}
            className="absolute left-1/2 top-[68%] h-28 w-72 -translate-x-1/2 rounded-full bg-orange-500/25 blur-3xl md:h-36 md:w-[500px]"
          />
          <Image
            src="/assets/landing/piedra.webp"
            alt=""
            aria-hidden="true"
            width={986}
            height={842}
            priority
            ref={stoneImageRef}
            onLoad={() => ScrollTrigger.refresh()}
            className="scorch-hero__stone absolute inset-0 h-full w-full object-contain opacity-70 mix-blend-screen"
          />
        </div>
        <div
          ref={eclipseRef}
          className="scorch-hero__eclipse pointer-events-none absolute left-1/2 top-1/2 z-[25] h-[42vmax] w-[42vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black opacity-0 blur-xl"
        />

        <div className="relative z-30 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col items-center justify-center text-center">
          <div ref={textRef} className="relative z-10 max-w-5xl">
            <p className="alchemy-eyebrow mb-5 text-xs md:text-sm">
              ScorchCore Protocol
            </p>
            <h1 className="alchemy-heading-strong mx-auto max-w-5xl text-balance text-4xl leading-[1.02] drop-shadow-[0_0_28px_rgba(0,240,255,0.22)] sm:text-5xl md:text-7xl lg:text-8xl">
              Awaken your dormant assets and forge the future of Digital Alchemy
            </h1>
            <p className="alchemy-copy text-ethereal-cyan mx-auto mt-7 max-w-3xl text-pretty text-base leading-7 opacity-85 drop-shadow-[0_0_18px_rgba(0,0,0,0.9)] md:text-xl md:leading-8">
              A deflationary Forge & Collect-to-Earn Protocol with a programmed
              scarcity of 2.1 Billion $CORE tokens.
            </p>
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 h-12 w-px -translate-x-1/2 overflow-hidden bg-cyan-100/10">
            <span className="scorch-hero__scroll-line block h-1/2 w-px bg-orange-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
