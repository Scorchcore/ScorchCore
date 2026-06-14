"use client";

import gsap from "gsap";
import { Hammer, Loader2, PackageOpen, RotateCcw } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CoreMinerVideo } from "@/components/CoreMinerVideo";
import { GeodeVideo } from "@/components/GeodeVideo";
import {
  DEMO_PETIT_MINERS,
  FORGE_DEMO_ASSETS,
  generateMockTxHash,
  getRandomPetitAquaMinerIndex,
} from "@/lib/constants/forgeDemo";
import {
  AXIE_CLASS_INFO,
  AxieClass,
  CATEGORY_INFO,
  GeodeCategory,
} from "@/lib/constants/geodes";
import { getCoreMinerVideoFilename } from "@/lib/constants/storagePaths";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import ForgeAltarStage, {
  type BeamPhase,
  type SealPhase,
  type SealSpin,
} from "./ForgeAltarStage";
import ForgeDemoRoulette from "./ForgeDemoRoulette";
import ForgeTour from "./ForgeTour";
import ForgeTriadAnimation, { type TriadPoint } from "./ForgeTriadAnimation";

const logger = createServiceLogger("ForgeDemo");

type DemoStage =
  | "select-geode"
  | "select-class"
  | "select-axie"
  | "setup"
  | "forging"
  | "geode-created"
  | "opening"
  | "revealed";

const STAGE_ORDER: DemoStage[] = [
  "select-geode",
  "select-class",
  "select-axie",
  "setup",
  "forging",
  "geode-created",
  "opening",
  "revealed",
];

/* ── Triad vertices (shared by setup icons & forge animation) ── */
const TRIAD: {
  geode: TriadPoint;
  memento: TriadPoint;
  axie: TriadPoint;
  center: TriadPoint;
} = {
  geode: { x: 30, y: 26 },
  memento: { x: 70, y: 26 },
  axie: { x: 50, y: 74 },
  center: { x: 50, y: 52 },
};

interface ForgeDemoProps {
  onExit: () => void;
}

/* ── Floating icon: GSAP bob on inner element (positioning is on wrapper) ── */
function FloatingIcon({
  children,
  delay = 0,
  onClick,
}: {
  children: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const tween = gsap.to(el, {
      y: -8,
      duration: 2.6 + Math.random() * 0.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay,
    });
    return () => {
      tween.kill();
    };
  }, [delay]);

  const cn =
    "flex flex-col items-center gap-0.5 transition-transform duration-300";
  if (onClick) {
    return (
      <button
        ref={ref as unknown as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        className={`${cn} cursor-pointer hover:scale-110`}
      >
        {children}
      </button>
    );
  }
  return (
    <div ref={ref} className={cn}>
      {children}
    </div>
  );
}

/* ── Absolute anchor centred on a triad point ── */
function TriadAnchor({
  point,
  dataTour,
  children,
}: {
  point: TriadPoint;
  dataTour?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-tour={dataTour}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    >
      {children}
    </div>
  );
}

const ICON_CN =
  "object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 xl:h-24 xl:w-24 2xl:h-28 2xl:w-28";
const ICON_LABEL_CN =
  "absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.65rem] font-bold text-white opacity-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]";
const VIDEO_WRAP_CN =
  "pointer-events-none absolute left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center";

