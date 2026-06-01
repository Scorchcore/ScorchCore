"use client";

import {
  AlertTriangle,
  Boxes,
  Flame,
  Gem,
  Hammer,
  type LucideIcon,
  PackageOpen,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GeodeVideo } from "@/components/GeodeVideo";
import { Button, Modal } from "@/components/ui";
import type { AxieClass, GeodeCategory } from "@/lib/constants/geodes";
import { createServiceLogger } from "@/lib/utils/logging/logger";

const log = createServiceLogger("ForgeAnimationPanel");

export type ForgeStage =
  | "stage1"
  | "stage2"
  | "stage3"
  | "stage4"
  | "success"
  | "fail";

interface ForgeAnimationPanelProps {
  // Estado actual de la forja
  stage: ForgeStage;

  // Datos de la geoda seleccionada (para mostrar en éxito)
  selectedCategory?: GeodeCategory;
  selectedClass?: AxieClass;
  forgedGeodeId?: bigint | null;

  // Callbacks
  onStageComplete?: (stage: ForgeStage) => void;
  onSuccessModalClose?: () => void;
  onFailModalClose?: () => void;

  // Props opcionales
  className?: string;
}

const STAGE_META: Record<
  ForgeStage,
  {
    label: string;
    description: string;
    icon: LucideIcon;
    tone: string;
  }
> = {
  stage1: {
    label: "Selecciona una categoría",
    description: "Define la familia cristalina que guiará la transmutación.",
    icon: Gem,
    tone: "text-ethereal-cyan",
  },
  stage2: {
    label: "Selecciona una clase de Axie",
    description: "El memento alineará la geoda con su energía de origen.",
    icon: Boxes,
    tone: "text-magma-gold",
  },
  stage3: {
    label: "Listo para forjar",
    description: "Revisa los costos y aprueba los materiales para continuar.",
    icon: Sparkles,
    tone: "text-ethereal-cyan",
  },
  stage4: {
    label: "Forjando",
    description: "La forja está procesando la transmutación en cadena.",
    icon: Hammer,
    tone: "text-magma-orange",
  },
  success: {
    label: "Forja exitosa",
    description: "La geoda fue creada y está lista para tu inventario.",
    icon: Sparkles,
    tone: "text-magma-gold",
  },
  fail: {
    label: "Forja fallida",
    description: "El RNG consumió los materiales durante la transmutación.",
    icon: AlertTriangle,
    tone: "text-magma-orange",
  },
};

const VIDEO_PATHS: Partial<Record<ForgeStage, string>> = {
  stage1: "/forge-videos/forge-stage-1.mp4",
  stage2: "/forge-videos/forge-stage2.mp4",
  stage3: "/forge-videos/forge-stage-3.mp4",
  stage4: "/forge-videos/forge-stage-4.mp4",
  fail: "/forge-videos/forge-stage-fail.mp4",
};

function shouldLoop(currentStage: ForgeStage): boolean {
  return ["stage1", "stage2", "stage3"].includes(currentStage);
}

function ForgeVisualFallback({
  stage,
  compact = false,
}: {
  stage: ForgeStage;
  compact?: boolean;
}) {
  const meta = STAGE_META[stage];
  const Icon = meta.icon;

  return (
    <div className="relative flex h-full min-h-56 items-center justify-center overflow-hidden border border-cyan-100/10 bg-black/50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(247,198,90,0.16),transparent_32%),radial-gradient(circle_at_54%_58%,rgba(125,249,255,0.12),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-1/2 h-px bg-gradient-to-r from-transparent via-magma-gold/60 to-transparent" />
      <div className="relative text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-magma-gold/35 bg-black/60 shadow-[0_0_34px_rgba(240,106,18,0.18)]">
          <Icon className={`h-7 w-7 ${meta.tone}`} />
        </div>
        <p className="alchemy-eyebrow mb-2 text-[0.62rem]">Elemental Forge</p>
        <p
          className={`alchemy-heading-strong leading-none ${
            compact ? "text-2xl" : "text-3xl"
          }`}
        >
          {meta.label}
        </p>
      </div>
    </div>
  );
}

/**
 * Componente que maneja la animación de forja con videos.
 * Controla las transiciones entre stages y muestra modales de resultado.
 */
