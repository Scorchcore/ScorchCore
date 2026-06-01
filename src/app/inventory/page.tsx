"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { Loading, Toast, useToast } from "@/components/ui";
import { GeodeVideo } from "@/components/GeodeVideo";
import { HatchRoulette } from "@/components/HatchRoulette";
import { HatchSuccessModal } from "@/components/HatchSuccessModal";
import Link from "next/link";
import { useAccount } from "wagmi";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useInventoryFacade } from "@/lib/hooks/facades/useInventoryFacade";
import { useForgeFacade } from "@/lib/hooks/facades/useForgeFacade";
import { useMetadataService } from "@/lib/hooks/services/useMetadataService";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import { useNFTFacade } from "@/lib/hooks/facades/useNFTFacade";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import type { GeodeInventoryInfo } from "@/lib/facades/InventoryFacade";
import type { CoreMinerNFT } from "@/lib/facades/NFTFacade";
import { MinerVideoPlayer } from "@/components/ui/VideoPlayer";
import type { HatchResult } from "@/lib/contracts/interfaces/IGeodeHatcher";
import type { HatchResult as ComponentHatchResult } from "@/components/types/HatchTypes";
import {
  GeodeCategory,
  AxieClass,
  CATEGORY_INFO,
  AXIE_CLASS_INFO,
} from "@/lib/constants/geodes";
import { Footer } from "@/components/layout";
import {
  Backpack,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Egg,
  Hammer,
  Layers,
  Loader2,
  Pickaxe,
  RefreshCw,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

const logger = createServiceLogger("InventoryPage");
type TabValue = "all" | "geodes" | "miners";

// ─── Status Chip ─────────────────────────────────────────────────────────────

type StatusKind = "ready" | "incubating" | "hatched" | "mining" | "idle";

const STATUS_STYLES: Record<StatusKind, string> = {
  ready: "border-magma-gold/55 bg-orange-500/14 text-magma-gold",
  incubating: "border-ethereal-cyan/45 bg-cyan-300/8 text-ethereal-cyan/80",
  hatched: "border-cyan-100/12 bg-black/30 text-cyan-50/42",
  mining: "border-emerald-400/45 bg-emerald-500/8 text-emerald-300",
  idle: "border-cyan-100/12 bg-black/30 text-cyan-50/42",
};
const STATUS_LABELS: Record<StatusKind, string> = {
  ready: "Ready",
  incubating: "Incubating",
  hatched: "Hatched",
  mining: "Mining",
  idle: "Idle",
};

function StatusChip({ status }: { status: StatusKind }) {
  return (
    <span
      className={`shrink-0 border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
        active
          ? "border-magma-gold/70 bg-orange-500/14 text-magma-gold shadow-[0_0_26px_rgba(240,106,18,0.18)]"
          : "border-cyan-100/12 bg-black/42 text-cyan-50/58 hover:border-ethereal-cyan/45 hover:text-cyan-50"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className={active ? "text-magma-gold/60" : "text-cyan-50/38"}>{count}</span>
    </button>
  );
}

// ─── Geode Card ───────────────────────────────────────────────────────────────

function GeodeCard({
  geode,
  isHatching,
  onHatch,
  onOpenLightbox,
  getTimeRemaining,
}: {
  geode: GeodeInventoryInfo;
  isHatching: boolean;
  onHatch: (id: bigint) => void;
  onOpenLightbox: (geode: GeodeInventoryInfo) => void;
  getTimeRemaining: (hatchTime: number) => string;
}) {
  const status: StatusKind = geode.isHatched
    ? "hatched"
    : geode.canHatch
      ? "ready"
      : "incubating";

  const borderClass = geode.isHatched
    ? "border-cyan-100/12"
    : geode.canHatch
      ? "border-magma-gold/45"
      : "border-ethereal-cyan/20";

  const glowClass = geode.isHatched
    ? "from-cyan-300/4 to-transparent"
    : geode.canHatch
      ? "from-orange-500/20 to-yellow-300/6"
      : "from-cyan-300/10 to-blue-500/4";

  return (
    <article
      className={`group relative overflow-hidden border ${borderClass} bg-black/42 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(0,0,0,0.46)]`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${glowClass} opacity-70 transition-opacity group-hover:opacity-100`}
      />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-magma-gold/55 to-transparent" />

      {/* Video preview */}
      <button
        type="button"
        aria-label={`View ${geode.fullName} fullscreen`}
        className="relative mx-4 mt-4 flex h-52 w-[calc(100%-2rem)] cursor-pointer items-center justify-center overflow-hidden border border-cyan-100/8 bg-black/30 transition-colors hover:border-ethereal-cyan/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
        onClick={() => onOpenLightbox(geode)}
      >
        <GeodeVideo
          category={geode.category}
          axieClass={geode.axieClass}
          className="h-full w-auto max-w-full object-contain"
          autoPlay={true}
        />
      </button>

      {/* Body */}
      <div className="relative p-4">
        {/* Name + status */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="alchemy-heading truncate text-base leading-tight">
              {geode.fullName}
            </h3>
            <p className="mt-0.5 text-[0.65rem] text-cyan-50/38">
              ID #{geode.id.toString()}
            </p>
          </div>
          <StatusChip status={status} />
        </div>

        {/* Category + class badges */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <span
            style={{
              borderColor: `${CATEGORY_INFO[geode.category].color}88`,
              color: CATEGORY_INFO[geode.category].color,
              backgroundColor: `${CATEGORY_INFO[geode.category].color}1a`,
            }}
            className="border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em]"
          >
            {CATEGORY_INFO[geode.category].name}
          </span>
          <span
            style={{
              borderColor: `${AXIE_CLASS_INFO[geode.axieClass].color}88`,
              color: AXIE_CLASS_INFO[geode.axieClass].color,
              backgroundColor: `${AXIE_CLASS_INFO[geode.axieClass].color}1a`,
            }}
            className="border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em]"
          >
            {AXIE_CLASS_INFO[geode.axieClass].name}
          </span>
        </div>

        {/* Stats */}
        <div className="mb-4 divide-y divide-cyan-100/8 border border-cyan-100/8 bg-black/20">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <Zap className="h-3.5 w-3.5 text-magma-gold/70" />
              Power
            </span>
            <span className="text-xs font-semibold text-white">{geode.miningPower}</span>
          </div>
          {!geode.isHatched && (
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
                <Clock className="h-3.5 w-3.5 text-ethereal-cyan/55" />
                Time
              </span>
              <span
                className={`text-xs font-semibold ${geode.canHatch ? "text-magma-gold" : "text-white"}`}
              >
                {getTimeRemaining(geode.hatchTime)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <Calendar className="h-3.5 w-3.5 text-cyan-300/45" />
              Forged
            </span>
            <span className="text-xs text-white">
              {new Date(geode.createdAt * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action */}
        {geode.canHatch && !geode.isHatched ? (
          <button
            type="button"
            onClick={() => onHatch(geode.id)}
            disabled={isHatching}
            className="flex w-full items-center justify-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 py-3 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            {isHatching ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Hatching…
              </>
            ) : (
              <>
                <Egg className="h-3.5 w-3.5" />
                Hatch Now
              </>
            )}
          </button>
        ) : geode.isHatched ? (
          <div className="flex items-center justify-center gap-2 border border-cyan-100/8 bg-black/20 py-3 text-xs uppercase tracking-wider text-cyan-50/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Already Hatched
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 border border-cyan-100/10 bg-black/20 py-3 text-xs uppercase tracking-wider text-cyan-50/38">
            <Timer className="h-3.5 w-3.5 text-ethereal-cyan/35" />
            Incubating
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Miner Card ───────────────────────────────────────────────────────────────

function MinerCard({
  miner,
  onOpenLightbox,
  onShowInfo,
  onNavigate,
}: {
  miner: CoreMinerNFT;
  onOpenLightbox: (miner: CoreMinerNFT) => void;
  onShowInfo: (msg: string) => void;
  onNavigate: (tokenId: string) => void;
}) {
  const borderClass = miner.isMining
    ? "border-ethereal-cyan/35"
    : "border-cyan-100/12";
  const glowClass = miner.isMining
    ? "from-cyan-300/12 to-blue-500/5"
    : "from-cyan-300/4 to-transparent";

  return (
    <article
      className={`group relative cursor-pointer overflow-hidden border ${borderClass} bg-black/42 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(0,0,0,0.46)]`}
      onClick={() => onNavigate(miner.tokenId.toString())}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${glowClass} opacity-70 transition-opacity group-hover:opacity-100`}
      />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-ethereal-cyan/45 to-transparent" />

      {/* Video preview */}
      <button
        type="button"
        aria-label={`View ${miner.name} fullscreen`}
        className="relative mx-4 mt-4 flex h-52 w-[calc(100%-2rem)] cursor-pointer items-center justify-center overflow-hidden border border-cyan-100/8 bg-black/30 transition-colors hover:border-blue-400/28 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
        onClick={(e) => {
          e.stopPropagation();
          onOpenLightbox(miner);
        }}
      >
        <MinerVideoPlayer
          category={miner.category}
          minerType={miner.minerType}
          minerIndex={miner.minerIndex}
          autoPlay={true}
          loop={true}
          className="h-full w-auto max-w-full object-contain"
        />
      </button>

      {/* Body */}
      <div className="relative p-4">
        {/* Name + status */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="alchemy-heading truncate text-base leading-tight">{miner.name}</h3>
            <p className="mt-0.5 text-[0.65rem] text-cyan-50/38">
              ID #{miner.tokenId.toString()}
            </p>
          </div>
          <StatusChip status={miner.isMining ? "mining" : "idle"} />
        </div>

        {/* Stats */}
        <div className="mb-4 divide-y divide-cyan-100/8 border border-cyan-100/8 bg-black/20">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <Zap className="h-3.5 w-3.5 text-magma-gold/70" />
              Power
            </span>
            <span className="text-xs font-semibold text-white">{miner.miningPower}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <TrendingUp className="h-3.5 w-3.5 text-ethereal-cyan/55" />
              Efficiency
            </span>
            <span className="text-xs font-semibold text-white">{miner.efficiency}%</span>
          </div>
        </div>

        {/* Action */}
        {miner.isMining ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShowInfo("Unstaking feature in development");
            }}
            className="flex w-full items-center justify-center gap-2 border border-cyan-100/12 bg-black/30 py-3 text-xs font-semibold uppercase tracking-wider text-cyan-50/52 transition-all hover:border-ethereal-cyan/35 hover:text-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <Pickaxe className="h-3.5 w-3.5" />
            Stop Mining
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShowInfo("Staking feature in development");
            }}
            className="flex w-full items-center justify-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 py-3 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <Pickaxe className="h-3.5 w-3.5" />
            Send to Staking
          </button>
        )}
      </div>
    </article>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="border border-orange-300/18 bg-black/42 px-6 py-20 text-center shadow-[0_0_36px_rgba(240,106,18,0.06)] backdrop-blur-md">
      <Backpack className="mx-auto mb-5 h-9 w-9 text-magma-gold/55" />
      <h2 className="alchemy-heading mb-3 text-2xl">Empty Vault</h2>
      <p className="alchemy-copy mx-auto max-w-md text-sm leading-6 text-cyan-50/58">
        Forge Crystalline Geodes or hatch CoreMiners to begin your expedition
        in Lunacia.
      </p>
      <Link href="/forge">
        <span className="mx-auto mt-8 inline-flex items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-7 py-3 text-sm font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white">
          <Hammer className="h-4 w-4" />
          Go to the Forge
        </span>
      </Link>
    </div>
  );
}

// ─── Error Panel ──────────────────────────────────────────────────────────────

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="border border-magma-orange/35 bg-black/42 px-6 py-10 shadow-[0_0_36px_rgba(240,106,18,0.10)] backdrop-blur-md">
      <p className="mb-1 text-sm font-semibold text-magma-orange">Load Error</p>
      <p className="text-xs text-cyan-50/62">{message}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const metadataService = useMetadataService();
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();
  const { contractManager } = useContractManager();
  const inventoryFacade = useInventoryFacade();
  const forgeFacade = useForgeFacade();
  const nftFacade = useNFTFacade();

  const [geodes, setGeodes] = useState<GeodeInventoryInfo[]>([]);
  const [miners, setMiners] = useState<CoreMinerNFT[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHatchAnimation, setShowHatchAnimation] = useState(false);
  const [hatchingGeodeId, setHatchingGeodeId] = useState<bigint | null>(null);
  const [hatchingGeode, setHatchingGeode] = useState<GeodeInventoryInfo | null>(null);
  const [isTxConfirmed, setIsTxConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hatchedMiner, setHatchedMiner] = useState<{
    id: bigint;
    name: string;
    rarity: string;
    power: number;
    minerIndex: number;
    videoUrl: string;
    category: GeodeCategory;
    axieClass: AxieClass;
  } | null>(null);
  const [realHatchResult, setRealHatchResult] = useState<HatchResult | null>(null);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedGeode, setSelectedGeode] = useState<GeodeInventoryInfo | null>(null);
  const [selectedMiner, setSelectedMiner] = useState<CoreMinerNFT | null>(null);
  const [lightboxVideoUrl, setLightboxVideoUrl] = useState<string>("");

  const loadInventory = async () => {
    if (!address || !inventoryFacade || !nftFacade) {
      logger.debug("Carga de inventario omitida - falta address o facades");
      return;
    }

    logger.info("Iniciando carga de inventario del usuario");
    setIsLoading(true);
    setError(null);

    try {
      const [geodesData, minersData] = await Promise.all([
        inventoryFacade.getUserGeodes(address),
        nftFacade.getMinersFromWallet(address),
      ]);

      logger.info(
        `Inventario cargado: ${geodesData.length} geodas, ${minersData.length} miners`,
      );
      setGeodes(geodesData);
      setMiners(minersData);
    } catch (err) {
      logger.error("Error cargando inventario", err);
      setError(err instanceof Error ? err.message : "Error loading inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && inventoryFacade && nftFacade) {
      logger.debug("Condiciones OK - cargando inventario");
      loadInventory();
    }
  }, [isConnected, address, inventoryFacade, nftFacade]);

  useEffect(() => {
    if (!isConnected) {
      const timeout = setTimeout(() => {
        logger.info("No hay conexión - redirigiendo a landing page");
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isConnected, router]);

  const getTimeRemaining = (hatchTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = hatchTime - now;

    if (remaining <= 0) return "Ready to hatch";

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }

    return `${hours}h ${minutes}m remaining`;
  };

  const handleHatchGeode = async (geodeId: bigint) => {
    logger.info("Iniciando eclosión de geoda", { geodeId: geodeId.toString() });

    try {
      const geodeToHatch = geodes.find((g) => g.id === geodeId);

      if (!geodeToHatch) {
        logger.error("Geoda no encontrada", { geodeId: geodeId.toString() });
        return;
      }

      if (!contractManager) {
        logger.error("ContractManager no disponible");
        showError("Sistema no inicializado");
        return;
      }

      logger.debug("Configurando animación de eclosión", {
        geodeId: geodeId.toString(),
        fullName: geodeToHatch.fullName,
      });

      setHatchingGeodeId(geodeId);
      setHatchingGeode(geodeToHatch);
      setShowHatchAnimation(true);
      setIsTxConfirmed(false);

      setTimeout(async () => {
        try {
          logger.info("🔵 [DEBUG] Iniciando setTimeout de eclosión", {
            geodeId: geodeId.toString(),
          });
          showInfo("Enviando transacción de eclosión...");

          logger.info("🔵 [DEBUG] Obteniendo GeodeHatcher contract");
          const geodeHatcher = contractManager.getGeodeHatcher();

          logger.info(
            "🔵 [DEBUG] GeodeHatcher obtenido, llamando openGeode...",
            {
              geodeId: geodeId.toString(),
              geodeIdType: typeof geodeId,
              hasOpenGeode: typeof geodeHatcher.openGeode,
            },
          );

          let result;
          try {
            logger.info("🔵 [DEBUG] JUSTO ANTES de llamar openGeode");
            result = await geodeHatcher.openGeode(geodeId);
            logger.info("🔵 [DEBUG] JUSTO DESPUES de llamar openGeode", {
              txHash: result.transaction.hash,
              minerId: result.minerId.toString(),
              success: result.success,
            });
          } catch (openGeodeError) {
            logger.error("🔴 [DEBUG] ERROR en openGeode:", openGeodeError);
            throw openGeodeError;
          }

          logger.info("🔵 [DEBUG] openGeode completado", {
            txHash: result.transaction.hash,
            minerId: result.minerId.toString(),
            success: result.success,
          });

          logger.info("Eclosión exitosa", {
            txHash: result.transaction.hash,
            success: result.success,
            minerId: result.minerId.toString(),
            category: Number(result.category),
            minerType: Number(result.minerType),
            minerIndex: Number(result.minerIndex),
            isCritical: result.isCritical,
            finalPower: Number(result.finalPower),
          });

          showSuccess(
            `¡Geoda eclosionada! Minero ID: ${result.minerId} - Tx: ${result.transaction.hash.slice(0, 10)}...`,
          );

          setRealHatchResult(result);
          setIsTxConfirmed(true);

          logger.debug("Eclosión confirmada - esperando animación de ruleta");
        } catch (contractError) {
          const errorMsg =
            contractError instanceof Error
              ? contractError.message
              : String(contractError);
          logger.error("Error en eclosión", { error: errorMsg });

          let errorMessage = "Error al eclosionar geoda";
          if (contractError instanceof Error) {
            if (
              contractError.message.includes("user rejected") ||
              contractError.message.includes("User rejected")
            ) {
              errorMessage = "Transacción cancelada por el usuario";
            } else if (contractError.message.includes("insufficient funds")) {
              errorMessage = "Fondos insuficientes para gas";
            } else {
              errorMessage = contractError.message.substring(0, 100);
            }
          }

          showError(errorMessage);
          setShowHatchAnimation(false);
          setHatchingGeodeId(null);
          setHatchingGeode(null);
          setIsTxConfirmed(false);
        }
      }, 500);
    } catch (error) {
      logger.error("Error general en proceso de eclosión", error);
      setShowHatchAnimation(false);
      setHatchingGeodeId(null);
      setHatchingGeode(null);
    }
  };

  const handleRouletteComplete = async (fakeResult: ComponentHatchResult) => {
    logger.info("Ruleta de eclosión completada (datos fake de animación)");

    if (!hatchingGeode || !realHatchResult) {
      logger.error("No hay datos reales del contrato disponibles");
      return;
    }

    const { category, minerType, minerIndex, minerId } = realHatchResult;

    logger.info("Usando datos REALES del contrato", {
      minerId: minerId.toString(),
      category,
      minerType,
      minerIndex,
    });

    const { getLocalMinerName, getLocalMinerVideo } = await import(
      "@/lib/utils/data/localMinerData"
    );
    const { getMinerPower, getMinerAttribute } = await import(
      "@/lib/services/LocalMetadataService"
    );

    const [realName, realVideoUrl, realPower, realRarity] = await Promise.all([
      getLocalMinerName(category, minerType, minerIndex),
      getLocalMinerVideo(category, minerType, minerIndex),
      getMinerPower(category, minerType, minerIndex),
      getMinerAttribute(category, minerType, minerIndex, "Rarity"),
    ]);

    logger.info("Metadata real cargada desde JSON", {
      realName,
      realPower,
      realRarity,
      realVideoUrl,
      category,
      minerType,
      minerIndex,
    });

    setHatchedMiner({
      id: minerId,
      name: realName,
      rarity: (realRarity as string) || "Common",
      power: realPower,
      minerIndex: minerIndex,
      videoUrl: realVideoUrl,
      category: hatchingGeode.category,
      axieClass: hatchingGeode.axieClass,
    });

    logger.debug("Mostrando modal de éxito");
    setTimeout(() => {
      setShowHatchAnimation(false);
      setShowSuccessModal(true);
      setIsTxConfirmed(false);
    }, 1500);
  };

  const totalItems = geodes.length + miners.length;

  // ── Connection guard ──────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-deep-abyss">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(125,249,255,0.08),transparent_60%)]" />
        <div className="relative">
          <Loading size="lg" text="Verifying connection…" />
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="alchemy-copy relative min-h-screen overflow-hidden bg-deep-abyss pt-28 text-white">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(125,249,255,0.10),transparent_30%),radial-gradient(circle_at_18%_42%,rgba(240,106,18,0.10),transparent_28%),linear-gradient(180deg,#020607_0%,#030b0e_50%,#010203_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72),transparent_18%,transparent_82%,rgba(0,0,0,0.72))]" />

        <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 pb-24 md:px-8">

          {/* ── Hero ── */}
          <header className="mb-10">
            <p className="alchemy-eyebrow mb-3 text-xs">Prospector Vault</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="alchemy-heading-strong text-3xl leading-tight md:text-5xl">
                  My Inventory
                </h1>
                {!isLoading && (
                  <p className="mt-2 text-sm text-cyan-50/42">
                    {totalItems} {totalItems === 1 ? "item" : "items"} — Geodes &amp; CoreMiners
                  </p>
                )}
              </div>

              {/* Header actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadInventory}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 border border-cyan-100/12 bg-black/42 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50/58 transition-all hover:border-ethereal-cyan/45 hover:text-cyan-50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <Link href="/dashboard">
                  <span className="inline-flex items-center gap-2 border border-cyan-100/12 bg-black/42 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50/58 transition-all hover:border-ethereal-cyan/45 hover:text-cyan-50">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Dashboard
                  </span>
                </Link>
                <Link href="/forge">
                  <span className="inline-flex items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white">
                    <Hammer className="h-3.5 w-3.5" />
                    Forge Geode
                  </span>
                </Link>
              </div>
            </div>
          </header>

          {/* ── Tabs ── */}
          {!isLoading && !error && totalItems > 0 && (
            <nav className="mb-8 flex flex-wrap gap-2" aria-label="Inventory filter">
              <TabButton
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                icon={Layers}
                label="All"
                count={totalItems}
              />
              <TabButton
                active={activeTab === "geodes"}
                onClick={() => setActiveTab("geodes")}
                icon={Egg}
                label="Geodes"
                count={geodes.length}
              />
              <TabButton
                active={activeTab === "miners"}
                onClick={() => setActiveTab("miners")}
                icon={Pickaxe}
                label="CoreMiners"
                count={miners.length}
              />
            </nav>
          )}

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-28">
              <Loading size="lg" text="Loading inventory…" />
            </div>
          )}

          {/* ── Error ── */}
          {error && !isLoading && <ErrorPanel message={error} />}

          {/* ── Empty ── */}
          {!isLoading && !error && totalItems === 0 && <EmptyState />}

          {/* ── Content ── */}
          {!isLoading && !error && totalItems > 0 && (
            <div className="space-y-14">

              {/* Geodes */}
              {(activeTab === "all" || activeTab === "geodes") && geodes.length > 0 && (
                <section>
                  <header className="mb-6 flex items-center gap-3">
                    <Egg className="h-5 w-5 text-magma-gold" />
                    <h2 className="alchemy-heading text-xl">Crystalline Geodes</h2>
                    <span className="border border-magma-gold/35 bg-orange-500/8 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-widest text-magma-gold/75">
                      {geodes.length}
                    </span>
                  </header>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {geodes.map((geode) => (
                      <GeodeCard
                        key={geode.id.toString()}
                        geode={geode}
                        isHatching={hatchingGeodeId === geode.id}
                        onHatch={handleHatchGeode}
                        onOpenLightbox={(g) => {
                          const categoryName =
                            CATEGORY_INFO[g.category].name.toLowerCase();
                          const categoryUpper =
                            CATEGORY_INFO[g.category].name.toUpperCase();
                          const classUpper =
                            AXIE_CLASS_INFO[g.axieClass].name.toUpperCase();
                          setLightboxVideoUrl(
                            `/assets/geodes/${categoryName}/GEODA_${categoryUpper}_${classUpper}.mp4`,
                          );
                          setSelectedGeode(g);
                          setLightboxOpen(true);
                        }}
                        getTimeRemaining={getTimeRemaining}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* CoreMiners */}
              {(activeTab === "all" || activeTab === "miners") && miners.length > 0 && (
                <section>
                  <header className="mb-6 flex items-center gap-3">
                    <Pickaxe className="h-5 w-5 text-ethereal-cyan" />
                    <h2 className="alchemy-heading text-xl">CoreMiners</h2>
                    <span className="border border-ethereal-cyan/35 bg-cyan-300/6 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-widest text-ethereal-cyan/65">
                      {miners.length}
                    </span>
                  </header>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {miners.map((miner) => (
                      <MinerCard
                        key={miner.tokenId.toString()}
                        miner={miner}
                        onOpenLightbox={async (m) => {
                          try {
                            const { getLocalMinerVideo } = await import(
                              "@/lib/utils/data/localMinerData"
                            );
                            const videoUrl = await getLocalMinerVideo(
                              m.category,
                              m.minerType,
                              m.minerIndex,
                            );
                            setLightboxVideoUrl(videoUrl);
                            setSelectedMiner(m);
                            setLightboxOpen(true);
                          } catch (err) {
                            logger.error("Error loading miner video", err);
                          }
                        }}
                        onShowInfo={showInfo}
                        onNavigate={(tokenId) =>
                          router.push(`/coreminer/${tokenId}`)
                        }
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* ── Overlays ── */}
      {showHatchAnimation && hatchingGeode && (
        <HatchRoulette
          category={hatchingGeode.category}
          axieClass={hatchingGeode.axieClass}
          isVisible={showHatchAnimation}
          onComplete={handleRouletteComplete}
          loopUntilConfirm={true}
          isConfirmed={isTxConfirmed}
          selectedMinerIndex={realHatchResult?.minerIndex}
        />
      )}

      {showSuccessModal && hatchedMiner && (
        <HatchSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setHatchedMiner(null);
            setHatchingGeodeId(null);
            setHatchingGeode(null);
            setRealHatchResult(null);
            logger.debug("Modal cerrado - recargando inventario");
            loadInventory();
          }}
          category={hatchedMiner.category}
          axieClass={hatchedMiner.axieClass}
          minerId={hatchedMiner.id}
          minerName={hatchedMiner.name}
          minerRarity={hatchedMiner.rarity}
          minerPower={hatchedMiner.power}
          minerIndex={hatchedMiner.minerIndex}
          minerVideoUrl={hatchedMiner.videoUrl}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {(selectedGeode || selectedMiner) && lightboxVideoUrl && (
        <Lightbox
          open={lightboxOpen}
          close={() => {
            setLightboxOpen(false);
            setSelectedGeode(null);
            setSelectedMiner(null);
            setLightboxVideoUrl("");
          }}
          slides={[
            {
              type: "video",
              sources: [{ src: lightboxVideoUrl, type: "video/mp4" }],
              width: 1920,
              height: 1080,
            },
          ]}
          carousel={{ finite: true }}
          controller={{ closeOnBackdropClick: true }}
          toolbar={{ buttons: ["close"] }}
          render={{
            slide: ({ slide }) => {
              if (slide.type === "video" && slide.sources) {
                return (
                  <div className="flex h-full w-full items-center justify-center bg-black">
                    <video
                      autoPlay
                      loop
                      muted
                      controls
                      className="max-h-full max-w-full"
                      style={{ objectFit: "contain" }}
                    >
                      {slide.sources.map((source, idx) => (
                        <source key={idx} src={source.src} type={source.type} />
                      ))}
                    </video>
                  </div>
                );
              }
              return null;
            },
          }}
        />
      )}
    </>
  );
}
