"use client";



import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { Card, Button, Badge, Loading, Toast, useToast } from "@/components/ui";
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

const logger = createServiceLogger("InventoryPage");

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
  const [activeTab, setActiveTab] = useState<"all" | "geodes" | "miners">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHatchAnimation, setShowHatchAnimation] = useState(false);
  const [hatchingGeodeId, setHatchingGeodeId] = useState<bigint | null>(null);
  const [hatchingGeode, setHatchingGeode] = useState<GeodeInventoryInfo | null>(
    null,
  );
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
  const [realHatchResult, setRealHatchResult] = useState<HatchResult | null>(
    null,
  );

  // Lightbox para geodas y miners fullscreen
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedGeode, setSelectedGeode] = useState<GeodeInventoryInfo | null>(
    null,
  );
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
      // Cargar geodas y miners en paralelo
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

  // Redirect automático si no hay conexión después de 3 segundos
  useEffect(() => {
    if (!isConnected) {
      const timeout = setTimeout(() => {
        logger.info("No hay conexión - redirigiendo a landing page");
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isConnected, router]);

  // Auto-refresh deshabilitado - ahora es manual con botón
  // useEffect(() => {
  //   if (!isConnected || !address) return;
  //   const interval = setInterval(() => {
  //     logger.debug('Auto-refresh de inventario');
  //     loadInventory();
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, [isConnected, address, loadInventory]);

  const getTimeRemaining = (hatchTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = hatchTime - now;

    if (remaining <= 0) return "Listo para eclosionar";

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h restantes`;
    }

    return `${hours}h ${minutes}m restantes`;
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
          // Usar GeodeHatcher en lugar de ForgeFacade
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

          // ✅ Convertir todos los BigInt a string para evitar error de serialización
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

          // ✅ Guardar resultado REAL del contrato
          setRealHatchResult(result);
          setIsTxConfirmed(true);

          // ⚠️ NO recargar inventario aquí - esperar a que termine la ruleta y modal
          logger.debug("Eclosión confirmada - esperando animación de ruleta");
        } catch (contractError) {
          // ⚠️ No pasar el error completo si contiene BigInt
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

    // ✅ USAR DATOS REALES DEL CONTRATO, NO DE LA RULETA
    const { category, minerType, minerIndex, minerId } = realHatchResult;

    logger.info("Usando datos REALES del contrato", {
      minerId: minerId.toString(),
      category,
      minerType,
      minerIndex,
    });

    // Cargar metadata real usando los índices del contrato
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

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loading size="lg" text="Verificando conexión..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative py-12 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-linear-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                🎒 Mi Inventario
              </h1>
              <p className="text-gray-400 text-lg">
                Geodas Cristalinas y CoreMiners
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  logger.info("Refresh manual del inventario solicitado");
                  loadInventory();
                }}
                disabled={isLoading}
              >
                🔄 Actualizar Inventario
              </Button>
              <Link href="/dashboard">
                <Button variant="secondary">← Volver al Dashboard</Button>
              </Link>
              <Link href="/forge">
                <Button variant="primary">🔨 Forjar Nueva Geoda</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loading size="lg" text="Cargando inventario..." />
          </div>
        )}

        {error && !isLoading && (
          <Card variant="glass" className="p-6 bg-red-900/20 border-red-500">
            <div className="flex items-center gap-3">
              <div className="text-2xl">❌</div>
              <div>
                <div className="font-bold text-red-500">Error</div>
                <div className="text-sm text-gray-300">{error}</div>
              </div>
            </div>
          </Card>
        )}

        {!isLoading && !error && geodes.length === 0 && miners.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <div className="text-6xl mb-6">🎒</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Inventario vacío
            </h2>
            <p className="text-gray-400 mb-6">
              Forja geodas o eclosiona miners para comenzar tu aventura en
              ScorchCore
            </p>
            <Link href="/forge">
              <Button variant="primary" size="lg">
                🔨 Ir a la Forja
              </Button>
            </Link>
          </Card>
        )}

        {!isLoading && !error && (geodes.length > 0 || miners.length > 0) && (
          <>
            {/* Tabs para filtrar */}
            <div className="flex gap-3 mb-6 border-b border-gray-700 pb-4">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                📦 Todos ({geodes.length + miners.length})
              </button>
              <button
                onClick={() => setActiveTab("geodes")}
                className={`px-6 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === "geodes"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                🥚 Geodas ({geodes.length})
              </button>
              <button
                onClick={() => setActiveTab("miners")}
                className={`px-6 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === "miners"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                ⛏️ CoreMiners ({miners.length})
              </button>
            </div>

            {/* Sección de Geodas */}
            {(activeTab === "all" || activeTab === "geodes") &&
              geodes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    🥚 Geodas Cristalinas ({geodes.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {geodes.map((geode) => (
                      <Card
                        key={geode.id.toString()}
                        variant={geode.canHatch ? "gradient" : "glass"}
                        hover
                        className="p-6"
                      >
                        <div
                          className="mb-4 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                          style={{ height: "240px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            logger.info("Abriendo lightbox para geoda", {
                              geodeId: geode.id.toString(),
                            });
                            // Construir ruta correcta para geoda
                            const categoryName =
                              CATEGORY_INFO[geode.category].name.toLowerCase();
                            const categoryUpper =
                              CATEGORY_INFO[geode.category].name.toUpperCase();
                            const classUpper =
                              AXIE_CLASS_INFO[
                                geode.axieClass
                              ].name.toUpperCase();
                            const videoUrl = `/assets/geodes/${categoryName}/GEODA_${categoryUpper}_${classUpper}.mp4`;
                            setLightboxVideoUrl(videoUrl);
                            setSelectedGeode(geode);
                            setLightboxOpen(true);
                          }}
                        >
                          <GeodeVideo
                            category={geode.category}
                            axieClass={geode.axieClass}
                            className="h-full w-auto max-w-full object-contain"
                            autoPlay={true}
                          />
                        </div>

                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-white mb-1">
                            Geoda {geode.fullName}
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <Badge
                              variant="info"
                              className="text-xs"
                              style={{
                                backgroundColor:
                                  CATEGORY_INFO[geode.category].color + "40",
                                borderColor:
                                  CATEGORY_INFO[geode.category].color,
                              }}
                            >
                              {geode.categoryName}
                            </Badge>
                            <Badge
                              variant="default"
                              className="text-xs"
                              style={{
                                backgroundColor:
                                  AXIE_CLASS_INFO[geode.axieClass].color + "40",
                                borderColor:
                                  AXIE_CLASS_INFO[geode.axieClass].color,
                              }}
                            >
                              {geode.className}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID #{geode.id.toString()}
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">
                              Estado:
                            </span>
                            {geode.isHatched ? (
                              <Badge variant="success">Eclosionada</Badge>
                            ) : geode.canHatch ? (
                              <Badge variant="warning">Lista</Badge>
                            ) : (
                              <Badge variant="info">Incubando</Badge>
                            )}
                          </div>

                          <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">
                              ⚡ Poder:
                            </span>
                            <span className="text-white text-sm font-bold">
                              {geode.miningPower}
                            </span>
                          </div>

                          {!geode.isHatched && (
                            <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-gray-700">
                              <span className="text-gray-400 text-sm">
                                Tiempo:
                              </span>
                              <span className="text-white text-sm font-medium">
                                {getTimeRemaining(geode.hatchTime)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">
                              Creada:
                            </span>
                            <span className="text-white text-sm">
                              {new Date(
                                geode.createdAt * 1000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {geode.canHatch && !geode.isHatched && (
                          <Button
                            variant="primary"
                            className="w-full bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHatchGeode(geode.id);
                            }}
                            disabled={hatchingGeodeId === geode.id}
                          >
                            {hatchingGeodeId === geode.id ? (
                              <>🎲 Eclosionando...</>
                            ) : (
                              <>🐣 Eclosionar Ahora</>
                            )}
                          </Button>
                        )}

                        {geode.isHatched && (
                          <Button variant="outline" className="w-full" disabled>
                            Ya Eclosionada
                          </Button>
                        )}

                        {!geode.isHatched && !geode.canHatch && (
                          <Button variant="outline" className="w-full" disabled>
                            ⏳ Incubando...
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            {/* Sección de CoreMiners */}
            {(activeTab === "all" || activeTab === "miners") &&
              miners.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    ⛏️ CoreMiners ({miners.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {miners.map((miner) => (
                      <Card
                        key={miner.tokenId.toString()}
                        variant="glass"
                        hover
                        className="p-6 cursor-pointer"
                        onClick={() => {
                          logger.info("Navegando a detalles de CoreMiner", {
                            tokenId: miner.tokenId.toString(),
                          });
                          router.push(`/coreminer/${miner.tokenId.toString()}`);
                        }}
                      >
                        <div
                          className="mb-4 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                          style={{ height: "240px" }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            logger.info("Abriendo lightbox para miner", {
                              tokenId: miner.tokenId.toString(),
                            });
                            // Cargar URL correcta desde metadata
                            try {
                              const { getLocalMinerVideo } = await import(
                                "@/lib/utils/data/localMinerData"
                              );
                              const videoUrl = await getLocalMinerVideo(
                                miner.category,
                                miner.minerType,
                                miner.minerIndex,
                              );
                              setLightboxVideoUrl(videoUrl);
                              setSelectedMiner(miner);
                              setLightboxOpen(true);
                            } catch (error) {
                              logger.error(
                                "Error cargando video de miner",
                                error,
                              );
                            }
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
                        </div>

                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {miner.name}
                          </h3>
                          <div className="text-xs text-gray-500 mt-1">
                            ID #{miner.tokenId.toString()}
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">
                              ⚡ Poder:
                            </span>
                            <span className="text-white text-sm font-bold">
                              {miner.miningPower}
                            </span>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">
                              📊 Eficiencia:
                            </span>
                            <span className="text-white text-sm font-bold">
                              {miner.efficiency}%
                            </span>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">
                              Estado:
                            </span>
                            {miner.isMining ? (
                              <Badge variant="success">Minando</Badge>
                            ) : (
                              <Badge variant="default">Idle</Badge>
                            )}
                          </div>
                        </div>

                        {!miner.isMining && (
                          <Button
                            variant="primary"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              showInfo("Función de staking en desarrollo");
                            }}
                          >
                            💼 Enviar a Staking
                          </Button>
                        )}

                        {miner.isMining && (
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              showInfo("Función de unstaking en desarrollo");
                            }}
                          >
                            ⏸️ Detener Minería
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}
      </div>

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

            // ✅ Recargar inventario DESPUÉS de cerrar modal
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

      {/* Lightbox para ver geodas y miners en fullscreen */}
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
              sources: [
                {
                  src: lightboxVideoUrl,
                  type: "video/mp4",
                },
              ],
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
                  <div className="flex items-center justify-center w-full h-full bg-black">
                    <video
                      autoPlay
                      loop
                      muted
                      controls
                      className="max-w-full max-h-full"
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
    </div>
  );
}
