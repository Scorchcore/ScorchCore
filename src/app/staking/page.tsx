"use client";



import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, Modal, Toast, useToast } from "@/components/ui";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useNFTs } from "@/lib/hooks/nfts/useNFTs";
import { useMining } from "@/lib/hooks/mining/useMining";
import { useContracts } from "@/lib/hooks/contracts/useContracts";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import { useMetadataService } from "@/lib/hooks/services/useMetadataService";
import {
  useCycleManager,
  useGeodeStaking,
  useInventoryFacade,
} from "@/lib/hooks";
import {
  CycleDurationSelector,
  MinerLockedIndicator,
  ActiveCycleCard,
} from "@/components/cycle";
import { MinerStatsHistoryCardCompact } from "@/components/minerstats";
import { useMinerStatsHistory } from "@/lib/hooks/mining/useMinerStatsHistory";
import { CycleDuration } from "@/lib/contracts/interfaces/ICycleContract";
import { getMinerVideoUrl } from "@/lib/utils/data/minerNames";
import { GeodeVideo } from "@/components/GeodeVideo";
import {
  CATEGORY_INFO,
  AXIE_CLASS_INFO,
  GeodeCategory,
  AxieClass,
} from "@/lib/constants/geodes";
import type { GeodeInventoryInfo } from "@/lib/facades/InventoryFacade";
import { ethers } from "ethers";
import Link from "next/link";
import { createServiceLogger } from "@/lib/utils/logging/logger";
import type { CoreMinerNFT } from "@/lib/facades/NFTFacade";

const logger = createServiceLogger("StakingPage");

interface MiningSession {
  owner: string;
  startTime: bigint;
  lastClaim: bigint;
  power: bigint;
  efficiency: bigint;
  isActive: boolean;
  pendingRewards: bigint;
}

