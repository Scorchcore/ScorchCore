"use client";

import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CoreMinerVideo } from "@/components/CoreMinerVideo";
import {
  ActiveCycleCard,
  CycleDurationSelector,
  MinerLockedIndicator,
} from "@/components/cycle";
import { GeodeVideo } from "@/components/GeodeVideo";
import { MinerStatsHistoryCardCompact } from "@/components/minerstats";
import { Badge, Modal, Toast, useToast } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AXIE_CLASS_INFO,
  type AxieClass,
  CATEGORY_INFO,
  type GeodeCategory,
} from "@/lib/constants/geodes";
import { CycleDuration } from "@/lib/contracts/interfaces/ICycleContract";
import type { GeodeInventoryInfo } from "@/lib/facades/InventoryFacade";
import type { CoreMinerNFT } from "@/lib/facades/NFTFacade";
import {
  useCycleManager,
  useGeodeStaking,
  useInventoryFacade,
} from "@/lib/hooks";
import { useContractManager } from "@/lib/hooks/contracts/useContractManager";
import { useMinerStatsHistory } from "@/lib/hooks/mining/useMinerStatsHistory";
import { useNFTs } from "@/lib/hooks/nfts/useNFTs";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { createServiceLogger } from "@/lib/utils/logging/logger";

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

  const [selectedMiner, setSelectedMiner] = useState<CoreMinerNFT | null>(null);
  const [showMiningModal, setShowMiningModal] = useState(false);
  const [activeMinerSessions, setActiveMinerSessions] = useState<
    Map<string, MiningSession>
  >(new Map());
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Cycle Management
  const { activeCycles, endCycle } = useCycleManager();

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
    if (!miners.length || !activeCycles.length || !contractManager) {
      setActiveMinerSessions(new Map());
      return;
    }

    logger.info("Loading Phase 6 mining cycles", {
      minerCount: miners.length,
      cycleCount: activeCycles.length,
    });
    setIsLoadingSessions(true);

    try {
      const miningPool = contractManager.getMiningPool();
      const sessionsMap = new Map<string, MiningSession>();

      for (const cycle of activeCycles) {
        const pendingRewards = await miningPool.getPendingRewards(
          cycle.cycleId,
        );
        const rewardPerMiner =
          cycle.minerIds.length > 0
            ? pendingRewards.totalAmount / BigInt(cycle.minerIds.length)
            : 0n;

        for (const minerId of cycle.minerIds) {
          const miner = miners.find((entry) => entry.tokenId === minerId);
          if (!miner) continue;
          sessionsMap.set(minerId.toString(), {
            owner: address ?? miner.owner,
            startTime: BigInt(cycle.startTime),
            lastClaim: BigInt(cycle.startTime),
            power: BigInt(miner.miningPower),
            efficiency: BigInt(miner.efficiency),
            isActive: cycle.isActive,
            pendingRewards: rewardPerMiner,
          });
        }
      }

      setActiveMinerSessions(sessionsMap);
    } catch (error) {
      logger.error("Error loading Phase 6 mining cycles", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Cargar sesiones cuando cambien los miners
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void loadMiningSessions();
  }, [miners.length, activeCycles.length, address]);

  // Auto-refresh cada 10 segundos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!miners.length || !activeCycles.length) return;

    const interval = setInterval(() => {
      void loadMiningSessions();
    }, 10000);

    return () => clearInterval(interval);
  }, [miners.length, activeCycles.length, address]);

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
      const stakedGeodes: GeodeInventoryInfo[] = [];
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
            session={activeMinerSessions.get(selectedMiner.tokenId.toString())}
            cycle={activeCycles.find((entry) =>
              entry.minerIds.some((id) => id === selectedMiner.tokenId),
            )}
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

  return (
    <Card variant="gradient" className="p-4">
      {/* Video del CoreMiner */}
      <div className="aspect-square rounded-lg overflow-hidden bg-black/20 mb-4 relative">
        <CoreMinerVideo
          category={miner.category as GeodeCategory}
          axieClass={miner.minerType as AxieClass}
          minerIndex={miner.minerIndex}
          autoPlay
          loop
          muted
          className="w-full h-full"
          showFallback
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
  session?: MiningSession;
  cycle?: import("@/lib/services/cycle").ActiveCycle;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

function MiningModal({
  miner,
  session,
  cycle,
  isOpen,
  onClose,
  onSuccess,
}: MiningModalProps) {
  const { address, isConnected } = useWallet();
  const { contractManager } = useContractManager();
  const { startCycle, endCycle, bonusInfo } = useCycleManager();
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

    try {
      setActionLoading(true);
      logger.info("Iniciando mining con ciclo", {
        minerId: miner.tokenId.toString(),
        power: miner.miningPower,
        efficiency: miner.efficiency,
        cycleDuration: selectedDuration,
      });

      const duration = showCycleSelector
        ? selectedDuration
        : CycleDuration.SHORT;
      await startCycle({
        minerIds: [miner.tokenId],
        duration,
      });
      logger.info("Cycle started", { duration });

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
      if (!cycle) throw new Error("No active cycle found");
      await contractManager.getMiningPool().claimRewards(cycle.cycleId);
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
      if (!cycle) throw new Error("No active cycle found");
      await endCycle(cycle.cycleId);
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

  const isActive = Boolean(session && cycle?.isActive);
  const hasPending = (session?.pendingRewards ?? 0n) > 0n;
  const canClaim = Boolean(cycle?.isFinished && hasPending);

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
              disabled={actionLoading || !isConnected}
            >
              {actionLoading
                ? "Iniciando..."
                : !isConnected
                  ? "⚠️ Conecta tu Wallet"
                  : "⛏️ Iniciar Mining"}
            </Button>
          )}

          {isActive && canClaim && (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleClaimRewards}
              disabled={actionLoading}
            >
              {actionLoading ? "Reclamando..." : `💰 Reclamar Recompensas`}
            </Button>
          )}

          {isActive && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleStopMining}
              disabled={actionLoading || !cycle?.isFinished}
            >
              {actionLoading
                ? "Ending..."
                : cycle?.isFinished
                  ? "End cycle"
                  : "Cycle locked"}
            </Button>
          )}
        </div>

        {cycle && session && (
          <div className="grid grid-cols-2 gap-3 border border-cyan-100/10 bg-black/30 p-4 text-sm">
            <div>
              <p className="text-xs text-cyan-50/45">Cycle</p>
              <p className="mt-1 font-semibold text-white">
                #{cycle.cycleId.toString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-cyan-50/45">Pending</p>
              <p className="mt-1 font-semibold text-emerald-300">
                {Number(ethers.formatEther(session.pendingRewards)).toFixed(2)}{" "}
                fCORE
              </p>
            </div>
            <div>
              <p className="text-xs text-cyan-50/45">Ends</p>
              <p className="mt-1 font-semibold text-white">
                {new Date(cycle.endTime * 1000).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-cyan-50/45">Bonus</p>
              <p className="mt-1 font-semibold text-magma-gold">
                +{cycle.bonusPercentage / 100}%
              </p>
            </div>
          </div>
        )}
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
