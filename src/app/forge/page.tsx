"use client";

import {
  ArrowLeft,
  BarChart3,
  Coins,
  Flame,
  Gem,
  Hammer,
  Lock,
  Minus,
  Plus,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { AxieBonusIndicator } from "@/components/axie";
import { ForgeAnimationPanel } from "@/components/features/forge/ForgeAnimationPanel";
import {
  TrustScoreBadge,
  TrustScoreRequirementTooltip,
} from "@/components/trustscore";
// import { useCategorySupply } from '@/hooks/useForgeSupply'; // Deshabilitado temporalmente
import { Badge, Button, Card, Loading, Toast, useToast } from "@/components/ui";
import {
  ALL_AXIE_CLASSES,
  AVAILABLE_CATEGORIES,
  AXIE_CLASS_INFO,
  AxieClass,
  CATEGORY_INFO,
  GeodeCategory,
  getGeodeName,
  getMementoIcon,
} from "@/lib/constants/geodes";
import type { MaterialInput } from "@/lib/contracts/interfaces/IForgeContract";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import { useContracts } from "@/lib/hooks/contracts/useContracts";
import { useMementoBalances } from "@/lib/hooks/economy/useMementoBalances";
import { useAxies } from "@/lib/hooks/nfts/useAxies";
import { useTrustScore } from "@/lib/hooks/user/useTrustScore";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { ForgeFacade } from "@/lib/services/forge/ForgeFacade";
import { createServiceLogger } from "@/lib/utils/logging/logger";

// TODO: Crear hook useForgeStage
// import { useForgeStage } from '@/lib/hooks/useForgeStage';

const logger = createServiceLogger("ForgePage");

export default function ForgePage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const contracts = useContracts();
  const { contractManager, signer } = useContractManager();
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();
  const { balances: mementoBalances, reload: reloadMementoBalances } =
    useMementoBalances();
  const { trustScoreInfo } = useTrustScore();
  const { axies } = useAxies();

  // ForgeFacade para toda la lógica de forja
  // Solo crear si hay contractManager, signer Y provider disponible
  const forgeFacade = React.useMemo(() => {
    if (!contractManager || !isConnected || !address || !signer) {
      logger.debug("ForgeFacade not created", {
        hasContractManager: !!contractManager,
        isConnected,
        hasAddress: !!address,
        hasSigner: !!signer,
      });
      return null;
    }

    const provider = contractManager.getProvider();
    if (!provider) {
      logger.info("No provider available, ForgeFacade not created");
      return null;
    }

    logger.info("Creating ForgeFacade with signer");
    return new ForgeFacade(contractManager);
  }, [contractManager, isConnected, address, signer]);

  // Estados
  const [selectedCategory, setSelectedCategory] = useState<
    GeodeCategory | undefined
  >(undefined);
  const [selectedClass, setSelectedClass] = useState<AxieClass | undefined>(
    undefined,
  );

  // Supply real de la categoría seleccionada (después de declarar selectedCategory)
  // Auto-refresh desactivado para evitar loops si no hay provider
  // const { supplyInfo, refetch: refetchSupply } = useCategorySupply(selectedCategory, {
  //   autoRefresh: false, // Desactivado hasta que el provider esté estable
  //   refreshInterval: 15000,
  // });
  const [mementosToUse, setMementosToUse] = useState<number>(0);
  const [forgeStep, setForgeStep] = useState<
    "select" | "approve" | "forge" | "success"
  >("select");
  const [isForging, setIsForging] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [forgedGeodeId, setForgedGeodeId] = useState<bigint | null>(null);
  const [, setForgeFailed] = useState(false);
  const [forgeAnimationStage, setForgeAnimationStage] = useState<
    "stage1" | "stage2" | "stage3" | "stage4" | "success" | "fail"
  >("stage1");
  const approvedMementosRef = useRef<number>(0);

  // Hook para manejar stages de animación
  const forgeStage = {
    stage: "idle" as const,
    currentStage: forgeAnimationStage,
    animationComplete: false,
    resetToStage1: () => setForgeAnimationStage("stage1"),
  };

  // Mapeo de requisitos de TrustScore por categoría (según contrato Forge)
  // Categorías reales: PETIT (0), ALTO (1), ANIMAL (2), ULTRAMECH (3), TANQUE (4)
  const CATEGORY_TRUST_REQUIREMENTS: Record<
    GeodeCategory,
    { level: number; minScore: number }
  > = {
    [GeodeCategory.PETIT]: { level: 0, minScore: 0 }, // Basic - Sin requisito
    [GeodeCategory.ALTO]: { level: 1, minScore: 201 }, // Intermediate
    [GeodeCategory.ANIMAL]: { level: 2, minScore: 401 }, // Advanced
    [GeodeCategory.ULTRAMECH]: { level: 2, minScore: 401 }, // Advanced
    [GeodeCategory.TANQUE]: { level: 3, minScore: 701 }, // Elite
  };

  // Información de la geoda seleccionada (con valores por defecto para evitar errores)
  const categoryInfo =
    selectedCategory !== undefined
      ? CATEGORY_INFO[selectedCategory]
      : CATEGORY_INFO[GeodeCategory.PETIT];
  const classInfo =
    selectedClass !== undefined
      ? AXIE_CLASS_INFO[selectedClass]
      : AXIE_CLASS_INFO[AxieClass.BEAST];
  const geodeName =
    selectedCategory !== undefined && selectedClass !== undefined
      ? getGeodeName(selectedCategory, selectedClass)
      : "Selecciona una geoda";

  // Verificar acceso a la categoría seleccionada
  const categoryRequirement =
    selectedCategory !== undefined
      ? CATEGORY_TRUST_REQUIREMENTS[selectedCategory]
      : null;
  const hasAccessToCategory =
    !categoryRequirement ||
    !trustScoreInfo ||
    trustScoreInfo.level >= categoryRequirement.level;
  const userScore = trustScoreInfo?.score ?? 0;
  const userLevel = trustScoreInfo?.level ?? 0;

  // Calcular bonus de Axie Staking
  const stakedAxiesCount = axies.filter((axie) => axie.isStaked).length;

  // Calcular probabilidad de fallo con mementos
  const baseFailureChance = categoryInfo.failureRate;
  const reduction = Math.floor(mementosToUse / 10); // Cada 10 mementos reduce 1%
  const currentFailureChance = Math.max(0, baseFailureChance - reduction);

  // Costos
  const axsCost = categoryInfo.defaultCost.axs;
  const slpCost = categoryInfo.defaultCost.slp;
  const mementoCost = categoryInfo.defaultCost.memento;
  const totalMementoCost = Number(mementoCost) + mementosToUse;

  // Redirect si no está conectado (con delay para evitar reset al cambiar wallet)
  useEffect(() => {
    if (!isConnected) {
      // Delay para permitir cambio de wallet sin redirect inmediato
      const timer = setTimeout(() => {
        if (!isConnected) {
          router.push("/");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  // Cambiar stage de animación cuando se selecciona categoría
  useEffect(() => {
    if (selectedCategory !== undefined && selectedClass === undefined) {
      setForgeAnimationStage("stage2"); // Usuario seleccionó categoría, mostrar video stage2
      logger.info("Stage cambiado a 2 - categoría seleccionada", {
        selectedCategory,
      });
    } else if (selectedCategory === undefined) {
      setForgeAnimationStage("stage1"); // Reset a stage1 si no hay categoría
    }
  }, [selectedCategory, selectedClass]);

  // Cambiar stage de animación cuando se selecciona clase
  useEffect(() => {
    if (selectedCategory !== undefined && selectedClass !== undefined) {
      setForgeAnimationStage("stage3");
      logger.info("Stage cambiado a 3", { selectedClass });
    }
  }, [selectedCategory, selectedClass]);

  // Resetear mementos al cambiar geoda
  useEffect(() => {
    logger.info("Reset de selección", {
      selectedCategory,
      selectedClass,
    });
    setMementosToUse(0);
    setForgeStep("select");
    setForgeFailed(false);
    setForgedGeodeId(null);
    approvedMementosRef.current = 0;
  }, [selectedCategory, selectedClass]);

  // Resetear a approve si cambian los mementos después de aprobar
  useEffect(() => {
    if (
      forgeStep === "forge" &&
      mementosToUse !== approvedMementosRef.current
    ) {
      logger.info("Mementos cambiados después de aprobación", {
        current: mementosToUse,
        approved: approvedMementosRef.current,
      });
      setForgeStep("approve");
    }
  }, [mementosToUse, forgeStep]);

  const handleApprove = async () => {
    logger.info("Iniciando aprobación de tokens", {
      address,
      selectedCategory,
      selectedClass,
      mementosToUse,
      totalCost: { axsCost, slpCost, totalMementoCost },
    });

    if (!address || !forgeFacade) {
      showError("Wallet no conectada o facade no inicializado");
      return;
    }

    if (selectedCategory === undefined || selectedClass === undefined) {
      showError("Selecciona una categoría y clase de geoda");
      return;
    }

    if (!contracts) {
      showError("Contratos no inicializados");
      return;
    }

    try {
      setIsApproving(true);
      showInfo("Aprobando tokens necesarios...");

      // Usar ForgeTokenService para aprobar cada token
      // AXS
      showInfo("Aprobando AXS...");
      await forgeFacade.approveToken(
        "axs",
        (Number(axsCost) * 1e18).toString(),
      );

      // SLP
      showInfo("Aprobando SLP...");
      await forgeFacade.approveToken(
        "slp",
        (Number(slpCost) * 1e18).toString(),
      );

      // Memento
      showInfo("Aprobando Mementos...");
      await forgeFacade.approveToken(
        "memento",
        (Number(totalMementoCost) * 1e18).toString(),
      );

      // Guardar el valor de mementos aprobado
      approvedMementosRef.current = mementosToUse;
      setForgeStep("forge");
      showSuccess("✅ Tokens aprobados correctamente");

      logger.info("Aprobación completada exitosamente");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al aprobar tokens";
      logger.error("Error en aprobación", err, {
        selectedCategory,
        selectedClass,
      });
      showError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleForge = async () => {
    logger.info("Iniciando forja de geoda", {
      address,
      selectedCategory,
      selectedClass,
      mementosToUse,
      costs: { axsCost, slpCost, totalMementoCost },
    });

    if (!address || !forgeFacade || !contracts) {
      showError("Wallet no conectada o facade no inicializado");
      return;
    }

    if (selectedCategory === undefined || selectedClass === undefined) {
      showError("Selecciona una categoría y clase de geoda");
      return;
    }

    try {
      setIsForging(true);
      showInfo("Forjando geoda...");

      // Mapear clase de Axie a clave de memento
      const mementoKey = [
        "beast",
        "aqua",
        "bird",
        "reptile",
        "bug",
        "plant",
        "mech",
        "dusk",
        "dawn",
      ][selectedClass] as keyof typeof contracts.mementos;
      const mementoAddress = contracts.mementos[mementoKey];

      logger.info("🔍 DEBUG Memento mapping", {
        selectedClass,
        mementoKey,
        mementoAddress,
        allMementos: contracts.mementos,
      });

      // Validar que mementoAddress existe
      if (
        !mementoAddress ||
        mementoAddress === null ||
        mementoAddress === undefined ||
        mementoAddress === "0x0000000000000000000000000000000000000000"
      ) {
        logger.error("❌ Memento address validation failed", {
          mementoKey,
          mementoAddress,
          isUndefined: mementoAddress === undefined,
          isNull: mementoAddress === null,
          isZeroAddress:
            mementoAddress === "0x0000000000000000000000000000000000000000",
        });
        showError(
          `Memento token para clase ${String(mementoKey)} no disponible en esta red`,
        );
        return;
      }

      const materials: MaterialInput[] = [
        {
          tokenAddress: contracts.axsToken as `0x${string}`,
          amount: BigInt(Math.floor(Number(axsCost) * 1e18)),
        },
        {
          tokenAddress: contracts.slpToken as `0x${string}`,
          amount: BigInt(Math.floor(Number(slpCost) * 1e18)),
        },
        {
          tokenAddress: mementoAddress as `0x${string}`,
          amount: BigInt(Math.floor(Number(totalMementoCost) * 1e18)),
        },
      ];

      // Recipe IDs son 1-indexed (categoría 0 = receta 1)
      const recipeId = selectedCategory + 1;

      // Usar ForgeFacade - ya tiene retry automático integrado
      showInfo("Esperando confirmación de transacción...");
      logger.info("Forging with mementos", {
        mementosToUse,
        reduction,
        currentFailureChance,
      });
      const result = await forgeFacade.forgeRecipe(
        recipeId,
        materials,
        selectedClass,
        mementosToUse,
      );

      // Verificar resultado
      if (result.success && result.geodeId) {
        setForgedGeodeId(result.geodeId);
        setForgeStep("success");
        setForgeAnimationStage("success"); // Activar modal de éxito (sin video de fondo)
        setForgeFailed(false);
        showSuccess(
          `¡Geoda ${geodeName} forjada con éxito! Token ID: ${result.geodeId}`,
        );
        logger.info("Forja exitosa", {
          geodeId: result.geodeId?.toString(),
          category: selectedCategory,
          class: selectedClass,
          txHash: result.transaction.hash,
        });

        // Refrescar balances de mementos en la UI
        await reloadMementoBalances();
      } else {
        // La forja falló por RNG
        setForgeFailed(true);
        setForgeAnimationStage("fail"); // Mostrar video de fallo
        showError(
          `La forja falló debido al RNG (${currentFailureChance}% de probabilidad). Los tokens fueron consumidos.`,
        );
        logger.warn("Forja fallida por RNG", {
          recipeId,
          failureChance: currentFailureChance,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al forjar geoda";
      logger.error("Error en forja", err, { selectedCategory, selectedClass });
      showError(errorMessage);
    } finally {
      setIsForging(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="alchemy-copy flex min-h-screen items-center justify-center bg-deep-abyss text-white">
        <Loading />
      </div>
    );
  }

  return (
    <main className="alchemy-copy relative min-h-screen overflow-hidden bg-deep-abyss pt-28 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(125,249,255,0.15),transparent_30%),radial-gradient(circle_at_18%_34%,rgba(240,106,18,0.16),transparent_30%),radial-gradient(circle_at_82%_44%,rgba(247,198,90,0.1),transparent_24%),linear-gradient(180deg,#020607_0%,#030b0e_48%,#010203_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),transparent_20%,transparent_80%,rgba(0,0,0,0.78)),radial-gradient(ellipse_at_center,transparent_0_42%,rgba(0,0,0,0.62)_100%)]" />

      <div className="relative z-[1] mx-auto w-full max-w-7xl px-4 pb-20 md:px-8">
        {/* Header */}
        <header className="mb-10">
          <Link
            href="/"
            className="mb-6 inline-flex min-h-11 items-center gap-2 border border-cyan-100/14 bg-black/42 px-4 py-2 text-xs font-semibold uppercase text-cyan-50/66 transition-all hover:border-magma-gold/55 hover:text-magma-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="alchemy-eyebrow mb-4 text-xs">Elemental Forge</p>
              <h1 className="alchemy-heading-strong text-balance text-4xl leading-tight md:text-6xl">
                Forja de Geodas
              </h1>
              <p className="alchemy-copy mt-5 max-w-2xl text-pretty text-sm leading-7 text-white/72 md:text-base">
                Combina recursos para crear geodas cristalinas únicas
              </p>
              <div className="mt-7 flex w-fit items-center gap-2 border border-ethereal-cyan/25 bg-black/35 px-4 py-2 text-xs text-cyan-50/70 shadow-[0_0_24px_rgba(125,249,255,0.08)]">
                <Sparkles className="h-3.5 w-3.5 text-ethereal-cyan" />
                <span>Transmutación activa</span>
              </div>
            </div>
            {trustScoreInfo && (
              <div className="w-fit border border-cyan-100/12 bg-black/42 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md">
                <TrustScoreBadge
                  score={trustScoreInfo.score}
                  level={trustScoreInfo.level}
                  levelName={trustScoreInfo.levelName}
                  isFlagged={trustScoreInfo.flagged}
                  isStale={trustScoreInfo.isStale}
                  size="md"
                  showLabel={true}
                />
              </div>
            )}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)]">
          {/* Panel Izquierdo: Selectores */}
          <div className="space-y-6">
            {/* Selector de Categoría */}
            <Card
              variant="glass"
              className="relative overflow-hidden rounded-none border-cyan-100/12 bg-black/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
            >
              <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-magma-gold/70 to-transparent" />
              <h2 className="alchemy-heading mb-4 flex items-center gap-3 text-2xl leading-tight">
                <Gem className="h-5 w-5 text-ethereal-cyan" />
                1. Categoría de Geoda
              </h2>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {AVAILABLE_CATEGORIES.map((cat) => {
                  const requirement = CATEGORY_TRUST_REQUIREMENTS[cat.id];
                  const hasAccess =
                    !trustScoreInfo ||
                    trustScoreInfo.level >= requirement.level;
                  const isLocked = !hasAccess;

                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => !isLocked && setSelectedCategory(cat.id)}
                      disabled={isLocked}
                      className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden border p-4 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                        isLocked
                          ? "cursor-not-allowed border-red-400/35 bg-red-500/10 opacity-60"
                          : selectedCategory === cat.id
                            ? "border-magma-gold/75 bg-orange-500/14 shadow-[0_0_28px_rgba(240,106,18,0.18)]"
                            : "border-cyan-100/12 bg-black/35 hover:-translate-y-0.5 hover:border-ethereal-cyan/45 hover:bg-black/48"
                      }`}
                      title={
                        isLocked
                          ? `Requiere Trust Score nivel ${requirement.level}`
                          : ""
                      }
                    >
                      <div className="w-12 h-12 mb-3 relative">
                        <Image
                          src={cat.icon}
                          alt={cat.name}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      </div>
                      <div className="alchemy-heading mb-1 text-lg leading-tight">
                        {cat.name}
                      </div>
                      <div className="mb-2 text-xs text-cyan-50/58">
                        {cat.rarity}
                      </div>
                      <div className="space-y-1 text-xs text-cyan-50/48">
                        <div>Max: {cat.maxSupply.toLocaleString()}</div>
                        <div className="flex items-center justify-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-magma-orange" />
                          <span>{cat.failureRate}%</span>
                        </div>
                      </div>
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/68">
                          <Lock className="h-7 w-7 text-magma-gold" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mostrar requisito de TrustScore si la categoría seleccionada requiere nivel */}
              {selectedCategory !== undefined &&
                categoryRequirement &&
                categoryRequirement.level > 0 && (
                  <div className="mt-4">
                    <TrustScoreRequirementTooltip
                      requiredLevel={categoryRequirement.level}
                      userLevel={userLevel}
                      userScore={userScore}
                      requiredScore={categoryRequirement.minScore}
                      categoryName={categoryInfo.name}
                      isBlocked={!hasAccessToCategory}
                    />
                  </div>
                )}
            </Card>

            {/* Selector de Clase de Axie */}
            <Card
              variant="glass"
              className="relative overflow-hidden rounded-none border-cyan-100/12 bg-black/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
            >
              <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-ethereal-cyan/55 to-transparent" />
              <h2 className="alchemy-heading mb-4 flex items-center gap-3 text-2xl leading-tight">
                <Flame className="h-5 w-5 text-magma-orange" />
                2. Clase de Axie
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {ALL_AXIE_CLASSES.map((axieClass) => (
                  <button
                    type="button"
                    key={axieClass.id}
                    onClick={() => setSelectedClass(axieClass.id)}
                    className={`border p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      selectedClass === axieClass.id
                        ? "border-magma-gold/75 bg-orange-500/14 text-magma-gold shadow-[0_0_22px_rgba(240,106,18,0.16)]"
                        : "border-cyan-100/12 bg-black/35 text-cyan-50/72 hover:border-ethereal-cyan/45 hover:text-cyan-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Image
                        src={axieClass.icon}
                        alt={axieClass.displayName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <span className="text-xs font-medium">
                        {axieClass.displayName}
                      </span>
                      <div className="flex items-center gap-1 text-xs">
                        <Gem className="h-3 w-3 text-ethereal-cyan" />
                        <span className="font-bold text-ethereal-cyan">
                          {mementoBalances?.[axieClass.id]?.formatted ?? "0"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Bonus de Axie Staking */}
            {stakedAxiesCount > 0 && (
              <AxieBonusIndicator
                stakedAxiesCount={stakedAxiesCount}
                bonusPerAxie={10}
                variant="detailed"
              />
            )}

            {/* Mementos Extra */}
            <Card
              variant="glass"
              className="relative overflow-hidden rounded-none border-cyan-100/12 bg-black/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md"
            >
              <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-magma-gold/70 to-transparent" />
              <h2 className="alchemy-heading mb-4 flex items-center gap-3 text-2xl leading-tight">
                <Coins className="h-5 w-5 text-ethereal-cyan" />
                3. Mementos Extra (Opcional)
              </h2>
              <p className="mb-2 text-sm leading-6 text-cyan-50/62">
                Cada 10 mementos reduce la probabilidad de fallo en 1%
              </p>
              <p className="mb-4 flex items-center gap-2 text-sm text-cyan-50/52">
                <Gem className="h-4 w-4 text-ethereal-cyan" />
                Disponibles:{" "}
                <span className="font-bold text-ethereal-cyan">
                  {selectedClass
                    ? (mementoBalances?.[selectedClass]?.formatted ?? "0")
                    : "0"}
                </span>{" "}
                {classInfo.displayName} Mementos
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setMementosToUse(Math.max(0, mementosToUse - 10))
                  }
                  className="inline-flex min-h-11 items-center gap-2 border border-cyan-100/12 bg-black/42 px-4 py-2 text-xs font-semibold uppercase text-cyan-50/66 transition-all hover:border-magma-gold/55 hover:text-magma-gold disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={mementosToUse === 0}
                >
                  <Minus className="h-4 w-4" />
                  -10
                </button>
                <div className="flex-1 text-center">
                  <div className="alchemy-heading-strong text-3xl leading-none">
                    {mementosToUse}
                  </div>
                  <div className="mt-1 text-xs text-cyan-50/52">
                    mementos extra
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMementosToUse(mementosToUse + 10)}
                  className="inline-flex min-h-11 items-center gap-2 border border-cyan-100/12 bg-black/42 px-4 py-2 text-xs font-semibold uppercase text-cyan-50/66 transition-all hover:border-magma-gold/55 hover:text-magma-gold"
                >
                  <Plus className="h-4 w-4" />
                  +10
                </button>
              </div>

              {mementosToUse > 0 && (
                <div className="mt-4 border border-ethereal-cyan/35 bg-cyan-300/10 p-3">
                  <div className="text-sm text-ethereal-cyan">
                    Reducción de fallo: -{reduction}%
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Panel Derecho: Animación de Forja */}
          <div className="space-y-6">
            {/* Panel de Animación de Forja */}
            <Card
              variant="gradient"
              className="relative overflow-hidden rounded-none border-magma-gold/28 bg-black/42 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-md md:p-6"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/14 via-transparent to-cyan-300/8" />
              <div className="relative">
                <h2 className="alchemy-heading mb-4 flex items-center gap-3 text-2xl leading-tight">
                  <Hammer className="h-5 w-5 text-magma-orange" />
                  Forja en Progreso
                </h2>

                <ForgeAnimationPanel
                  stage={forgeStage.currentStage}
                  selectedCategory={selectedCategory}
                  selectedClass={selectedClass}
                  forgedGeodeId={forgedGeodeId}
                  onSuccessModalClose={() => {
                    setForgeStep("select");
                    setForgedGeodeId(null);
                    setMementosToUse(0);
                    setForgeFailed(false);
                    forgeStage.resetToStage1();
                  }}
                  onFailModalClose={() => {
                    setForgeStep("select");
                    setForgeFailed(false);
                    forgeStage.resetToStage1();
                  }}
                  className="mb-6 aspect-video"
                />

                {/* Información de la Geoda Seleccionada */}
                <div className="mb-6 text-center">
                  <h3 className="alchemy-heading-strong mb-3 text-2xl leading-tight">
                    {geodeName}
                  </h3>
                  <div className="mb-3 flex justify-center gap-2">
                    <Badge
                      variant="info"
                      className="rounded-none border-cyan-100/12 bg-black/42 text-cyan-50/72"
                      style={{
                        backgroundColor: `${categoryInfo.color}40`,
                        borderColor: categoryInfo.color,
                      }}
                    >
                      {categoryInfo.name}
                    </Badge>
                    <Badge
                      variant="default"
                      className="rounded-none border-cyan-100/12 bg-black/42 text-cyan-50/72"
                      style={{
                        backgroundColor: `${classInfo.color}40`,
                        borderColor: classInfo.color,
                      }}
                    >
                      {classInfo.displayName}
                    </Badge>
                  </div>
                </div>

                {/* Costos */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between border border-cyan-100/10 bg-black/42 p-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/axies/axs-icon.webp"
                        alt="AXS"
                        width={24}
                        height={24}
                      />
                      <span>AXS</span>
                    </div>
                    <span className="font-bold text-magma-gold">{axsCost}</span>
                  </div>

                  <div className="flex items-center justify-between border border-cyan-100/10 bg-black/42 p-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/axies/slp-icon.webp"
                        alt="SLP"
                        width={24}
                        height={24}
                      />
                      <span>SLP</span>
                    </div>
                    <span className="font-bold text-magma-gold">{slpCost}</span>
                  </div>

                  <div className="flex items-center justify-between border border-cyan-100/10 bg-black/42 p-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          selectedClass
                            ? getMementoIcon(selectedClass)
                            : getMementoIcon(AxieClass.BEAST)
                        }
                        alt="Memento"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>Memento {classInfo.displayName}</span>
                    </div>
                    <span className="font-bold text-magma-gold">
                      {totalMementoCost}
                    </span>
                  </div>
                </div>

                {/* Probabilidad de Fallo */}
                <div className="mb-6 border border-magma-gold/35 bg-orange-500/10 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-semibold uppercase text-magma-gold">
                      <ShieldAlert className="h-4 w-4 text-magma-orange" />
                      Probabilidad de Fallo
                    </span>
                    <span className="alchemy-heading-strong text-2xl leading-none">
                      {currentFailureChance}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/55">
                    <div
                      className="h-2 bg-gradient-to-r from-magma-gold to-magma-orange transition-all"
                      style={{ width: `${currentFailureChance}%` }}
                    />
                  </div>
                </div>

                {/* Botones de Acción */}
                {forgeStep === "select" && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full rounded-none border border-ethereal-cyan/55 bg-none from-transparent to-transparent bg-cyan-300/14 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:from-transparent hover:to-transparent hover:text-white focus:ring-cyan-300/75"
                    onClick={handleApprove}
                    disabled={
                      selectedCategory === undefined ||
                      selectedClass === undefined ||
                      !hasAccessToCategory ||
                      isApproving
                    }
                  >
                    {isApproving
                      ? "Aprobando..."
                      : !hasAccessToCategory
                        ? "Requiere Mayor Trust Score"
                        : selectedCategory === undefined
                          ? "Selecciona una categoría"
                          : selectedClass === undefined
                            ? "Selecciona una clase de Axie"
                            : "Continuar"}
                  </Button>
                )}

                {forgeStep === "approve" && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="rounded-none border border-ethereal-cyan/55 bg-none from-transparent to-transparent bg-cyan-300/14 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:from-transparent hover:to-transparent hover:text-white focus:ring-cyan-300/75"
                    onClick={handleApprove}
                    disabled={isApproving}
                  >
                    {isApproving ? "Aprobando..." : "Aprobar Tokens"}
                  </Button>
                )}

                {forgeStep === "forge" && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleForge}
                    disabled={isForging}
                    className="rounded-none border border-ethereal-cyan/55 bg-none from-transparent to-transparent bg-cyan-300/14 text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:from-transparent hover:to-transparent hover:text-white focus:ring-cyan-300/75"
                  >
                    {isForging ? "Forjando..." : "Forjar Geoda"}
                  </Button>
                )}
              </div>
            </Card>

            {/* Info Compacta de la Categoría */}
            <Card
              variant="glass"
              className="rounded-none border-cyan-100/12 bg-black/42 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-md"
            >
              <h4 className="alchemy-heading mb-3 flex items-center gap-2 text-lg leading-tight">
                <BarChart3 className="h-4 w-4 text-ethereal-cyan" />
                Estadísticas
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-cyan-50/52">Rareza:</span>
                  <span
                    className="font-medium"
                    style={{ color: categoryInfo.color }}
                  >
                    {categoryInfo.rarity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-50/52">Poder:</span>
                  <span className="font-bold text-ethereal-cyan">
                    {categoryInfo.miningPower}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-50/52">Supply:</span>
                  <span className="font-medium">
                    {categoryInfo.maxSupply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-50/52">Bonus:</span>
                  <span className="font-medium text-magma-gold">
                    {categoryInfo.collectionBonus}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </main>
  );
}
