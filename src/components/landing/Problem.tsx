"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

const sceneAssets = {
    background: {
        src: "/assets/landing/problem-bg-clean-full.webp",
        width: 1672,
        height: 941,
    },
    left: {
        src: "/assets/landing/problem-left-destruction.webp",
        width: 1672,
        height: 941,
    },
    right: {
        src: "/assets/landing/problem-right-stasis.webp",
        width: 1672,
        height: 941,
    },
    hand: {
        src: "/assets/landing/left-foreground-hand-crystal.webp",
        width: 447,
        height: 558,
    },
    orb: {
        src: "/assets/landing/right-foreground-orb-creature.webp",
        width: 500,
        height: 500,
    },
    ice: {
        src: "/assets/landing/right-ice-cubes-layer.webp",
        width: 666,
        height: 375,
    },
    shards: {
        src: "/assets/landing/left-floating-shards.webp",
        width: 577,
        height: 433,
    },
} as const;

export default function Problem() {
    const sectionRef = useRef<HTMLElement>(null);
    const sceneRef = useRef<HTMLDivElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const section = sectionRef.current;
        const scene = sceneRef.current;
        const copy = copyRef.current;

        if (!section || !scene || !copy) return;

        const context = gsap.context(() => {
            const diagonal = section.querySelector(".problem-diagonal");
            const left = section.querySelector(".problem-layer-left");
            const right = section.querySelector(".problem-layer-right");

            gsap.set(scene, { opacity: 0.22, y: 56, filter: "brightness(0.62)" });
            gsap.set(copy, { opacity: 0, y: 36, filter: "blur(6px)" });
            gsap.set(diagonal, { opacity: 0, scaleX: 0.18 });
            gsap.set(left, { opacity: 0, x: -28 });
            gsap.set(right, { opacity: 0, x: 28 });

            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top 72%",
                    end: "top 18%",
                    scrub: 0.8,
                },
            });

            timeline
                .to(
                    scene,
                    {
                        opacity: 1,
                        y: 0,
                        filter: "brightness(1)",
                        duration: 0.8,
                        ease: "none",
                    },
                    0,
                )
                .to(left, { opacity: 0.82, x: 0, duration: 0.55, ease: "none" }, 0.08)
                .to(right, { opacity: 0.88, x: 0, duration: 0.55, ease: "none" }, 0.12)
                .to(
                    diagonal,
                    { opacity: 1, scaleX: 1, duration: 0.45, ease: "none" },
                    0.26,
                )
                .to(
                    copy,
                    {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.45,
                        ease: "none",
                    },
                    0.38,
                );

            return () => timeline.kill();
        }, section);

        return () => context.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="problem-section alchemy-copy relative overflow-hidden bg-deep-abyss text-white"
        >
            <div
                ref={sceneRef}
                className="problem-scene relative mx-auto min-h-screen w-full"
            >
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_46%,rgba(0,242,255,0.12),transparent_34%),linear-gradient(180deg,#020607_0%,#05090b_48%,#010203_100%)]" />

                <Image
                    src={sceneAssets.background.src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="100vw"
                    className="problem-layer problem-layer-bg z-[1]"
                />
                <Image
                    src={sceneAssets.left.src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="100vw"
                    className="problem-layer problem-layer-left z-[2]"
                />
                <Image
                    src={sceneAssets.right.src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="100vw"
                    className="problem-layer problem-layer-right z-[3]"
                />

                <div className="problem-diagonal z-[4]" aria-hidden="true" />

                <Image
                    src={sceneAssets.ice.src}
                    alt=""
                    aria-hidden="true"
                    width={sceneAssets.ice.width}
                    height={sceneAssets.ice.height}
                    className="problem-ice-layer z-[5]"
                />
                <Image
                    src={sceneAssets.shards.src}
                    alt=""
                    aria-hidden="true"
                    width={sceneAssets.shards.width}
                    height={sceneAssets.shards.height}
                    className="problem-shards-layer z-[6]"
                />
                <Image
                    src={sceneAssets.hand.src}
                    alt=""
                    aria-hidden="true"
                    width={sceneAssets.hand.width}
                    height={sceneAssets.hand.height}
                    className="problem-hand-layer z-[7]"
                />
                <Image
                    src={sceneAssets.orb.src}
                    alt=""
                    aria-hidden="true"
                    width={sceneAssets.orb.width}
                    height={sceneAssets.orb.height}
                    className="problem-orb-layer z-[8]"
                />

                <div
                    ref={copyRef}
                    className="problem-copy pointer-events-none relative z-[9] mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 py-28 md:px-8"
                >
                    <div className="max-w-3xl">
                        <p className="alchemy-eyebrow mb-5 text-xs md:text-sm">
                            The Problem
                        </p>
                        <h2 className="alchemy-heading text-balance text-4xl leading-[1.02] drop-shadow-[0_0_28px_rgba(0,240,255,0.18)] md:text-6xl lg:text-7xl">
                            The Great Digital Void
                        </h2>
                    </div>

                    <div className="problem-cards mt-12 grid gap-4 md:mt-20 md:grid-cols-2">
                        <article className="problem-card problem-card-left">
                            <span className="problem-card-kicker">Eco-Silence</span>
                            <h3 className="alchemy-heading">Abandoned momentum</h3>
                            <p>
                                Projects decay when their assets lose purpose, leaving cracked
                                economies, muted communities, and value trapped in ruins.
                            </p>
                        </article>
                        <article className="problem-card problem-card-right">
                            <span className="problem-card-kicker">Eco-Stasis</span>
                            <h3 className="alchemy-heading">Dormant potential</h3>
                            <p>
                                Frozen assets still carry energy, identity, and history. Without
                                a forge, that potential remains preserved but motionless.
                            </p>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    );
}
