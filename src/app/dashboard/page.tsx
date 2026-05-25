"use client";


import React from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useUserData } from "@/lib/hooks/user/useUserData";
import { useMetadataService } from "@/lib/hooks/services/useMetadataService";
import { useCycleManager, usefCoreBalance } from "@/lib/hooks";
import { Card, Button, Badge, Loading } from "@/components/ui";
import { getMinerVideoUrl } from "@/lib/utils/data/minerNames";
import { MinerLockedIndicator } from "@/components/cycle";
import {
  fCoreBalanceCard as FCoreBalanceCard,
  PohVerificationBanner,
  fCoreExplanationModal as FCoreExplanationModal,
} from "@/components/fcore";
import { AxieCard } from "@/components/axie/AxieCard";
import {
  MinerStatsHistoryCard,
  MinerPerformanceChart,
  MinerComparisonTable,
} from "@/components/minerstats";
import {
  useMinerStatsHistory,
  useMinerComparison,
} from "@/lib/hooks/mining/useMinerStatsHistory";
import { useMinerActions } from "@/lib/hooks/mining/useMinerActions";
import { MinerConfigModal } from "@/components/miner/MinerConfigModal";
import { CycleDuration } from "@/lib/contracts/interfaces/ICycleContract";
import { TokenPriceCard } from "@/components/price";
import { CollectionProgressCard } from "@/components/collection";
import Link from "next/link";
import { useAxies } from "@/lib/hooks/nfts/useAxies";
import { Toast, useToast } from "@/components/ui";