export function ForgeAnimationPanel({
  stage,
  selectedCategory,
  selectedClass,
  forgedGeodeId,
  onStageComplete,
  onSuccessModalClose,
  onFailModalClose,
  className = "",
}: ForgeAnimationPanelProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const meta = STAGE_META[stage];
  const StageIcon = meta.icon;
  const videoPath = VIDEO_PATHS[stage];
  const shouldRenderVideo = Boolean(videoPath) && !videoError;

  useEffect(() => {
    setVideoError(false);

    if (stage === "success") {
      setIsTransitioning(false);
      return;
    }

    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [stage]);

  const handleVideoEnded = () => {
    if (stage === "stage4") {
      onStageComplete?.(stage);
    } else if (stage === "fail") {
      setShowFailModal(true);
    }
  };

  useEffect(() => {
    if (stage === "success" && forgedGeodeId) {
      setShowSuccessModal(true);
    }
  }, [stage, forgedGeodeId]);

  useEffect(() => {
    if (stage === "fail" && videoError) {
      setShowFailModal(true);
    }
  }, [stage, videoError]);

  const handleVideoError = () => {
    setVideoError(true);
    log.warn("Forge animation video unavailable, showing visual fallback", {
      stage,
      videoPath,
    });
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccessModalClose?.();
  };

  const handleFailModalClose = () => {
    setShowFailModal(false);
    onFailModalClose?.();
  };

  return (
    <>
      <div
        className={`relative overflow-hidden border border-cyan-100/12 bg-black/42 shadow-[inset_0_0_28px_rgba(125,249,255,0.05),0_18px_50px_rgba(0,0,0,0.34)] ${className}`}
      >
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-orange-500/12 via-transparent to-cyan-300/8" />
        <div className="pointer-events-none absolute left-0 top-0 z-[2] h-full w-px bg-gradient-to-b from-transparent via-magma-gold/70 to-transparent" />

        {isTransitioning && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/62 backdrop-blur-sm">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-magma-gold border-t-transparent" />
          </div>
        )}

        <div className="relative h-full w-full">
          {shouldRenderVideo && videoPath ? (
            <video
              ref={videoRef}
              key={`forge-${stage}`}
              autoPlay
              loop={shouldLoop(stage)}
              muted
              playsInline
              preload="auto"
              className="h-full w-full bg-black/35 object-contain"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            >
              <source src={videoPath} type="video/mp4" />
            </video>
          ) : (
            <ForgeVisualFallback stage={stage} />
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/86 via-black/52 to-transparent p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-cyan-100/14 bg-black/58">
              <StageIcon className={`h-5 w-5 ${meta.tone}`} />
            </div>
            <div className="min-w-0">
              <p className="alchemy-heading text-lg leading-tight">
                {meta.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-cyan-50/62">
                {meta.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Forja Exitosa"
        size="lg"
      >
        <div className="space-y-6 text-center">
          {selectedCategory !== undefined && selectedClass !== undefined ? (
            <div className="mx-auto aspect-square max-w-sm overflow-hidden border border-magma-gold/30 bg-black/55 shadow-[0_0_36px_rgba(240,106,18,0.14)]">
              <GeodeVideo
                category={selectedCategory}
                axieClass={selectedClass}
                className="h-full w-full"
                autoPlay={true}
              />
            </div>
          ) : (
            <div className="mx-auto aspect-square max-w-sm">
              <ForgeVisualFallback stage="success" compact />
            </div>
          )}

          <div>
            <p className="alchemy-eyebrow mb-3 text-[0.68rem]">
              Crystalline Geode
            </p>
            <h3 className="alchemy-heading-strong mb-2 text-3xl leading-tight">
              Geoda Forjada con Éxito
            </h3>
            {forgedGeodeId && (
              <p className="text-sm text-cyan-50/62">
                Token ID:{" "}
                <span className="font-semibold text-ethereal-cyan">
                  #{forgedGeodeId.toString()}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="primary"
              className="rounded-none border border-ethereal-cyan/55 bg-none from-transparent to-transparent bg-cyan-300/14 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:from-transparent hover:to-transparent hover:text-white focus:ring-cyan-300/75"
              leftIcon={<PackageOpen className="h-4 w-4" />}
              onClick={() => {
                handleSuccessModalClose();
                router.push("/inventory");
              }}
            >
              Ver en Inventario
            </Button>
            <Button
              variant="secondary"
              className="rounded-none border border-cyan-100/14 bg-black/42 text-cyan-50/72 hover:border-ethereal-cyan/45 hover:bg-black/56 hover:text-cyan-50 focus:ring-cyan-300/75"
              leftIcon={<Hammer className="h-4 w-4" />}
              onClick={handleSuccessModalClose}
            >
              Forjar Otra
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFailModal}
        onClose={handleFailModalClose}
        title="Forja Fallida"
        size="md"
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-18 w-18 items-center justify-center border border-magma-orange/40 bg-orange-500/10 shadow-[0_0_34px_rgba(240,106,18,0.16)]">
            <AlertTriangle className="h-8 w-8 text-magma-orange" />
          </div>
          <div>
            <p className="alchemy-eyebrow mb-3 text-[0.68rem]">RNG Outcome</p>
            <h3 className="alchemy-heading mb-3 text-2xl leading-tight">
              La forja ha fallado
            </h3>
            <p className="mx-auto max-w-md text-sm leading-7 text-cyan-50/62">
              Los recursos fueron consumidos por el resultado aleatorio de la
              transmutación. Puedes volver a intentarlo con más mementos para
              reducir el riesgo.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleFailModalClose}
            fullWidth
            className="rounded-none border border-ethereal-cyan/55 bg-none from-transparent to-transparent bg-cyan-300/14 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:from-transparent hover:to-transparent hover:text-white focus:ring-cyan-300/75"
            leftIcon={<Flame className="h-4 w-4" />}
          >
            Intentar de Nuevo
          </Button>
        </div>
      </Modal>
    </>
  );
}
