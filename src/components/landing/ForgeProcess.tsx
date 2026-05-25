"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

const assets = {
  comparison: {
    src: "/assets/landing/burn-vs-transmutation-bar.webp",
    width: 1536,
    height: 1024,
  },
  input: {
    src: "/assets/landing/input-ice-chamber.webp",
    width: 828,
    height: 743,
  },
  forge: {
    src: "/assets/landing/alchemical-forge-core.webp",
    width: 812,
    height: 748,
  },
  coldStream: {
    src: "/assets/landing/energy-stream-cyan-purple.webp",
    width: 619,
    height: 108,
  },
  geode: {
    src: "/assets/landing/vessel-geode.webp",
    width: 756,
    height: 799,
  },
  hotStream: {
    src: "/assets/landing/energy-stream-orange.webp",
    width: 595,
    height: 160,
  },
  rebirth: {
    src: "/assets/landing/rebirth-coreminer-creature.webp",
    width: 812,
    height: 776,
  },
  fireBurst: {
    src: "/assets/landing/rebirth-fire-burst.webp",
    width: 279,
    height: 188,
  },
  cardFrame: {
    src: "/assets/landing/process-card-frame.webp",
    width: 475,
    height: 213,
  },
} as const;

const phases = [
  {
    eyebrow: "Phase 1",
    title: "Input / Eco-Stasis",
    body: "Dormant assets are submitted to the Treasury.",
  },
  {
    eyebrow: "Phase 2",
    title: "Alchemical Forge",
    body: "Sacred alchemy distills the vital essence.",
  },
  {
    eyebrow: "Phase 3",
    title: "The Vessel",
    body: "The Alchemical Geode receives and condenses the transmuted essence.",
  },
  {
    eyebrow: "Phase 4",
    title: "Rebirth",
    body: "The dormant asset returns as an active CoreMiner.",
  },
] as const;