// Componente separado para Stats Tab (evita hooks condicionales)
function StatsTab({
  displayMiners,
  selectedMinerForStats,
  setSelectedMinerForStats,
}: {
  displayMiners: any[];
  selectedMinerForStats: bigint | null;
  setSelectedMinerForStats: (id: bigint | null) => void;
}) {
  // Hooks SIEMPRE se llaman (no condicionales)
  const minerIds = displayMiners.map((m) => BigInt(m.id));
  const {
    stats: selectedStats,
    health,
    isLoading: isLoadingStats,
  } = useMinerStatsHistory(selectedMinerForStats || BigInt(0));
  const {
    comparisons,
    averages,
    isLoading: isLoadingComparison,
  } = useMinerComparison(minerIds.length > 0 ? minerIds : [BigInt(0)]);

  if (displayMiners.length === 0) {
    return (
      <Card variant="glass" className="p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-white mb-2">
          No hay estadísticas disponibles
        </h3>
        <p className="text-gray-400 mb-6">
          Necesitas tener CoreMiners para ver sus estadísticas
        </p>
        <Link href="/forge">
          <Button variant="primary">Ir a la Forja</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Miner */}
      <Card variant="gradient" className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Selecciona un Miner
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayMiners.map((miner) => (
            <button
              key={miner.id}
              onClick={() => setSelectedMinerForStats(BigInt(miner.id))}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedMinerForStats?.toString() === miner.id.toString()
                  ? "border-orange-500 bg-orange-500/20"
                  : "border-gray-700 bg-slate-800 hover:border-gray-600"
              }`}
            >
              <div className="text-sm font-medium text-white">#{miner.id}</div>
              <div className="text-xs text-gray-400">{miner.type}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Stats del Miner Seleccionado */}
      {selectedMinerForStats && (
        <>
          {isLoadingStats ? (
            <div className="flex items-center justify-center p-12">
              <Loading size="lg" text="Cargando estadísticas..." />
            </div>
          ) : !selectedStats || !health ? (
            <Card variant="glass" className="p-8 text-center">
              <p className="text-gray-400">
                No se pudieron cargar las estadísticas
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MinerStatsHistoryCard stats={selectedStats} health={health} />
              <MinerPerformanceChart stats={selectedStats} />
            </div>
          )}
        </>
      )}

      {/* Comparación de Miners */}
      {displayMiners.length > 1 && (
        <>
          {isLoadingComparison ? (
            <div className="flex items-center justify-center p-12">
              <Loading size="lg" text="Comparando miners..." />
            </div>
          ) : (
            <MinerComparisonTable
              comparisons={comparisons}
              averages={averages}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected, balance, balanceSymbol, disconnect } =
    useWallet();
  const { axies, miners, stats, isLoading: isLoadingData } = useUserData();
  const metadataService = useMetadataService();
  const { activeCycles, totalMinersLocked, averageBonus, refreshCycles } =
    useCycleManager();
  const {
    axies: axiesHook,
    isLoading: isAxiesLoading,
    stakeAxie,
    unstakeAxie,
  } = useAxies();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const {
    systemInfo,
    isLoading: isLoadingfCore,
    convertAll,
    hasfCoreBalance,
    needsPohVerification,
  } = usefCoreBalance();
  const {
    activateMiner,
    deactivateMiner,
    claimRewards,
    isProcessing: isMinerActionProcessing,
  } = useMinerActions();
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "axies" | "coreminers" | "stats"
  >("overview");
  const [showfCoreModal, setShowfCoreModal] = React.useState(false);
  const [selectedMinerForStats, setSelectedMinerForStats] = React.useState<
    bigint | null
  >(null);
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const [selectedMinerForConfig, setSelectedMinerForConfig] = React.useState<{
    id: bigint;
    name: string;
  } | null>(null);

  // Handler para conversión de fCORE
  const handleConvertfCore = async () => {
    await convertAll();
  };

  // Redirect si no está conectado
  React.useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const handleLogout = () => {
    disconnect();
    router.push("/");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loading size="lg" text="Verificando conexión..." />
      </div>
    );
  }

  // Funciones auxiliares para convertir datos
  function getAxieEmoji(axieClass: string): string {
    const emojis: Record<string, string> = {
      Beast: "🐉",
      Plant: "🌿",
      Aquatic: "🐟",
      Bird: "🦅",
      Bug: "🦋",
      Reptile: "🦎",
      Mech: "🤖",
      Dawn: "🌅",
      Dusk: "🌆",
    };
    return emojis[axieClass] || "🎮";
  }

  function getMinerTypeName(type: number): string {
    // minerType del contrato (0-8) representa las clases de Axie
    const types: Record<number, string> = {
      0: "Bestia", // Beast
      1: "Aqua", // Aqua
      2: "Ave", // Bird
      3: "Reptil", // Reptile
      4: "Bicho", // Bug
      5: "Planta", // Plant
      6: "Mech", // Mech
      7: "Dusk", // Dusk
      8: "Dawn", // Dawn
    };
    return types[type] || "Unknown";
  }

  // Convertir datos reales de la wallet
  // Si no hay axies en la wallet, mostrar array vacío
  const displayAxies = axies.map((axie) => ({
    id: axie.tokenId,
    name: axie.metadata.name,
    class: axie.metadata.class,
    level: axie.metadata.stats.hp > 50 ? 30 : 20, // Nivel basado en stats
    rarity:
      axie.metadata.stats.hp > 60
        ? "Epic"
        : axie.metadata.stats.hp > 50
          ? "Rare"
          : "Common",
    image: getAxieEmoji(axie.metadata.class),
    isStaked: axie.isStaked,
  }));

  // Convertir datos de mineros - USA DATOS LOCALES directamente
  const displayMiners = React.useMemo(() => {
    return miners.map((miner) => {
      const basePower = miner.miningPower || 100;
      const efficiency = miner.efficiency || 100;
      const dailyOutput = ((basePower * efficiency) / 100).toFixed(2);

      // Verificar si el miner está bloqueado en un ciclo
      const isInCycle = activeCycles.some((cycle) =>
        cycle.minerIds.some((id) => id === miner.tokenId),
      );

      return {
        id: miner.tokenId.toString(),
        name: miner.name,
        type:
          miner.metadata?.attributes?.find((a) => a.trait_type === "Type")
            ?.value || "Unknown",
        category:
          miner.metadata?.attributes?.find((a) => a.trait_type === "Category")
            ?.value || 0,
        power: basePower,
        status: isInCycle ? "Mining" : "Idle",
        efficiency,
        dailyOutput,
        videoUrl: miner.videoUrl || "", // Video local desde NFTFacade
      };
    });
  }, [miners, activeCycles]);

  // Handlers para acciones de miners
  const handleConfigureMiner = React.useCallback(
    (minerId: string, minerName: string) => {
      setSelectedMinerForConfig({ id: BigInt(minerId), name: minerName });
      setConfigModalOpen(true);
    },
    [],
  );

  const handleActivateMiner = React.useCallback(
    async (duration: CycleDuration) => {
      if (!selectedMinerForConfig) return;

      const result = await activateMiner(selectedMinerForConfig.id, duration);

      if (result.success) {
        showSuccess(
          `¡${selectedMinerForConfig.name} activado! Tx: ${result.transactionHash?.slice(0, 10)}...`,
        );
        setConfigModalOpen(false);
        setSelectedMinerForConfig(null);
        // Recargar ciclos para actualizar UI
        await refreshCycles();
      } else {
        showError(result.error || "Error al activar miner");
      }
    },
    [
      selectedMinerForConfig,
      activateMiner,
      showSuccess,
      showError,
      refreshCycles,
    ],
  );

  const handleDeactivateMiner = React.useCallback(
    async (minerId: string) => {
      const result = await deactivateMiner(BigInt(minerId));

      if (result.success) {
        showSuccess(
          `Miner desactivado! Tx: ${result.transactionHash?.slice(0, 10)}...`,
        );
        await refreshCycles();
      } else {
        showError(result.error || "Error al desactivar miner");
      }
    },
    [deactivateMiner, showSuccess, showError, refreshCycles],
  );

  const handleClaimRewards = React.useCallback(
    async (minerId: string) => {
      const result = await claimRewards(BigInt(minerId));

      if (result.success) {
        showSuccess(
          `¡Recompensas reclamadas! Tx: ${result.transactionHash?.slice(0, 10)}...`,
        );
      } else {
        showError(result.error || "Error al reclamar recompensas");
      }
    },
    [claimRewards, showSuccess, showError],
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Profile Hero Section */}
      <section className="relative py-12 border-b border-gray-800">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Avatar & Info */}
            <Card variant="glass" className="flex-1 p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-4xl">
                    🔥
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    Prospector #{address?.slice(-4)}
                  </h1>
                  <div className="flex items-center gap-3 mb-3">
                    <code className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </code>
                    <Badge variant="success">Conectado</Badge>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Miembro desde:</span>
                      <span className="text-white ml-2 font-medium">
                        Oct 2024
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    🚪 Cerrar Sesión
                  </Button>
                </div>
              </div>
            </Card>

            {/* Balance Card */}
            <Card variant="gradient" className="lg:w-80 p-8">
              <div className="text-sm text-gray-300 mb-2">
                Balance de Wallet
              </div>
              <div className="text-4xl font-bold text-white mb-4">
                {balance || "0.00"}
              </div>
              <div className="text-lg text-gray-300 mb-6">
                {balanceSymbol || "RON"}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">$CORE Minado:</span>
                  <span className="text-orange-500 font-bold">
                    {stats.totalCOREMined}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tasa Diaria:</span>
                  <span className="text-green-500 font-bold">
                    +{stats.dailyRate}/día
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-4 border-b border-gray-800 mb-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📊 Vista General
            </button>
            <button
              onClick={() => setActiveTab("axies")}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === "axies"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🎮 Mis Axies ({displayAxies.length})
            </button>
            <button
              onClick={() => setActiveTab("coreminers")}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === "coreminers"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              💎 Mis CoreMiners ({displayMiners.length})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === "stats"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📊 Estadísticas Miners
            </button>
          </div>
        </div>
      </section>

      {/* Cycles Summary Card */}
      {activeCycles.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <Card variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  🕒 Ciclos Activos
                </h2>
                <p className="text-sm text-gray-400">
                  {activeCycles.length} ciclo
                  {activeCycles.length !== 1 ? "s" : ""} en progreso
                </p>
              </div>
              <Link href="/staking">
                <Button variant="outline" size="sm">
                  Ver Detalles →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔒</span>
                  <span className="text-sm text-gray-400">
                    Miners Bloqueados
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {totalMinersLocked}
                </p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📈</span>
                  <span className="text-sm text-gray-400">Bonus Promedio</span>
                </div>
                <p className="text-3xl font-bold text-purple-400">
                  +{averageBonus.toFixed(1)}%
                </p>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⏰</span>
                  <span className="text-sm text-gray-400">
                    Próximo a Terminar
                  </span>
                </div>
                <p className="text-lg font-bold text-amber-400">
                  {activeCycles[0] && activeCycles[0].timeRemaining > 0
                    ? `${Math.floor(activeCycles[0].timeRemaining / 86400)}d ${Math.floor((activeCycles[0].timeRemaining % 86400) / 3600)}h`
                    : "Terminado"}
                </p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* PoH Verification Banner */}
            {needsPohVerification && systemInfo && (
              <div className="mb-6">
                <PohVerificationBanner
                  isVerified={systemInfo.pohVerification.isVerified}
                  verificationLevel={systemInfo.pohVerification.level}
                  expiresAt={systemInfo.pohVerification.expiresAt}
                  onConvert={async () => {
                    try {
                      const result = await convertAll();
                      if (result.success) {
                        showSuccess(
                          "fCORE convertido exitosamente a CORE",
                          "✅ Conversión Exitosa",
                        );
                      } else {
                        showError(
                          result.error || "Error al convertir fCORE",
                          "❌ Error",
                        );
                      }
                    } catch (error) {
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : "Error desconocido";
                      showError(errorMessage, "❌ Error");
                    }
                  }}
                  isLoading={isLoadingfCore}
                />
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">🎮</div>
                  <Badge variant="info">Activo</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.axiesOwned}
                </div>
                <div className="text-sm text-gray-400">Axies en Wallet</div>
              </Card>

              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">💎</div>
                  <Badge variant="success">Minando</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.coreMinersActive}
                </div>
                <div className="text-sm text-gray-400">CoreMiners Activos</div>
              </Card>

              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">⛏️</div>
                  <Badge variant="warning">Total</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.totalCOREMined}
                </div>
                <div className="text-sm text-gray-400">$CORE Minado</div>
              </Card>

              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">📈</div>
                  <Badge variant="success">24h</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.dailyRate}
                </div>
                <div className="text-sm text-gray-400">$CORE / Día</div>
              </Card>
            </div>

            {/* Main Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Forge Card */}
              <Card variant="gradient" hover className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-5xl mb-4">🔨</div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      La Forja
                    </h2>
                    <p className="text-gray-300">
                      Transmuta tus Axies dormidos en poderosos CoreMiners para
                      comenzar a minar $CORE
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-sm text-gray-300">
                      Fase 1: Crear Geoda Cristalina
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-300">
                      Fase 2: Eclosión del CoreMiner
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-300">
                      Fase 3: Activar Minería
                    </span>
                  </div>
                </div>
                <Link href="/forge">
                  <Button variant="primary" className="w-full">
                    Ir a la Forja →
                  </Button>
                </Link>
              </Card>

              {/* Mining Card */}
              <Card variant="gradient" hover className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-5xl mb-4">⛏️</div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Minería
                    </h2>
                    <p className="text-gray-300">
                      Activa tus CoreMiners y configura ciclos de minería para
                      generar $CORE pasivamente
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-300">
                      Ciclos: 1 semana a 3 meses
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-300">
                      Mayor duración = Mayor bonus
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-300">
                      Rewards automáticos
                    </span>
                  </div>
                </div>
                <Link href="/mining">
                  <Button variant="primary" className="w-full">
                    Ver Minería →
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card variant="bordered" hover className="p-6">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-white mb-2">Staking</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Stakea tus Axies para generar Poder de Resonancia sin
                  quemarlos
                </p>
                <Link href="/staking">
                  <Button variant="outline" className="w-full" size="sm">
                    Ver Staking
                  </Button>
                </Link>
              </Card>

              <Card variant="bordered" hover className="p-6">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Marketplace
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Compra y vende CoreMiners, Geodas y recursos en el mercado
                </p>
                <Link href="/marketplace">
                  <Button variant="outline" className="w-full" size="sm">
                    Explorar
                  </Button>
                </Link>
              </Card>

              <Card variant="bordered" hover className="p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Inventario
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Gestiona tus Axies, CoreMiners, Geodas y otros activos
                </p>
                <Link href="/inventory">
                  <Button variant="outline" className="w-full" size="sm">
                    Ver Inventario
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card variant="glass" className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Actividad Reciente
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <span className="text-2xl">🔨</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        Forja Completada
                      </div>
                      <div className="text-sm text-gray-400">
                        CoreMiner Bestia creado exitosamente
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">Hace 2 horas</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <span className="text-2xl">⛏️</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        Recompensa de Minería
                      </div>
                      <div className="text-sm text-gray-400">
                        +42.5 $CORE reclamados
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">Hace 5 horas</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <span className="text-2xl">🎮</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        Axie Stakeado
                      </div>
                      <div className="text-sm text-gray-400">
                        3 Axies bloqueados por 30 días
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">Hace 1 día</div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Axies Tab */}
        {activeTab === "axies" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Mis Axies</h2>
              <p className="text-gray-400">
                Gestiona tus Axies y prepáralos para la forja
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayAxies.map((axie) => (
                <Card key={axie.id} variant="glass" hover className="p-6">
                  <div className="flex flex-col">
                    <div className="text-7xl text-center mb-4">
                      {axie.image}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {axie.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="info">{axie.class}</Badge>
                      <Badge
                        variant={
                          axie.rarity === "Legendary"
                            ? "warning"
                            : axie.rarity === "Epic"
                              ? "success"
                              : "default"
                        }
                      >
                        {axie.rarity}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Nivel:</span>
                        <span className="text-white font-medium">
                          {axie.level}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Clase:</span>
                        <span className="text-white font-medium">
                          {axie.class}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Detalles
                      </Button>
                      <Button variant="primary" size="sm" className="flex-1">
                        Forjar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CoreMiners Tab */}
        {activeTab === "coreminers" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Mis CoreMiners
              </h2>
              <p className="text-gray-400">
                Gestiona tus CoreMiners y optimiza la minería
              </p>
            </div>

            {/* Loading State */}
            {isLoadingData && (
              <Card variant="glass" className="p-12 text-center">
                <Loading size="lg" text="Cargando CoreMiners..." />
              </Card>
            )}

            {/* Miners Grid */}
            {!isLoadingData && displayMiners.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayMiners.map((miner) => (
                  <Card key={miner.id} variant="gradient" className="p-4">
                    {/* Video del CoreMiner - Tamaño completo */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-black/20 mb-4 relative">
                      {miner.videoUrl ? (
                        <video
                          src={miner.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-6xl">
                          💎
                        </div>
                      )}
                      {/* Overlay de miner bloqueado */}
                      <MinerLockedIndicator
                        minerId={BigInt(miner.id)}
                        variant="overlay"
                      />
                    </div>

                    {/* Header compacto */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-white mb-0.5">
                        {miner.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          CoreMiner {miner.type}
                        </p>
                        <Badge
                          variant={
                            miner.status === "Mining" ? "success" : "default"
                          }
                          className="text-xs"
                        >
                          {miner.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats compactos */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/40 rounded p-2 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-0.5">
                          Poder
                        </div>
                        <div className="text-sm font-bold text-orange-500">
                          {miner.power}
                        </div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-0.5">
                          Eficiencia
                        </div>
                        <div className="text-sm font-bold text-green-500">
                          {miner.efficiency}%
                        </div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-0.5">
                          Diaria
                        </div>
                        <div className="text-sm font-bold text-white">
                          {miner.dailyOutput}
                        </div>
                      </div>
                    </div>

                    {/* Botones compactos */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() =>
                          handleConfigureMiner(miner.id, miner.name)
                        }
                        disabled={
                          isMinerActionProcessing || miner.status === "Mining"
                        }
                      >
                        Configurar
                      </Button>
                      <Button
                        variant={
                          miner.status === "Mining" ? "secondary" : "primary"
                        }
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() =>
                          miner.status === "Mining"
                            ? handleDeactivateMiner(miner.id)
                            : handleConfigureMiner(miner.id, miner.name)
                        }
                        disabled={isMinerActionProcessing}
                      >
                        {isMinerActionProcessing
                          ? "Procesando..."
                          : miner.status === "Mining"
                            ? "Detener"
                            : "Activar"}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => handleClaimRewards(miner.id)}
                        disabled={
                          isMinerActionProcessing || miner.status !== "Mining"
                        }
                      >
                        Reclamar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State si no hay miners Y no está cargando */}
            {!isLoadingData && displayMiners.length === 0 && (
              <Card variant="glass" className="p-12 text-center">
                <div className="text-6xl mb-4">💎</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No tienes CoreMiners
                </h3>
                <p className="text-gray-400 mb-6">
                  Forja tus primeros Axies para crear CoreMiners y comenzar a
                  minar $CORE
                </p>
                <Link href="/forge">
                  <Button variant="primary">Ir a la Forja</Button>
                </Link>
              </Card>
            )}
          </div>
        )}

        {/* Modal de Configuración de Miner */}
        {selectedMinerForConfig && (
          <MinerConfigModal
            isOpen={configModalOpen}
            onClose={() => {
              setConfigModalOpen(false);
              setSelectedMinerForConfig(null);
            }}
            onConfirm={handleActivateMiner}
            minerName={selectedMinerForConfig.name}
            isProcessing={isMinerActionProcessing}
          />
        )}

        {/* Tab Stats */}
        {activeTab === "stats" && (
          <StatsTab
            displayMiners={displayMiners}
            selectedMinerForStats={selectedMinerForStats}
            setSelectedMinerForStats={setSelectedMinerForStats}
          />
        )}
      </div>

      {/* Sección de Axies NFT */}
      {axiesHook.length > 0 && (
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">🐉 Mis Axies</h2>
            <p className="text-gray-400">
              Stakea tus Axies para obtener bonos de minería
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {axiesHook.map((axie) => (
              <AxieCard
                key={axie.tokenId}
                axie={axie}
                onStake={async (axieId) => {
                  try {
                    await stakeAxie(axieId);
                    showSuccess("Axie stakeado exitosamente", "✅ Éxito");
                  } catch (error) {
                    const errorMessage =
                      error instanceof Error
                        ? error.message
                        : "Error desconocido";
                    showError(`Error al stakear: ${errorMessage}`, "❌ Error");
                  }
                }}
                onUnstake={async (axieId) => {
                  try {
                    await unstakeAxie(axieId);
                    showSuccess("Axie unstakeado exitosamente", "✅ Éxito");
                  } catch (error) {
                    const errorMessage =
                      error instanceof Error
                        ? error.message
                        : "Error desconocido";
                    showError(
                      `Error al unstakear: ${errorMessage}`,
                      "❌ Error",
                    );
                  }
                }}
                isLoading={isAxiesLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* fCore Explanation Modal */}
      <FCoreExplanationModal
        isOpen={showfCoreModal}
        onClose={() => setShowfCoreModal(false)}
      />

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
