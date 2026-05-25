"use client";



import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useMementoBalances } from "@/lib/hooks/economy/useMementoBalances";
import { useContracts } from "@/lib/hooks/contracts/useContracts";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import {
  useTrustScore,
  useCanAccessCategory,
} from "@/lib/hooks/user/useTrustScore";
import { useAxies } from "@/lib/hooks/nfts/useAxies";
// import { useCategorySupply } from '@/hooks/useForgeSupply'; // Deshabilitado temporalmente
import { Card, Button, Badge, Loading, Toast, useToast } from "@/components/ui";
import { GeodeVideo } from "@/components/GeodeVideo";
import {
  TrustScoreBadge,
  TrustScoreRequirementTooltip,
} from "@/components/trustscore";
import { AxieBonusIndicator } from "@/components/axie";
import Link from "next/link";
import Image from "next/image";
import { useAccount, useWalletClient } from "wagmi";
import { ForgeFacade } from "@/lib/services/forge/ForgeFacade";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import type { MaterialInput } from "@/lib/contracts/interfaces/IForgeContract";
import {
  GeodeCategory,
  AxieClass,
  CATEGORY_INFO,
  AXIE_CLASS_INFO,
  AVAILABLE_CATEGORIES,
  ALL_AXIE_CLASSES,
  getGeodeName,
  getMementoIcon,
} from "@/lib/constants/geodes";
import { ForgeAnimationPanel } from "@/components/features/forge/ForgeAnimationPanel";
// TODO: Crear hook useForgeStage
// import { useForgeStage } from '@/lib/hooks/useForgeStage';

const logger = createServiceLogger("ForgePage");