/* ── Main demo component ── */
export default function ForgeDemo({ onExit }: ForgeDemoProps) {
  const [stage, setStage] = useState<DemoStage>("select-geode");
  const [mockTxHash, setMockTxHash] = useState<string>("");
  const [revealedMinerIndex, setRevealedMinerIndex] = useState<number>(0);
  const [sealSpin, setSealSpin] = useState<SealSpin>("normal");
  const [isForgeLoading, setIsForgeLoading] = useState(false);
  const forgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preservedScrollYRef = useRef<number | null>(null);

  const petitInfo = CATEGORY_INFO[GeodeCategory.PETIT];
  const aquaInfo = AXIE_CLASS_INFO[AxieClass.AQUA];

  const minerData = useMemo(
    () => DEMO_PETIT_MINERS[revealedMinerIndex],
    [revealedMinerIndex],
  );

  const minerName = useMemo(() => {
    const filename = getCoreMinerVideoFilename(
      GeodeCategory.PETIT,
      AxieClass.AQUA,
      revealedMinerIndex,
    );
    if (!filename) return `CoreMiner #${revealedMinerIndex}`;
    return filename.replace(/\.mp4$/i, "").replace(/_/g, " ");
  }, [revealedMinerIndex]);

  const setStageWithoutScrollShift = useCallback((nextStage: DemoStage) => {
    preservedScrollYRef.current = window.scrollY;
    setStage(nextStage);
  }, []);

  useLayoutEffect(() => {
    const preservedScrollY = preservedScrollYRef.current;
    if (preservedScrollY === null) return;

    preservedScrollYRef.current = null;
    window.scrollTo({
      top: preservedScrollY,
      left: window.scrollX,
      behavior: "auto",
    });
  });

  /* Preload critical images asynchronously so SVG mounts instantly when forging starts.
     Cached via localStorage so we skip redundant preloads on refresh/tab-switch. */
  useEffect(() => {
    const CACHE_KEY = "forge_demo_preloaded_at";
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
    const lastPreloaded = Number(localStorage.getItem(CACHE_KEY) || "0");
    const now = Date.now();

    if (lastPreloaded && now - lastPreloaded < CACHE_TTL_MS) {
      logger.info("Preload cache hit — saltando preload", {
        cachedAt: new Date(lastPreloaded).toISOString(),
      });
      return;
    }

    const t0 = performance.now();
    const assets = [
      FORGE_DEMO_ASSETS.altar,
      FORGE_DEMO_ASSETS.altarEnergy,
      FORGE_DEMO_ASSETS.rayoAltar,
      FORGE_DEMO_ASSETS.axieAqua,
      petitInfo.icon,
      aquaInfo.icon,
    ];
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];
    for (const src of assets) {
      if (!src) continue;
      const img = document.createElement("img");
      img.onload = () => {
        loaded++;
        if (loaded === assets.filter(Boolean).length) {
          localStorage.setItem(CACHE_KEY, String(Date.now()));
          logger.info("Preload assets completado", {
            elapsedMs: Math.round(performance.now() - t0),
          });
        }
      };
      img.onerror = () => {
        logger.warn("Preload asset falló", { src });
      };
      img.src = src;
      imgs.push(img);
    }
    logger.info("Preload assets iniciado", { count: imgs.length });
  }, [petitInfo.icon, aquaInfo.icon]);

  const beamPhase: BeamPhase = useMemo(() => {
    switch (stage) {
      case "geode-created":
      case "opening":
      case "revealed":
        return "active";
      default:
        // No vertical beam during selection or forging (triad drives forging)
        return "idle";
    }
  }, [stage]);

  const sealPhase: SealPhase = useMemo(() => {
    switch (stage) {
      case "forging":
        return "intense";
      case "geode-created":
      case "opening":
      case "revealed":
        return "pulsing";
      default:
        return "dim";
    }
  }, [stage]);

  /* ── Handlers ── */
  const handleSelectGeode = () => {
    (document.activeElement as HTMLElement | null)?.blur();
    setStageWithoutScrollShift("select-class");
  };
  const handleSelectClass = () => {
    (document.activeElement as HTMLElement | null)?.blur();
    setStageWithoutScrollShift("select-axie");
  };
  const handleSelectAxie = () => {
    (document.activeElement as HTMLElement | null)?.blur();
    setStageWithoutScrollShift("setup");
  };

  const handleForge = useCallback(() => {
    const t0 = performance.now();
    logger.info("Click en Forjar Geoda", { isForgeLoading, stage });
    if (isForgeLoading) return;
    setIsForgeLoading(true);
    const tx = generateMockTxHash();
    setMockTxHash(tx);
    logger.info("Iniciando forja demo", {
      tx,
      clickToStartMs: Math.round(performance.now() - t0),
    });
    setStageWithoutScrollShift("forging");

    // Safety net: if triad animation never completes, unblock UI after 6s
    forgeTimeoutRef.current = setTimeout(() => {
      logger.warn("Forja safety timeout — desbloqueando UI");
      setIsForgeLoading(false);
      setSealSpin("normal");
      // Do NOT auto-advance; user must click Continue manually
    }, 6000);
  }, [isForgeLoading, setStageWithoutScrollShift, stage]);

  const handleTriadConverge = useCallback(() => {
    logger.info("Trazas convergen — sello acelera");
    setSealSpin("fast");
  }, []);

  const handleOpenGeode = useCallback(() => {
    const idx = getRandomPetitAquaMinerIndex();
    setRevealedMinerIndex(idx);
    logger.info("Abriendo geoda demo", { minerIndex: idx });
    setStageWithoutScrollShift("opening");
  }, [setStageWithoutScrollShift]);

  const handleRouletteComplete = useCallback(
    (minerIndex: number) => {
      logger.info("Ruleta demo completada", { minerIndex });
      setRevealedMinerIndex(minerIndex);
      setStageWithoutScrollShift("revealed");
    },
    [setStageWithoutScrollShift],
  );

  const handleForgeAgain = useCallback(() => {
    setMockTxHash("");
    setSealSpin("normal");
    setIsForgeLoading(false);
    setStageWithoutScrollShift("select-geode");
  }, [setStageWithoutScrollShift]);

  const handlePreviousStep = useCallback(() => {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx > 0) {
      setStageWithoutScrollShift(STAGE_ORDER[idx - 1]);
    }
  }, [setStageWithoutScrollShift, stage]);

  const currentStep = STAGE_ORDER.indexOf(stage);

  // Log stage transitions for debugging delays
  useEffect(() => {
    logger.info("Stage cambiado", { stage, isForgeLoading });
  }, [stage, isForgeLoading]);

  return (
    <div className="relative w-full [overflow-anchor:none]">
      {/* Contextual guided tour (auto-starts on every stage) */}
      <ForgeTour stepKey={stage} onPrevious={handlePreviousStep} />

      {/* Step dots */}
      <div
        data-tour="step-dots"
        className="mb-2 flex items-center justify-center gap-1.5"
      >
        {STAGE_ORDER.map((stageKey, i) => (
          <div
            key={stageKey}
            className={`h-1 rounded-full transition-all duration-500 ${currentStep >= i ? "w-5 bg-magma-gold" : "w-5 bg-cyan-100/15"
              }`}
          />
        ))}
      </div>

      {/* Altar stage */}
      <div data-tour="stage">
        <ForgeAltarStage
          beamPhase={beamPhase}
          sealPhase={sealPhase}
          sealSpin={sealSpin}
        >
          {/* ── SELECT GEODE ─-─ */}
          {stage === "select-geode" && (
            <TriadAnchor point={TRIAD.geode} dataTour="icon-geode">
              <FloatingIcon onClick={handleSelectGeode} delay={0.2}>
                <Image
                  src={petitInfo.icon}
                  alt="Petit"
                  width={80}
                  height={80}
                  className={ICON_CN}
                  unoptimized
                />
                <span className={ICON_LABEL_CN}>{petitInfo.name}</span>
              </FloatingIcon>
            </TriadAnchor>
          )}

          {/* ── SELECT CLASS ── */}
          {stage === "select-class" && (
            <>
              {/* Previously selected geode (Petit) */}
              <TriadAnchor point={TRIAD.geode} dataTour="icon-geode-selected">
                <FloatingIcon delay={0.2}>
                  <Image
                    src={petitInfo.icon}
                    alt="Petit"
                    width={72}
                    height={72}
                    className={`${ICON_CN} opacity-60`}
                    unoptimized
                  />
                  <span className="text-[0.55rem] font-bold text-white opacity-80 sm:text-[0.65rem] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {petitInfo.name}
                  </span>
                </FloatingIcon>
              </TriadAnchor>

              {/* Current selection: class (Aqua) */}
              <TriadAnchor point={TRIAD.memento} dataTour="icon-class">
                <FloatingIcon onClick={handleSelectClass} delay={0.4}>
                  <Image
                    src={aquaInfo.icon}
                    alt="Aqua"
                    width={80}
                    height={80}
                    className={ICON_CN}
                    unoptimized
                  />
                  <span className={ICON_LABEL_CN}>{aquaInfo.displayName}</span>
                </FloatingIcon>
              </TriadAnchor>
            </>
          )}

          {/* ── SELECT AXIE ── */}
          {stage === "select-axie" && (
            <>
              {/* Previously selected geode (Petit) */}
              <TriadAnchor point={TRIAD.geode} dataTour="icon-geode-selected">
                <FloatingIcon delay={0.1}>
                  <Image
                    src={petitInfo.icon}
                    alt="Petit"
                    width={64}
                    height={64}
                    className={`${ICON_CN} opacity-50`}
                    unoptimized
                  />
                  <span className="text-[0.55rem] font-bold text-white opacity-70 sm:text-[0.65rem] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {petitInfo.name}
                  </span>
                </FloatingIcon>
              </TriadAnchor>

              {/* Previously selected class (Aqua) */}
              <TriadAnchor point={TRIAD.memento} dataTour="icon-class-selected">
                <FloatingIcon delay={0.2}>
                  <Image
                    src={aquaInfo.icon}
                    alt="Aqua"
                    width={64}
                    height={64}
                    className={`${ICON_CN} opacity-50`}
                    unoptimized
                  />
                  <span className="text-[0.55rem] font-bold text-white opacity-70 sm:text-[0.65rem] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {aquaInfo.displayName}
                  </span>
                </FloatingIcon>
              </TriadAnchor>

              {/* Current selection: Axie Aqua — large and centered */}
              <TriadAnchor point={TRIAD.center} dataTour="icon-axie">
                <FloatingIcon onClick={handleSelectAxie} delay={0.3}>
                  <Image
                    src={FORGE_DEMO_ASSETS.axieAqua}
                    alt="Axie Aqua"
                    width={120}
                    height={120}
                    className="object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 xl:h-48 xl:w-48 2xl:h-56 2xl:w-56"
                    unoptimized
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.7rem] font-bold text-white opacity-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    Axie Aqua
                  </span>
                </FloatingIcon>
              </TriadAnchor>
            </>
          )}

          {/* ── SETUP / FORGING ── triad shown as three vertices ── */}
          {(stage === "setup" || stage === "forging") && (
            <>
              <TriadAnchor point={TRIAD.geode} dataTour="triad">
                <FloatingIcon delay={0.1}>
                  <Image
                    src={petitInfo.icon}
                    alt="Petit"
                    width={64}
                    height={64}
                    className={`${ICON_CN} opacity-70`}
                    unoptimized
                  />
                  <span className="text-[0.55rem] font-bold text-white opacity-100 sm:text-[0.65rem] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {petitInfo.name}
                  </span>
                </FloatingIcon>
              </TriadAnchor>

              <TriadAnchor point={TRIAD.memento}>
                <FloatingIcon delay={0.3}>
                  <Image
                    src={aquaInfo.icon}
                    alt="Aqua"
                    width={64}
                    height={64}
                    className={`${ICON_CN} opacity-70`}
                    unoptimized
                  />
                  <span className="text-[0.55rem] font-bold text-white opacity-100 sm:text-[0.65rem] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {aquaInfo.displayName}
                  </span>
                </FloatingIcon>
              </TriadAnchor>

              {/* Axie Aqua — large and centered */}
              <TriadAnchor point={TRIAD.center}>
                <FloatingIcon delay={0.5}>
                  <Image
                    src={FORGE_DEMO_ASSETS.axieAqua}
                    alt="Axie Aqua"
                    width={120}
                    height={120}
                    className="object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 xl:h-48 xl:w-48 2xl:h-56 2xl:w-56 opacity-70"
                    unoptimized
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.7rem] font-bold text-white opacity-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    Axie Aqua
                  </span>
                </FloatingIcon>
              </TriadAnchor>
            </>
          )}

          {/* ── FORGING ── triad trace + convergence animation ── */}
          {stage === "forging" && (
            <>
              <ForgeTriadAnimation
                axie={TRIAD.center}
                memento={TRIAD.memento}
                geode={TRIAD.geode}
                center={TRIAD.center}
                onConverge={handleTriadConverge}
              />
              <div className="absolute inset-x-0 bottom-[12%] z-50 flex flex-col items-center justify-center text-center">
                <p className="alchemy-heading text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-lg md:text-xl">
                  Transmuting...
                </p>
              </div>
            </>
          )}

          {/* ── GEODE CREATED ── video floating in beam ── */}
          {stage === "geode-created" && (
            <div className={VIDEO_WRAP_CN} data-tour="geode-video">
              <div className="aspect-square w-20 overflow-hidden rounded-full border border-magma-gold/30 shadow-[0_0_48px_rgba(240,106,18,0.28)] sm:w-28 md:w-36 lg:w-44 xl:w-52 2xl:w-60">
                <GeodeVideo
                  category={GeodeCategory.PETIT}
                  axieClass={AxieClass.AQUA}
                  autoPlay
                  className="h-full w-full"
                />
              </div>
            </div>
          )}

          {/* ── OPENING ── roulette embedded over scene ── */}
          {stage === "opening" && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
              <div className="w-full px-2 sm:px-4 md:px-6" data-tour="roulette">
                <ForgeDemoRoulette
                  category={GeodeCategory.PETIT}
                  axieClass={AxieClass.AQUA}
                  preselectedIndex={revealedMinerIndex}
                  onComplete={handleRouletteComplete}
                  compact
                />
              </div>
            </div>
          )}

          {/* ── REVEALED ── CoreMiner floating in beam + stats ── */}
          {stage === "revealed" && (
            <div className={VIDEO_WRAP_CN} data-tour="reveal">
              <div
                className={`aspect-square w-52 overflow-hidden rounded-full border ${minerData.borderClass} shadow-[0_0_48px_rgba(247,198,90,0.22)] sm:w-60 md:w-72 lg:w-80 xl:w-96 2xl:w-md`}
              >
                <CoreMinerVideo
                  category={GeodeCategory.PETIT}
                  axieClass={AxieClass.AQUA}
                  minerIndex={revealedMinerIndex}
                  autoPlay
                  loop
                  muted
                  className="h-full w-full"
                  showFallback
                />
              </div>
            </div>
          )}
        </ForgeAltarStage>
      </div>

      {/* ── UI panels below altar ── */}
      <div className="mx-auto max-w-sm px-4 text-center sm:mt-0 sm:max-w-md">
        {/* SELECT GEODE */}
        {stage === "select-geode" && (
          <div className="space-y-1.5">
            <p className="alchemy-eyebrow text-[0.6rem]">Step 1 of 8</p>
            <h3 className="alchemy-heading-strong text-lg sm:text-xl">
              Select a Geode
            </h3>
            <p className="text-xs text-cyan-50/50">Click the floating icon</p>
          </div>
        )}

        {/* SELECT CLASS */}
        {stage === "select-class" && (
          <div className="space-y-1.5">
            <p className="alchemy-eyebrow text-[0.6rem]">Step 2 of 8</p>
            <h3 className="alchemy-heading-strong text-lg sm:text-xl">
              Select a Class
            </h3>
            <p className="text-xs text-cyan-50/50">Click the floating icon</p>
          </div>
        )}

        {/* SELECT AXIE */}
        {stage === "select-axie" && (
          <div className="space-y-1.5">
            <p className="alchemy-eyebrow text-[0.6rem]">Step 3 of 8</p>
            <h3 className="alchemy-heading-strong text-lg sm:text-xl">
              Select your Aqua Axie
            </h3>
            <p className="text-xs text-cyan-50/50">Click the floating Axie</p>
          </div>
        )}

        {/* SETUP */}
        {stage === "setup" && (
          <div className="space-y-3">
            <div>
              <p className="alchemy-eyebrow text-[0.6rem]">Step 4 of 8</p>
              <h3 className="alchemy-heading-strong text-lg sm:text-xl">
                Prepare Forge
              </h3>
              <p className="text-xs text-cyan-50/50">
                Petit Aqua — Review the materials
              </p>
            </div>

            {/* Costs */}
            <div
              data-tour="costs"
              className="mx-auto flex max-w-[320px] items-center justify-between gap-2 rounded border border-cyan-100/8 bg-black/32 px-3 py-2.5"
            >
              <div className="flex flex-col items-center gap-0.5">
                <Image
                  src="/assets/axies/axs-icon.webp"
                  alt="AXS"
                  width={16}
                  height={16}
                  className="h-4 w-4"
                  unoptimized
                />
                <span className="text-[0.6rem] text-cyan-50/45">AXS</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white">5.72</span>
                  <span className="rounded bg-cyan-100/10 px-1 py-0.5 text-[0.55rem] text-cyan-50/50">
                    $6.50
                  </span>
                </div>
              </div>
              <div className="h-6 w-px bg-cyan-100/10" />
              <div className="flex flex-col items-center gap-0.5">
                <Image
                  src="/assets/mementos/memento-aqua.webp"
                  alt="Memento Aqua"
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full"
                  unoptimized
                />
                <span className="text-[0.6rem] text-cyan-50/45">Mementos</span>
                <span className="text-xs font-semibold text-white">100</span>
              </div>
              <div className="h-6 w-px bg-cyan-100/10" />
              <div className="flex flex-col items-center gap-0.5">
                <Image
                  src={FORGE_DEMO_ASSETS.axieAqua}
                  alt="Axie Aqua"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-contain"
                  unoptimized
                />
                <span className="text-[0.6rem] text-cyan-50/45">Axie</span>
                <span className="text-xs font-semibold text-white">1</span>
              </div>
            </div>

            <button
              type="button"
              data-tour="forge-btn"
              disabled={isForgeLoading}
              onClick={handleForge}
              className="inline-flex cursor-pointer items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isForgeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Hammer className="h-4 w-4" />
              )}
              {isForgeLoading ? "Transmuting..." : "Forge Geode"}
            </button>
          </div>
        )}

        {/* FORGING */}
        {stage === "forging" && (
          <div className="space-y-2">
            {mockTxHash && (
              <p className="font-mono text-[0.55rem] text-cyan-50/35 sm:text-xs">
                Mock Tx {mockTxHash.slice(0, 8)}…{mockTxHash.slice(-4)}
              </p>
            )}
            {!isForgeLoading && (
              <button
                type="button"
                onClick={() => setStageWithoutScrollShift("geode-created")}
                className="inline-flex cursor-pointer items-center gap-2 border border-magma-gold/55 bg-orange-500/14 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-magma-gold shadow-[0_0_28px_rgba(240,106,18,0.16)] transition-all hover:border-magma-gold hover:bg-orange-500/22 hover:text-white"
              >
                <PackageOpen className="h-4 w-4" />
                Open Geode
              </button>
            )}
          </div>
        )}

        {/* GEODE CREATED */}
        {stage === "geode-created" && (
          <div className="space-y-3">
            <h3 className="alchemy-heading-strong text-lg sm:text-xl">
              Petit Aqua Geode Created!
            </h3>
            {mockTxHash && (
              <p className="font-mono text-[0.55rem] text-cyan-50/35 sm:text-xs">
                Tx {mockTxHash.slice(0, 8)}…{mockTxHash.slice(-4)}
              </p>
            )}
            <button
              type="button"
              onClick={handleOpenGeode}
              className="inline-flex cursor-pointer items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white"
            >
              <PackageOpen className="h-4 w-4" />
              Open Geode
            </button>
          </div>
        )}

        {/* REVEALED */}
        {stage === "revealed" && (
          <div className="space-y-3">
            <div>
              <h3
                className={`alchemy-heading text-xl sm:text-2xl ${minerData.nameColor}`}
              >
                {minerName}
              </h3>
              <p className="text-[0.6rem] text-cyan-50/38 sm:text-xs">
                Petit Aqua CoreMiner
              </p>
              <p className="mt-0.5 text-[0.6rem] text-cyan-50/58 sm:text-xs">
                {minerData.rarityLabel} · Power {minerData.power}
              </p>
            </div>

            {mockTxHash && (
              <div className="inline-flex items-center gap-1.5 rounded border border-cyan-100/10 bg-black/30 px-2.5 py-1">
                <span className="text-[0.5rem] uppercase tracking-wider text-cyan-50/25">
                  Mock Tx
                </span>
                <span className="font-mono text-[0.55rem] text-cyan-50/45 sm:text-[0.6rem]">
                  {mockTxHash.slice(0, 6)}…{mockTxHash.slice(-4)}
                </span>
              </div>
            )}

            <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handleForgeAgain}
                className="inline-flex items-center justify-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Forge Again
              </button>
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center justify-center gap-2 border border-cyan-100/12 bg-black/42 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50/58 transition-all hover:border-ethereal-cyan/45 hover:text-cyan-50"
              >
                Close Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