export default function ForgeProcess() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(min-width: 768px)", () => {
        const stage = section.querySelector<HTMLElement>(
          ".forge-process-stage",
        );
        const machine = section.querySelector<HTMLElement>(
          ".forge-process-machine",
        );
        const input = section.querySelector<HTMLElement>(
          ".forge-process-input",
        );
        const coldStream = section.querySelector<HTMLElement>(
          ".forge-process-stream-cold",
        );
        const forge = section.querySelector<HTMLElement>(
          ".forge-process-forge",
        );
        const mixedColdStream = section.querySelector<HTMLElement>(
          ".forge-process-stream-mix-cold",
        );
        const mixedHotStream = section.querySelector<HTMLElement>(
          ".forge-process-stream-mix-hot",
        );
        const geode = section.querySelector<HTMLElement>(
          ".forge-process-geode",
        );
        const hotStream = section.querySelector<HTMLElement>(
          ".forge-process-stream-hot",
        );
        const fire = section.querySelector<HTMLElement>(".forge-process-fire");
        const rebirth = section.querySelector<HTMLElement>(
          ".forge-process-rebirth",
        );
        const card = section.querySelector<HTMLElement>(".forge-process-card");
        const cardItems = Array.from(
          section.querySelectorAll<HTMLElement>(".forge-process-card-item"),
        );
        const closing = section.querySelector<HTMLElement>(
          ".forge-process-closing",
        );

        if (
          !stage ||
          !machine ||
          !input ||
          !coldStream ||
          !forge ||
          !mixedColdStream ||
          !mixedHotStream ||
          !geode ||
          !hotStream ||
          !fire ||
          !rebirth ||
          !card ||
          !closing ||
          cardItems.length !== phases.length
        ) {
          return undefined;
        }

        gsap.set(stage, { opacity: 1 });
        gsap.set(machine, { opacity: 1 });
        gsap.set(
          [
            input,
            coldStream,
            forge,
            mixedColdStream,
            mixedHotStream,
            geode,
            hotStream,
            fire,
            rebirth,
            card,
            closing,
          ],
          { opacity: 0 },
        );
        gsap.set([input, forge, geode, rebirth], { y: 36, scale: 0.96 });
        gsap.set([coldStream, mixedColdStream, mixedHotStream, hotStream], {
          clipPath: "inset(0 100% 0 0)",
        });
        gsap.set(fire, { scale: 0.72 });
        gsap.set(cardItems, { opacity: 0, y: 12 });
        gsap.set(cardItems[0], { opacity: 1, y: 0 });

        const showCard = (
          index: number,
          at: number,
          timeline: gsap.core.Timeline,
        ) => {
          cardItems.forEach((item, itemIndex) => {
            timeline.to(
              item,
              {
                opacity: itemIndex === index ? 1 : 0,
                y: itemIndex === index ? 0 : 12,
                duration: 0.08,
              },
              at,
            );
          });
        };

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=320%",
            scrub: 1,
          },
        });

        timeline
          .to(
            [input, card],
            { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: "power2.out" },
            0,
          )
          .to(
            coldStream,
            {
              opacity: 1,
              clipPath: "inset(0 0% 0 0)",
              duration: 0.13,
              ease: "none",
            },
            0.22,
          )
          .to(
            forge,
            { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: "none" },
            0.34,
          )
          .to(
            forge,
            {
              filter:
                "drop-shadow(0 0 42px rgba(125,249,255,0.55)) drop-shadow(0 0 68px rgba(134,75,255,0.32))",
              duration: 0.14,
              ease: "none",
            },
            0.39,
          )
          .to(
            input,
            { opacity: 0.62, scale: 0.94, duration: 0.14, ease: "none" },
            0.42,
          )
          .to(
            mixedColdStream,
            {
              opacity: 0.72,
              clipPath: "inset(0 0% 0 0)",
              duration: 0.12,
              ease: "none",
            },
            0.48,
          )
          .to(
            mixedHotStream,
            {
              opacity: 0.8,
              clipPath: "inset(0 0% 0 0)",
              duration: 0.12,
              ease: "none",
            },
            0.51,
          )
          .to(
            geode,
            { opacity: 0.72, y: 0, scale: 0.98, duration: 0.1, ease: "none" },
            0.54,
          )
          .to(
            geode,
            {
              opacity: 1,
              scale: 1.04,
              filter:
                "drop-shadow(0 0 30px rgba(240,106,18,0.72)) drop-shadow(0 0 68px rgba(247,198,90,0.36))",
              duration: 0.13,
              ease: "none",
            },
            0.6,
          )
          .to(
            forge,
            { opacity: 0.7, scale: 0.98, duration: 0.12, ease: "none" },
            0.62,
          )
          .to(
            hotStream,
            {
              opacity: 1,
              clipPath: "inset(0 0% 0 0)",
              duration: 0.12,
              ease: "none",
            },
            0.7,
          )
          .to(
            [coldStream, mixedColdStream],
            { opacity: 0.22, duration: 0.14, ease: "none" },
            0.73,
          )
          .to(
            fire,
            { opacity: 0.86, scale: 1.08, duration: 0.1, ease: "none" },
            0.78,
          )
          .to(
            rebirth,
            { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: "power2.out" },
            0.82,
          )
          .to(
            rebirth,
            {
              filter:
                "drop-shadow(0 0 34px rgba(125,249,255,0.48)) drop-shadow(0 0 54px rgba(240,106,18,0.34))",
              duration: 0.1,
              ease: "none",
            },
            0.88,
          );

        showCard(1, 0.34, timeline);
        showCard(2, 0.56, timeline);
        showCard(3, 0.82, timeline);

        ScrollTrigger.refresh();

        return () => timeline.kill();
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="forge-process-section alchemy-copy relative bg-deep-abyss text-white"
    >
      <div className="forge-process-intro hidden md:block">
        <div className="mx-auto flex min-h-[82vh] w-full max-w-7xl flex-col justify-start px-8 pb-8 pt-24">
          <div className="forge-process-comparison relative mx-auto w-[min(76vw,920px)]">
            <Image
              src={assets.comparison.src}
              alt=""
              aria-hidden="true"
              width={assets.comparison.width}
              height={assets.comparison.height}
              className="forge-process-comparison-image h-auto w-full object-contain"
            />
            <div className="forge-process-burn-copy absolute left-[21%] top-[30%] z-2 w-[27%] -translate-y-1/2 text-center">
              <h3 className="alchemy-heading text-lg leading-none xl:text-xl">
                Burn-to-Void
              </h3>
              <p className="mt-1.5 font-serif text-sm font-semibold leading-none text-white/88 xl:text-base">
                (Destruction)
              </p>
            </div>
            <div className="forge-process-transmute-copy absolute left-[56%] top-[30%] z-2 w-[32%] -translate-y-1/2 text-center">
              <h3 className="alchemy-heading-strong text-lg leading-none xl:text-xl">
                Forge-to-Reactivate
              </h3>
              <p className="mt-1.5 font-serif text-sm font-semibold leading-none text-white/88 xl:text-base">
                (Transmutation)
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p className="alchemy-eyebrow mb-4 text-xs">
              Transformation, Not Destruction
            </p>
            <h2 className="alchemy-heading text-3xl leading-tight xl:text-4xl">
              ScorchCore reactivates dormant assets through digital alchemy.
            </h2>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-4xl grid-cols-2 gap-8">
            <p className="alchemy-copy max-w-sm text-sm leading-6 text-white/58">
              Burning removes value from the loop and leaves the asset story
              unfinished.
            </p>
            <p className="alchemy-copy ml-auto max-w-sm text-right text-sm leading-6 text-white/72">
              Transmutation preserves the origin and moves that dormant energy
              into the next form.
            </p>
          </div>
        </div>
      </div>

      <div className="forge-process-stage sticky top-0 hidden h-screen overflow-hidden md:block">
        <div className="forge-process-machine absolute inset-0 z-4">
          <Image
            src={assets.input.src}
            alt=""
            aria-hidden="true"
            width={assets.input.width}
            height={assets.input.height}
            className="forge-process-node forge-process-input"
          />
          <Image
            src={assets.coldStream.src}
            alt=""
            aria-hidden="true"
            width={assets.coldStream.width}
            height={assets.coldStream.height}
            className="forge-process-stream forge-process-stream-cold"
          />
          <Image
            src={assets.forge.src}
            alt=""
            aria-hidden="true"
            width={assets.forge.width}
            height={assets.forge.height}
            className="forge-process-node forge-process-forge"
          />
          <Image
            src={assets.coldStream.src}
            alt=""
            aria-hidden="true"
            width={assets.coldStream.width}
            height={assets.coldStream.height}
            className="forge-process-stream forge-process-stream-mix-cold"
          />
          <Image
            src={assets.hotStream.src}
            alt=""
            aria-hidden="true"
            width={assets.hotStream.width}
            height={assets.hotStream.height}
            className="forge-process-stream forge-process-stream-mix-hot"
          />
          <Image
            src={assets.geode.src}
            alt=""
            aria-hidden="true"
            width={assets.geode.width}
            height={assets.geode.height}
            className="forge-process-node forge-process-geode"
          />
          <Image
            src={assets.hotStream.src}
            alt=""
            aria-hidden="true"
            width={assets.hotStream.width}
            height={assets.hotStream.height}
            className="forge-process-stream forge-process-stream-hot"
          />
          <Image
            src={assets.fireBurst.src}
            alt=""
            aria-hidden="true"
            width={assets.fireBurst.width}
            height={assets.fireBurst.height}
            className="forge-process-fire"
          />
          <Image
            src={assets.rebirth.src}
            alt=""
            aria-hidden="true"
            width={assets.rebirth.width}
            height={assets.rebirth.height}
            className="forge-process-node forge-process-rebirth"
          />
        </div>

        <div className="forge-process-card absolute bottom-[7vh] left-1/2 z-8 w-[min(40vw,475px)] -translate-x-1/2">
          <Image
            src={assets.cardFrame.src}
            alt=""
            aria-hidden="true"
            width={assets.cardFrame.width}
            height={assets.cardFrame.height}
            className="h-auto w-full object-contain opacity-80"
          />
          {phases.map((phase) => (
            <article
              key={phase.title}
              className="forge-process-card-item absolute inset-0 flex flex-col justify-center px-[12%] text-center"
            >
              <span className="alchemy-eyebrow mb-2 text-[0.58rem]">
                {phase.eyebrow}
              </span>
              <h3 className="alchemy-heading mb-2 text-xl">{phase.title}</h3>
              <p className="alchemy-copy text-sm leading-6">{phase.body}</p>
            </article>
          ))}
        </div>

        <div className="forge-process-closing absolute left-1/2 top-[10vh] z-8 w-[min(78vw,680px)] -translate-x-1/2 text-center">
          <p className="alchemy-eyebrow mb-3 text-xs">Forge-to-Reactivate</p>
          <h2 className="alchemy-heading-strong text-2xl leading-tight xl:text-3xl">
            A circular economy powered by transmutation, not destruction.
          </h2>
        </div>
      </div>

      <div className="forge-process-mobile relative md:hidden">
        <div className="relative z-2 px-5 py-20">
          <div className="mb-16 text-center">
            <div className="forge-process-comparison mx-auto mb-6 w-full">
              <Image
                src={assets.comparison.src}
                alt=""
                aria-hidden="true"
                width={assets.comparison.width}
                height={assets.comparison.height}
                className="forge-process-comparison-image h-auto w-full object-contain"
              />
              <div className="absolute left-[21%] top-[47%] z-2 w-[27%] -translate-y-1/2 text-center">
                <h3 className="alchemy-heading text-[0.58rem] leading-none">
                  Burn-to-Void
                </h3>
                <p className="mt-1 font-serif text-[0.52rem] font-semibold leading-none text-white/88">
                  (Destruction)
                </p>
              </div>
              <div className="absolute left-[54%] top-[47%] z-2 w-[32%] -translate-y-1/2 text-center">
                <h3 className="alchemy-heading-strong text-[0.58rem] leading-none">
                  Forge-to-Reactivate
                </h3>
                <p className="mt-1 font-serif text-[0.52rem] font-semibold leading-none text-white/88">
                  (Transmutation)
                </p>
              </div>
            </div>
            <p className="alchemy-eyebrow mb-3 text-xs">
              Transformation, Not Destruction
            </p>
            <h2 className="alchemy-heading text-4xl leading-tight">
              ScorchCore reactivates dormant assets through digital alchemy.
            </h2>
          </div>

          <div className="space-y-20">
            {[
              {
                phase: phases[0],
                asset: assets.input,
                className: "drop-shadow-[0_0_34px_rgba(125,249,255,0.35)]",
              },
              {
                phase: phases[1],
                asset: assets.forge,
                className: "drop-shadow-[0_0_42px_rgba(125,249,255,0.35)]",
              },
              {
                phase: phases[2],
                asset: assets.geode,
                className: "drop-shadow-[0_0_42px_rgba(240,106,18,0.42)]",
              },
              {
                phase: phases[3],
                asset: assets.rebirth,
                className: "drop-shadow-[0_0_42px_rgba(247,198,90,0.38)]",
              },
            ].map(({ phase, asset, className }) => (
              <article key={phase.title} className="text-center">
                <Image
                  src={asset.src}
                  alt=""
                  aria-hidden="true"
                  width={asset.width}
                  height={asset.height}
                  className={`mx-auto mb-5 h-auto w-[min(92vw,420px)] object-contain ${className}`}
                />
                <span className="alchemy-eyebrow mb-2 block text-[0.62rem]">
                  {phase.eyebrow}
                </span>
                <h3 className="alchemy-heading mb-3 text-3xl">{phase.title}</h3>
                <p className="alchemy-copy mx-auto max-w-sm text-sm leading-6">
                  {phase.body}
                </p>
              </article>
            ))}
          </div>

          <div className="pt-20 text-center">
            <p className="alchemy-eyebrow mb-3 text-xs">Forge-to-Reactivate</p>
            <h2 className="alchemy-heading-strong text-4xl leading-tight">
              A circular economy powered by transmutation, not destruction.
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