export default function ForgePage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { address, chain } = useAccount();
  const contracts = useContracts();
  const { contractManager, signer } = useContractManager();
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();
  const {
    balances: mementoBalances,
    isLoading: loadingBalances,
    reload: reloadMementoBalances,
  } = useMementoBalances();
  const { trustScoreInfo, isLoading: isLoadingTrustScore } = useTrustScore();
  const { axies } = useAxies();
  const { data: walletClient } = useWalletClient();

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
  const [forgeFailed, setForgeFailed] = useState(false);
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
  }, [selectedCategory]);

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
      address,
      isConnected,
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
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
          >
            ← Volver
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🔨 Forja de Geodas</h1>
              <p className="text-gray-400">
                Combina recursos para crear geodas cristalinas únicas
              </p>
            </div>
            {trustScoreInfo && (
              <TrustScoreBadge
                score={trustScoreInfo.score}
                level={trustScoreInfo.level}
                levelName={trustScoreInfo.levelName}
                isFlagged={trustScoreInfo.flagged}
                isStale={trustScoreInfo.isStale}
                size="md"
                showLabel={true}
              />
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Panel Izquierdo: Selectores */}
          <div className="space-y-6">
            {/* Selector de Categoría */}
            <Card variant="glass" className="p-6">
              <h2 className="text-2xl font-bold mb-4">1. Categoría de Geoda</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_CATEGORIES.map((cat) => {
                  const requirement = CATEGORY_TRUST_REQUIREMENTS[cat.id];
                  const hasAccess =
                    !trustScoreInfo ||
                    trustScoreInfo.level >= requirement.level;
                  const isLocked = !hasAccess;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => !isLocked && setSelectedCategory(cat.id)}
                      disabled={isLocked}
                      className={`aspect-square p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center relative ${
                        isLocked
                          ? "border-red-500/50 bg-red-500/10 opacity-50 cursor-not-allowed"
                          : selectedCategory === cat.id
                            ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25"
                            : "border-gray-700 bg-black/20 hover:border-gray-600 hover:bg-black/30"
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
                      <div className="font-bold text-lg mb-1">{cat.name}</div>
                      <div className="text-xs text-gray-400 mb-2">
                        {cat.rarity}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Max: {cat.maxSupply.toLocaleString()}</div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-red-400">⚠️</span>
                          <span>{cat.failureRate}%</span>
                        </div>
                      </div>
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                          <div className="text-3xl">🔒</div>
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
            <Card variant="glass" className="p-6">
              <h2 className="text-2xl font-bold mb-4">2. Clase de Axie</h2>
              <div className="grid grid-cols-3 gap-3">
                {ALL_AXIE_CLASSES.map((axieClass) => (
                  <button
                    key={axieClass.id}
                    onClick={() => setSelectedClass(axieClass.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedClass === axieClass.id
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-gray-700 bg-black/20 hover:border-gray-600"
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
                        <span className="text-gray-400">💎</span>
                        <span className="font-bold text-green-400">
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
            <Card variant="glass" className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                3. Mementos Extra (Opcional)
              </h2>
              <p className="text-sm text-gray-400 mb-2">
                Cada 10 mementos reduce la probabilidad de fallo en 1%
              </p>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                💎 Disponibles:{" "}
                <span className="font-bold text-green-400">
                  {selectedClass
                    ? (mementoBalances?.[selectedClass]?.formatted ?? "0")
                    : "0"}
                </span>{" "}
                {classInfo.displayName} Mementos
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setMementosToUse(Math.max(0, mementosToUse - 10))
                  }
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  disabled={mementosToUse === 0}
                >
                  -10
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold">{mementosToUse}</div>
                  <div className="text-xs text-gray-400">mementos extra</div>
                </div>
                <button
                  onClick={() => setMementosToUse(mementosToUse + 10)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  +10
                </button>
              </div>

              {mementosToUse > 0 && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <div className="text-sm text-green-400">
                    ✓ Reducción de fallo: -{reduction}%
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Panel Derecho: Animación de Forja */}
          <div className="space-y-6">
            {/* Panel de Animación de Forja */}
            <Card variant="gradient" className="p-6">
              <h2 className="text-2xl font-bold mb-4">🔥 Forja en Progreso</h2>

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
                className="aspect-video mb-6"
              />

              {/* Información de la Geoda Seleccionada */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{geodeName}</h3>
                <div className="flex justify-center gap-2 mb-3">
                  <Badge
                    variant="info"
                    style={{
                      backgroundColor: categoryInfo.color + "40",
                      borderColor: categoryInfo.color,
                    }}
                  >
                    {categoryInfo.name}
                  </Badge>
                  <Badge
                    variant="default"
                    style={{
                      backgroundColor: classInfo.color + "40",
                      borderColor: classInfo.color,
                    }}
                  >
                    {classInfo.displayName}
                  </Badge>
                </div>
              </div>

              {/* Costos */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/axies/axs-icon.webp"
                      alt="AXS"
                      width={24}
                      height={24}
                    />
                    <span>AXS</span>
                  </div>
                  <span className="font-bold">{axsCost}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/axies/slp-icon.webp"
                      alt="SLP"
                      width={24}
                      height={24}
                    />
                    <span>SLP</span>
                  </div>
                  <span className="font-bold">{slpCost}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
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
                  <span className="font-bold">{totalMementoCost}</span>
                </div>
              </div>

              {/* Probabilidad de Fallo */}
              <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400">
                    ⚠️ Probabilidad de Fallo
                  </span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {currentFailureChance}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${currentFailureChance}%` }}
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              {forgeStep === "select" && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
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
                      ? "🔒 Requiere Mayor Trust Score"
                      : selectedCategory === undefined
                        ? "Selecciona una categoría"
                        : selectedClass === undefined
                          ? "Selecciona una clase de Axie"
                          : "Continuar →"}
                </Button>
              )}

              {forgeStep === "approve" && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isForging ? "Forjando..." : "🔨 Forjar Geoda"}
                </Button>
              )}
            </Card>

            {/* Info Compacta de la Categoría */}
            <Card variant="glass" className="p-4">
              <h4 className="font-bold mb-3 text-lg">📊 Estadísticas</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rareza:</span>
                  <span
                    className="font-medium"
                    style={{ color: categoryInfo.color }}
                  >
                    {categoryInfo.rarity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Poder:</span>
                  <span className="font-bold text-green-400">
                    {categoryInfo.miningPower}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Supply:</span>
                  <span className="font-medium">
                    {categoryInfo.maxSupply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bonus:</span>
                  <span className="font-medium text-blue-400">
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
    </div>
  );
}