export default function StakingPage() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const contracts = useContracts();
  const { contractManager } = useContractManager();
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();
  const {
    miners,
    isLoadingMiners,
    reload: reloadMiners,
  } = useNFTs({
    autoLoad: true,
    minersOnly: true,
  });

  const [selectedMiner, setSelectedMiner] = useState<any>(null);
  const [showMiningModal, setShowMiningModal] = useState(false);
  const [activeMinerSessions, setActiveMinerSessions] = useState<
    Map<string, MiningSession>
  >(new Map());
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Cycle Management
  const {
    activeCycles,
    bonusInfo,
    endCycle,
    isLoading: isCycleLoading,
  } = useCycleManager();

  // Geode Staking
  const inventoryFacade = useInventoryFacade();
  const {
    stake: stakeGeode,
    unstake: unstakeGeode,
    getStakedGeodes,
    isLoading: isGeodeStakingLoading,
  } = useGeodeStaking();
  const [geodes, setGeodes] = useState<GeodeInventoryInfo[]>([]);
  const [stakedGeodeIds, setStakedGeodeIds] = useState<bigint[]>([]);
  const [isLoadingGeodes, setIsLoadingGeodes] = useState(false);

  // Redirect si no está conectado
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const loadMiningSessions = async () => {
    if (!miners.length || !contracts?.miningScheduler) return;

    logger.info("Cargando sesiones de mining", { minerCount: miners.length });
    setIsLoadingSessions(true);

    try {
      const { ContractManager } = await import(
        "@/lib/contracts/ContractManager"
      );
      const contractManager = ContractManager.getInstance();
      const miningPool = contractManager.getMiningPool();

      const sessionsMap = new Map<string, MiningSession>();

      for (const miner of miners) {
        try {
          const isMining = await miningPool.isMining(miner.tokenId);

          if (isMining) {
            const [minerInfo, pendingRewards, minerStats] = await Promise.all([
              miningPool.getMinerInfo(miner.tokenId),
              miningPool.getPendingRewards(miner.tokenId),
              miningPool.getMinerStats(miner.tokenId),
            ]);

            sessionsMap.set(miner.tokenId.toString(), {
              owner: minerInfo.owner,
              startTime: minerStats.lastClaimTime,
              lastClaim: minerStats.lastClaimTime,
              power: minerInfo.power,
              efficiency: minerInfo.efficiency,
              isActive: true,
              pendingRewards: pendingRewards.totalAmount,
            });
          }
        } catch (error) {
          logger.warn(`Error cargando sesión para miner ${miner.tokenId}`, {
            error,
          });
        }
      }

      logger.info("Sesiones cargadas exitosamente", {
        activeCount: sessionsMap.size,
      });
      setActiveMinerSessions(sessionsMap);
    } catch (error) {
      logger.error("Error cargando sesiones de mining", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Cargar sesiones cuando cambien los miners
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (miners.length > 0 && contracts?.miningScheduler) {
      loadMiningSessions();
    }
  }, [miners.length, contracts?.miningScheduler]);

  // Auto-refresh cada 10 segundos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!miners.length || !contracts?.miningScheduler) return;

    const interval = setInterval(() => {
      loadMiningSessions();
    }, 10000);

    return () => clearInterval(interval);
  }, [miners.length, contracts?.miningScheduler]);

  // Cargar geodas del usuario (disponibles + stakeadas)
  const loadGeodes = async () => {
    if (!address) return;

    logger.info("Cargando geodas del usuario", { address });
    setIsLoadingGeodes(true);

    try {
      // 1. Cargar geodas disponibles (que aún son propiedad del usuario)
      const availableGeodes = await inventoryFacade.getUserGeodes(address);

      // 2. Obtener IDs de geodas stakeadas
      const stakedIds = await getStakedGeodes(address);

      // 3. Si hay geodas stakeadas, cargarlas también
      let stakedGeodes: GeodeInventoryInfo[] = [];
      if (stakedIds.length > 0) {
        // Cargar info de cada geoda stakeada individualmente
        const geodeContract = await contractManager?.getGeodeNFT();
        const forgeContract = await contractManager?.getForgeFactory();

        if (geodeContract && forgeContract) {
          for (const geodeId of stakedIds) {
            try {
              const info = await geodeContract.getGeodeInfo(geodeId);
              const categoryInfo =
                CATEGORY_INFO[Number(info.category) as GeodeCategory];
              const classInfo =
                AXIE_CLASS_INFO[Number(info.axieClass) as AxieClass];

              stakedGeodes.push({
                id: geodeId,
                category: Number(info.category),
                axieClass: Number(info.axieClass),
                categoryName: categoryInfo.name,
                className: classInfo.displayName,
                fullName: `${categoryInfo.displayName} ${classInfo.displayName}`,
                owner: address, // Owner original
                createdAt: 0, // No necesitamos timestamp exacto para stakeadas
                hatchTime: 0,
                isHatched: false,
                canHatch: false,
                miningPower: categoryInfo.miningPower,
                efficiency: 80,
                isStaked: true, // ✅ Marcar como stakeada
              });
            } catch (err) {
              logger.warn(`Error cargando geoda stakeada ${geodeId}`, {
                error: err,
              });
            }
          }
        }
      }

      // 4. Combinar ambas listas
      const allGeodes = [
        ...availableGeodes.map((g) => ({ ...g, isStaked: false })),
        ...stakedGeodes,
      ];

      setGeodes(allGeodes);
      setStakedGeodeIds(stakedIds);
      logger.info("Geodas cargadas exitosamente", {
        available: availableGeodes.length,
        staked: stakedGeodes.length,
        total: allGeodes.length,
      });
    } catch (error) {
      logger.error("Error cargando geodas", error);
      showError("Error al cargar geodas");
    } finally {
      setIsLoadingGeodes(false);
    }
  };

  // Ya no es necesario - loadGeodes carga todo junto

  // Stakear una geoda
  const handleStakeGeode = async (geodeId: bigint) => {
    try {
      showInfo("Aprobando y stakeando geoda...");
      await stakeGeode(geodeId);
      showSuccess("¡Geoda stakeada exitosamente!");
      await loadGeodes(); // Recarga todo (disponibles + stakeadas)
    } catch (error) {
      logger.error("Error stakeando geoda", error);
      const errorMsg =
        error instanceof Error ? error.message : "Error al stakear geoda";
      showError(errorMsg);
    }
  };

  // Unstakear una geoda
  const handleUnstakeGeode = async (geodeId: bigint) => {
    try {
      showInfo("Unstakeando geoda...");
      await unstakeGeode(geodeId);
      showSuccess("¡Geoda unstakeada exitosamente!");
      await loadGeodes(); // Recarga todo (disponibles + stakeadas)
    } catch (error) {
      logger.error("Error unstakeando geoda", error);
      showError("Error al unstakear geoda");
    }
  };

  // Cargar geodas al montar (incluye stakeadas)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (address) {
      loadGeodes();
    }
  }, [address]);

  // Formatear valores
  const formatFCore = (amount: bigint) => {
    return parseFloat(ethers.formatEther(amount)).toFixed(2);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const calculateTimeElapsed = (startTime: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - Number(startTime);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header con botón de volver */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mb-4">
              ← Volver al Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            ⛏️ Mining Dashboard
          </h1>
          <p className="text-gray-400">
            Gestiona tus CoreMiners y obtén recompensas en fCORE
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💎</div>
              <Badge variant="success">Activo</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {
                miners.filter((m) =>
                  activeMinerSessions.has(m.tokenId.toString()),
                ).length
              }
            </div>
            <div className="text-sm text-gray-400">CoreMiners Minando</div>
          </Card>

          <Card variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">⚡</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {miners.length}
            </div>
            <div className="text-sm text-gray-400">Total CoreMiners</div>
          </Card>

          <Card variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">💰</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {Array.from(activeMinerSessions.values())
                .reduce(
                  (sum, session) =>
                    sum + Number(formatFCore(session.pendingRewards)),
                  0,
                )
                .toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">fCORE Pendiente</div>
          </Card>

          <Card variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📊</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {miners.reduce((sum, m) => sum + Number(m.miningPower), 0)}
            </div>
            <div className="text-sm text-gray-400">Poder Total</div>
          </Card>
        </div>

        {/* Active Cycles Section */}
        {activeCycles.length > 0 && (
          <Card variant="glass" className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Ciclos Activos
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeCycles.map((cycle) => (
                <ActiveCycleCard
                  key={cycle.cycleId.toString()}
                  cycle={cycle}
                  onEndCycle={async (cycleId) => {
                    await endCycle(cycleId);
                    await reloadMiners();
                  }}
                />
              ))}
            </div>
          </Card>
        )}

        {/* CoreMiners List */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mis CoreMiners</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await reloadMiners();
                await loadMiningSessions();
              }}
              disabled={isLoadingMiners || isLoadingSessions}
            >
              {isLoadingMiners || isLoadingSessions
                ? "Cargando..."
                : "🔄 Actualizar"}
            </Button>
          </div>

          {isLoadingMiners ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-400">Cargando CoreMiners...</p>
            </div>
          ) : miners.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-white mb-2">
                No tienes CoreMiners
              </h3>
              <p className="text-gray-400 mb-6">
                Eclosiona geodas para obtener CoreMiners y comenzar a minar
                fCORE
              </p>
              <Link href="/inventory">
                <Button variant="primary">Ir al Inventario</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {miners.map((miner) => (
                <MinerCard
                  key={miner.tokenId.toString()}
                  miner={miner}
                  session={activeMinerSessions.get(miner.tokenId.toString())}
                  onManage={() => {
                    setSelectedMiner(miner);
                    setShowMiningModal(true);
                  }}
                  formatFCore={formatFCore}
                  calculateTimeElapsed={calculateTimeElapsed}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Geode Staking Section */}
        <Card variant="glass" className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">💎 Mis Geodas</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={loadGeodes}
              disabled={isLoadingGeodes}
            >
              {isLoadingGeodes ? "Cargando..." : "🔄 Actualizar"}
            </Button>
          </div>

          {isLoadingGeodes ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-400">Cargando geodas...</p>
            </div>
          ) : geodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💎</div>
              <p className="text-gray-400 mb-2">No tienes geodas aún</p>
              <Link href="/forge">
                <Button variant="primary" size="sm">
                  Ir a Forjar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {geodes.map((geode) => {
                const isStaked = stakedGeodeIds.some((id) => id === geode.id);
                const categoryInfo = CATEGORY_INFO[geode.category];
                const classInfo = AXIE_CLASS_INFO[geode.axieClass];

                return (
                  <Card
                    key={geode.id.toString()}
                    variant="gradient"
                    className="overflow-hidden"
                  >
                    {/* Video de la Geoda */}
                    <div className="h-48 bg-slate-900">
                      <GeodeVideo
                        category={geode.category}
                        axieClass={geode.axieClass}
                        autoPlay={true}
                        className="h-full w-full"
                      />
                    </div>

                    {/* Información */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">
                          {geode.fullName}
                        </h3>
                        {isStaked && <Badge variant="success">Staked</Badge>}
                      </div>

                      {/* Stats */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Poder:</span>
                          <span className="text-white font-semibold">
                            {geode.miningPower}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Categoría:</span>
                          <span className="text-white">
                            {categoryInfo.displayName}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Clase:</span>
                          <span className="text-white">
                            {classInfo.displayName}
                          </span>
                        </div>
                      </div>

                      {/* Botón de acción */}
                      {!isStaked ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => handleStakeGeode(geode.id)}
                          disabled={isGeodeStakingLoading}
                        >
                          🔒 Stakear
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleUnstakeGeode(geode.id)}
                          disabled={isGeodeStakingLoading}
                        >
                          🔓 Unstakear
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* Mining Modal */}
        {showMiningModal && selectedMiner && (
          <MiningModal
            miner={selectedMiner}
            isOpen={showMiningModal}
            onClose={() => {
              setShowMiningModal(false);
              setSelectedMiner(null);
            }}
            onSuccess={async () => {
              await reloadMiners();
              await loadMiningSessions();
              setShowMiningModal(false);
              setSelectedMiner(null);
            }}
          />
        )}
      </div>

      {/* Toast para notificaciones */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

interface MinerCardProps {
  miner: CoreMinerNFT;
  session?: MiningSession;
  onManage: () => void;
  formatFCore: (amount: bigint) => string;
  calculateTimeElapsed: (startTime: bigint) => string;
}

function MinerCard({
  miner,
  session,
  onManage,
  formatFCore,
  calculateTimeElapsed,
}: MinerCardProps) {
  const isActive = session?.isActive || false;
  const [showStats, setShowStats] = useState(false);

  // Hook para stats del miner
  const {
    stats,
    health,
    isLoading: isLoadingStats,
  } = useMinerStatsHistory(miner.tokenId, true, 30000);

  // Construir ruta del video
  const classNames = {
    0: "BESTIA",
    1: "AQUA",
    2: "AVE",
    3: "REPTIL",
    4: "BICHO",
    5: "PLANTA",
    6: "MECH",
    7: "DUSK",
    8: "DAWN",
  } as const;

  // Obtener video URL desde Piñata metadata con servicio compartido
  const metadataService = useMetadataService();
  const [videoUrl, setVideoUrl] = useState<string>(
    "/assets/miners/fallback.mp4",
  );

  useEffect(() => {
    getMinerVideoUrl(miner.tokenId, metadataService).then(setVideoUrl);
  }, [miner.tokenId, metadataService]);

  return (
    <Card variant="gradient" className="p-4">
      {/* Video del CoreMiner */}
      <div className="aspect-square rounded-lg overflow-hidden bg-black/20 mb-4 relative">
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
        {/* Badge de Estado sobre el video */}
        <div className="absolute top-2 right-2">
          <Badge variant={isActive ? "success" : "default"} className="text-xs">
            {isActive ? "⛏️ Minando" : "💤 Inactivo"}
          </Badge>
        </div>
        {/* Overlay de miner bloqueado */}
        <MinerLockedIndicator minerId={miner.tokenId} variant="overlay" />
      </div>

      {/* Info del Miner */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white mb-0.5">{miner.name}</h3>
        <p className="text-xs text-gray-400">
          CoreMiner #{miner.tokenId.toString()}
        </p>
      </div>

      {/* Stats compactos */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-black/40 rounded p-2 border border-gray-700">
          <div className="text-xs text-gray-400 mb-0.5">Poder</div>
          <div className="text-sm font-bold text-orange-500">
            {miner.miningPower}
          </div>
        </div>
        <div className="bg-black/40 rounded p-2 border border-gray-700">
          <div className="text-xs text-gray-400 mb-0.5">Eficiencia</div>
          <div className="text-sm font-bold text-green-500">
            {miner.efficiency}%
          </div>
        </div>
        {isActive && session && (
          <>
            <div className="bg-black/40 rounded p-2 border border-gray-700">
              <div className="text-xs text-gray-400 mb-0.5">Tiempo</div>
              <div className="text-sm font-bold text-white">
                {calculateTimeElapsed(session.startTime)}
              </div>
            </div>
            <div className="bg-black/40 rounded p-2 border border-gray-700">
              <div className="text-xs text-gray-400 mb-0.5">Pendiente</div>
              <div className="text-sm font-bold text-green-400">
                {formatFCore(session.pendingRewards)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botón de Acción */}
      <Button
        variant={isActive ? "secondary" : "primary"}
        size="sm"
        className="w-full text-xs mb-2"
        onClick={onManage}
      >
        {isActive ? "Gestionar" : "Iniciar Mining"}
      </Button>

      {/* Botón para expandir stats */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs"
        onClick={() => setShowStats(!showStats)}
      >
        {showStats ? "▲ Ocultar Estadísticas" : "▼ Ver Estadísticas"}
      </Button>

      {/* Stats expandibles */}
      {showStats && stats && health && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <MinerStatsHistoryCardCompact stats={stats} health={health} />
        </div>
      )}
    </Card>
  );
}

interface MiningModalProps {
  miner: CoreMinerNFT;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

function MiningModal({ miner, isOpen, onClose, onSuccess }: MiningModalProps) {
  const { address, isConnected } = useWallet();
  const contracts = useContracts();
  const { startMining, claimRewards, stopMining, isLoading } = useMining();
  const { startCycle, bonusInfo } = useCycleManager();
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<CycleDuration>(
    CycleDuration.SHORT,
  );
  const [showCycleSelector, setShowCycleSelector] = useState(false);

  const handleStartMining = async () => {
    if (!isConnected || !address) {
      showWarning("Por favor conecta tu wallet primero", "⚠️ Wallet Requerido");
      return;
    }

    if (!contracts?.miningScheduler) {
      showWarning(
        "Contratos no disponibles. Intenta reconectar tu wallet.",
        "⚠️ Error de Conexión",
      );
      return;
    }

    try {
      setActionLoading(true);
      logger.info("Iniciando mining con ciclo", {
        minerId: miner.tokenId.toString(),
        power: miner.miningPower,
        efficiency: miner.efficiency,
        cycleDuration: selectedDuration,
      });

      // Iniciar ciclo si se seleccionó una duración
      if (showCycleSelector && selectedDuration !== CycleDuration.SHORT) {
        await startCycle({
          minerIds: [miner.tokenId],
          duration: selectedDuration,
        });
        logger.info("Ciclo iniciado", { duration: selectedDuration });
      }

      await startMining(miner.tokenId);

      logger.info("Mining iniciado exitosamente", {
        minerId: miner.tokenId.toString(),
      });
      showSuccess("Mining iniciado exitosamente", "✅ Éxito");
      onSuccess();
    } catch (error) {
      logger.error("Error al iniciar mining", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      showError(`Error al iniciar mining: ${errorMessage}`, "❌ Error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setActionLoading(true);
      logger.info("Reclamando recompensas", {
        minerId: miner.tokenId.toString(),
      });
      await claimRewards(miner.tokenId);
      logger.info("Recompensas reclamadas exitosamente");
      showSuccess("Recompensas reclamadas exitosamente", "✅ Éxito");
      onSuccess();
    } catch (error) {
      logger.error("Error al reclamar recompensas", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      showError(`Error al reclamar recompensas: ${errorMessage}`, "❌ Error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopMining = async () => {
    try {
      setActionLoading(true);
      logger.info("Deteniendo mining", { minerId: miner.tokenId.toString() });
      await stopMining(miner.tokenId);
      logger.info("Mining detenido exitosamente");
      showSuccess("Mining detenido exitosamente", "✅ Éxito");
      onSuccess();
    } catch (error) {
      logger.error("Error al detener mining", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      showError(`Error al detener mining: ${errorMessage}`, "❌ Error");
    } finally {
      setActionLoading(false);
    }
  };

  // TODO: Usar useMiningStats para obtener session info
  const isActive = false; // Placeholder - requiere refactor a facades
  const hasPending = false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={miner.name}>
      <div className="space-y-6">
        {/* Estado Actual */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">
            CoreMiner #{miner.tokenId.toString()}
          </p>
          <div className="text-6xl mb-4">💎</div>
          <Badge variant={isActive ? "success" : "default"} className="mb-4">
            {isActive ? "⛏️ Minando Activo" : "💤 Inactivo"}
          </Badge>
        </div>

        {/* Toggle para mostrar selector de ciclo */}
        {!isActive && (
          <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                Usar Ciclo con Bonus
              </span>
              <span className="text-xs text-purple-400">(Recomendado)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCycleSelector(!showCycleSelector)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showCycleSelector ? "bg-purple-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showCycleSelector ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}

        {/* Selector de duración del ciclo */}
        {!isActive && showCycleSelector && (
          <CycleDurationSelector
            selectedDuration={selectedDuration}
            onSelectDuration={setSelectedDuration}
            bonusInfo={bonusInfo}
          />
        )}

        {/* Botones de Acción */}
        <div className="space-y-3">
          {!isActive && (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleStartMining}
              disabled={actionLoading || isLoading || !isConnected}
            >
              {actionLoading
                ? "Iniciando..."
                : !isConnected
                  ? "⚠️ Conecta tu Wallet"
                  : "⛏️ Iniciar Mining"}
            </Button>
          )}

          {isActive && hasPending && (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleClaimRewards}
              disabled={actionLoading || isLoading}
            >
              {actionLoading ? "Reclamando..." : `💰 Reclamar Recompensas`}
            </Button>
          )}

          {isActive && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleStopMining}
              disabled={actionLoading || isLoading}
            >
              {actionLoading ? "Deteniendo..." : "🛑 Detener Mining"}
            </Button>
          )}
        </div>

        {/* Info Adicional */}
        {/* TODO: Implementar con useMiningStats para mostrar session info */}
      </div>

      {/* Toast para notificaciones del modal */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={hideToast}
        />
      )}
    </Modal>
  );
}
