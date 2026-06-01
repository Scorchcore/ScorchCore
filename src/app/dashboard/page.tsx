"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useUserData } from "@/lib/hooks/user/useUserData";
import { CoreMinerVideo } from "@/components/CoreMinerVideo";
import { GeodeCategory, AxieClass } from "@/lib/constants/geodes";
import { useCycleManager, usefCoreBalance } from "@/lib/hooks";
import { Loading, Toast, useToast } from "@/components/ui";
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
import { Footer } from "@/components/layout";
import {
  Activity,
  Backpack,
  BarChart2,
  Clock,
  Flame,
  Gem,
  Hammer,
  Lock,
  LogOut,
  Pickaxe,
  TrendingUp,
  Users,
  Zap,
  Loader2,
  ShoppingBag,
  Layers,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DisplayMiner {
  id: string;
  name: string;
  type: string;
  category: number;
  minerType: number;
  minerIndex: number;
  power: number;
  status: string;
  efficiency: number;
  dailyOutput: string;
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function DashTabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
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
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  valueColor = "text-white",
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  valueColor?: string;
}) {
  return (
    <article className="group relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md transition-all duration-200">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/6 via-transparent to-cyan-300/3 opacity-70 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/45 to-transparent" />
      <div className="relative mb-3">
        <Icon className="h-5 w-5 text-magma-gold/65" />
      </div>
      <p className={`relative text-3xl font-bold mb-1 ${valueColor}`}>{value}</p>
      <p className="relative text-xs text-cyan-50/45">{label}</p>
    </article>
  );
}

// ─── Miner Card (CoreMiners tab) ──────────────────────────────────────────────

function MinerCard({
  miner,
  onConfigure,
  onActivate,
  onDeactivate,
  onClaim,
  isProcessing,
}: {
  miner: DisplayMiner;
  onConfigure: (id: string, name: string) => void;
  onActivate: (id: string, name: string) => void;
  onDeactivate: (id: string) => void;
  onClaim: (id: string) => void;
  isProcessing: boolean;
}) {
  const isMining = miner.status === "Mining";
  const borderClass = isMining ? "border-ethereal-cyan/28" : "border-cyan-100/12";
  const glowClass = isMining ? "from-cyan-300/8 to-blue-500/4" : "from-cyan-300/3 to-transparent";

  return (
    <article
      className={`relative overflow-hidden border ${borderClass} bg-black/42 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${glowClass} opacity-70`} />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/45 to-transparent" />

      {/* Video */}
      <div className="relative aspect-square border-b border-cyan-100/8 bg-black/30">
        <CoreMinerVideo
          category={miner.category as GeodeCategory}
          axieClass={miner.minerType as AxieClass}
          minerIndex={miner.minerIndex}
          autoPlay
          loop
          muted
          className="h-full w-full"
          showFallback
        />
        <MinerLockedIndicator minerId={BigInt(miner.id)} variant="overlay" />
      </div>

      {/* Body */}
      <div className="relative p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="alchemy-heading truncate text-base leading-tight">{miner.name}</h3>
            <p className="mt-0.5 text-[0.65rem] text-cyan-50/38">CoreMiner {miner.type}</p>
          </div>
          <span
            className={`shrink-0 border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
              isMining
                ? "border-emerald-400/45 bg-emerald-500/8 text-emerald-300"
                : "border-cyan-100/12 bg-black/30 text-cyan-50/42"
            }`}
          >
            {miner.status}
          </span>
        </div>

        {/* Stats */}
        <div className="mb-4 divide-y divide-cyan-100/8 border border-cyan-100/8 bg-black/20">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <Zap className="h-3 w-3 text-magma-gold/65" />
              Power
            </span>
            <span className="text-xs font-semibold text-magma-gold">{miner.power}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <TrendingUp className="h-3 w-3 text-ethereal-cyan/55" />
              Efficiency
            </span>
            <span className="text-xs font-semibold text-white">{miner.efficiency}%</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <Pickaxe className="h-3 w-3 text-cyan-300/45" />
              Daily
            </span>
            <span className="text-xs font-semibold text-white">{miner.dailyOutput}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onConfigure(miner.id, miner.name)}
            disabled={isProcessing || isMining}
            className="flex-1 border border-cyan-100/12 bg-black/30 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-cyan-50/52 transition-all hover:border-ethereal-cyan/35 hover:text-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Configure
          </button>
          <button
            type="button"
            onClick={() =>
              isMining ? onDeactivate(miner.id) : onActivate(miner.id, miner.name)
            }
            disabled={isProcessing}
            className={`flex-1 py-2 text-[0.65rem] font-semibold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              isMining
                ? "border border-cyan-100/12 bg-black/30 text-cyan-50/52 hover:border-ethereal-cyan/35 hover:text-cyan-50"
                : "border border-ethereal-cyan/55 bg-cyan-300/14 text-cyan-50 shadow-[0_0_20px_rgba(125,249,255,0.12)] hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
            ) : isMining ? (
              "Stop"
            ) : (
              "Activate"
            )}
          </button>
          <button
            type="button"
            onClick={() => onClaim(miner.id)}
            disabled={isProcessing || !isMining}
            className="flex-1 border border-magma-gold/35 bg-orange-500/6 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-magma-gold/70 transition-all hover:border-magma-gold/60 hover:bg-orange-500/12 hover:text-magma-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Claim
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────

function StatsTab({
  displayMiners,
  selectedMinerForStats,
  setSelectedMinerForStats,
}: {
  displayMiners: DisplayMiner[];
  selectedMinerForStats: bigint | null;
  setSelectedMinerForStats: (id: bigint | null) => void;
}) {
  const minerIds = displayMiners.map((m) => BigInt(m.id));
  const { stats: selectedStats, health, isLoading: isLoadingStats } =
    useMinerStatsHistory(selectedMinerForStats || BigInt(0));
  const { comparisons, averages, isLoading: isLoadingComparison } =
    useMinerComparison(minerIds.length > 0 ? minerIds : [BigInt(0)]);

  if (displayMiners.length === 0) {
    return (
      <div className="border border-orange-300/18 bg-black/42 px-6 py-20 text-center backdrop-blur-md">
        <BarChart2 className="mx-auto mb-5 h-9 w-9 text-magma-gold/55" />
        <h3 className="alchemy-heading mb-3 text-2xl">No Statistics Available</h3>
        <p className="alchemy-copy mx-auto max-w-md text-sm leading-6 text-cyan-50/55">
          You need CoreMiners to view their statistics
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

  return (
    <div className="space-y-6">
      {/* Miner selector */}
      <div className="relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5 backdrop-blur-md">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/45 to-transparent" />
        <h3 className="alchemy-heading relative mb-4 text-xl">Select a Miner</h3>
        <div className="relative flex flex-wrap gap-2">
          {displayMiners.map((miner) => {
            const isSelected =
              selectedMinerForStats?.toString() === miner.id.toString();
            return (
              <button
                key={miner.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMinerForStats(BigInt(miner.id))}
                className={`inline-flex items-center gap-2 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/75 ${
                  isSelected
                    ? "border-magma-gold/70 bg-orange-500/14 text-magma-gold shadow-[0_0_26px_rgba(240,106,18,0.18)]"
                    : "border-cyan-100/12 bg-black/42 text-cyan-50/58 hover:border-ethereal-cyan/45 hover:text-cyan-50"
                }`}
              >
                <span className="text-cyan-50/35">#{miner.id}</span>
                <span>{miner.type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats for selected miner */}
      {selectedMinerForStats && (
        <>
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-16">
              <Loading size="lg" text="Loading statistics…" />
            </div>
          ) : !selectedStats || !health ? (
            <div className="border border-cyan-100/10 bg-black/42 p-8 text-center text-sm text-cyan-50/42 backdrop-blur-md">
              Statistics could not be loaded
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <MinerStatsHistoryCard stats={selectedStats} health={health} />
              <MinerPerformanceChart stats={selectedStats} />
            </div>
          )}
        </>
      )}

      {/* Comparison */}
      {displayMiners.length > 1 && (
        <>
          {isLoadingComparison ? (
            <div className="flex items-center justify-center py-16">
              <Loading size="lg" text="Comparing miners…" />
            </div>
          ) : (
            <MinerComparisonTable comparisons={comparisons} averages={averages} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected, balance, balanceSymbol, disconnect } = useWallet();
  const { axies, miners, stats, isLoading: isLoadingData } = useUserData();
  const { activeCycles, totalMinersLocked, averageBonus, refreshCycles } = useCycleManager();
  const { axies: axiesHook, isLoading: isAxiesLoading, stakeAxie, unstakeAxie } = useAxies();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { systemInfo, isLoading: isLoadingfCore, convertAll, hasfCoreBalance, needsPohVerification } =
    usefCoreBalance();
  const { activateMiner, deactivateMiner, claimRewards, isProcessing: isMinerActionProcessing } =
    useMinerActions();

  const [activeTab, setActiveTab] = React.useState<"overview" | "axies" | "coreminers" | "stats">("overview");
  const [showfCoreModal, setShowfCoreModal] = React.useState(false);
  const [selectedMinerForStats, setSelectedMinerForStats] = React.useState<bigint | null>(null);
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const [selectedMinerForConfig, setSelectedMinerForConfig] = React.useState<{ id: bigint; name: string } | null>(null);

  const handleConvertfCore = async () => { await convertAll(); };

  React.useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  const handleLogout = () => {
    disconnect();
    router.push("/");
  };

  // ── Data transformation ────────────────────────────────────────────────────

  function getAxieEmoji(axieClass: string): string {
    const emojis: Record<string, string> = {
      Beast: "🐉", Plant: "🌿", Aquatic: "🐟", Bird: "🦅",
      Bug: "🦋", Reptile: "🦎", Mech: "🤖", Dawn: "🌅", Dusk: "🌆",
    };
    return emojis[axieClass] || "🎮";
  }

  const displayAxies = axies.map((axie) => ({
    id: axie.tokenId,
    name: axie.metadata.name,
    class: axie.metadata.class,
    level: axie.metadata.stats.hp > 50 ? 30 : 20,
    rarity: axie.metadata.stats.hp > 60 ? "Epic" : axie.metadata.stats.hp > 50 ? "Rare" : "Common",
    image: getAxieEmoji(axie.metadata.class),
    isStaked: axie.isStaked,
  }));

  const displayMiners = React.useMemo<DisplayMiner[]>(() => {
    return miners.map((miner) => {
      const basePower = miner.miningPower || 100;
      const efficiency = miner.efficiency || 100;
      const dailyOutput = ((basePower * efficiency) / 100).toFixed(2);
      const isInCycle = activeCycles.some((cycle) =>
        cycle.minerIds.some((id) => id === miner.tokenId),
      );
      return {
        id: miner.tokenId.toString(),
        name: miner.name,
        type: String(miner.metadata?.attributes?.find((a) => a.trait_type === "Type")?.value ?? "Unknown"),
        category: Number(miner.metadata?.attributes?.find((a) => a.trait_type === "Category")?.value ?? 0),
        minerType: miner.minerType ?? 0,
        minerIndex: miner.minerIndex ?? 0,
        power: basePower,
        status: isInCycle ? "Mining" : "Idle",
        efficiency,
        dailyOutput,
      };
    });
  }, [miners, activeCycles]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleConfigureMiner = React.useCallback((minerId: string, minerName: string) => {
    setSelectedMinerForConfig({ id: BigInt(minerId), name: minerName });
    setConfigModalOpen(true);
  }, []);

  const handleActivateMiner = React.useCallback(
    async (duration: CycleDuration) => {
      if (!selectedMinerForConfig) return;
      const result = await activateMiner(selectedMinerForConfig.id, duration);
      if (result.success) {
        showSuccess(`${selectedMinerForConfig.name} activated! Tx: ${result.transactionHash?.slice(0, 10)}…`);
        setConfigModalOpen(false);
        setSelectedMinerForConfig(null);
        await refreshCycles();
      } else {
        showError(result.error || "Error activating miner");
      }
    },
    [selectedMinerForConfig, activateMiner, showSuccess, showError, refreshCycles],
  );

  const handleDeactivateMiner = React.useCallback(
    async (minerId: string) => {
      const result = await deactivateMiner(BigInt(minerId));
      if (result.success) {
        showSuccess(`Miner deactivated! Tx: ${result.transactionHash?.slice(0, 10)}…`);
        await refreshCycles();
      } else {
        showError(result.error || "Error deactivating miner");
      }
    },
    [deactivateMiner, showSuccess, showError, refreshCycles],
  );

  const handleClaimRewards = React.useCallback(
    async (minerId: string) => {
      const result = await claimRewards(BigInt(minerId));
      if (result.success) {
        showSuccess(`Rewards claimed! Tx: ${result.transactionHash?.slice(0, 10)}…`);
      } else {
        showError(result.error || "Error claiming rewards");
      }
    },
    [claimRewards, showSuccess, showError],
  );

  // ── Connection guard ───────────────────────────────────────────────────────
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

  const nextCycle = activeCycles[0];
  const nextCycleLabel =
    nextCycle && nextCycle.timeRemaining > 0
      ? `${Math.floor(nextCycle.timeRemaining / 86400)}d ${Math.floor((nextCycle.timeRemaining % 86400) / 3600)}h`
      : "Ended";

  return (
    <>
      <main className="alchemy-copy relative min-h-screen overflow-hidden bg-deep-abyss pt-28 text-white">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_8%,rgba(125,249,255,0.09),transparent_30%),radial-gradient(circle_at_16%_45%,rgba(240,106,18,0.09),transparent_28%),linear-gradient(180deg,#020607_0%,#030b0e_50%,#010203_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.68),transparent_16%,transparent_84%,rgba(0,0,0,0.68))]" />

        <div className="relative z-1 mx-auto w-full max-w-6xl px-4 pb-24 md:px-8">

          {/* ── Hero ── */}
          <header className="mb-10">
            <p className="alchemy-eyebrow mb-3 text-xs">Prospector Terminal</p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">

              {/* Profile */}
              <div className="relative flex-1 overflow-hidden border border-cyan-100/12 bg-black/42 p-6 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/7 via-transparent to-cyan-300/3" />
                <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/55 to-transparent" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Avatar */}
                  <div className="relative h-16 w-16 shrink-0 flex items-center justify-center border border-magma-gold/35 bg-orange-500/8">
                    <Flame className="h-7 w-7 text-magma-gold/80" />
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center border border-emerald-400/55 bg-emerald-500/14">
                      <span className="h-1.5 w-1.5 animate-pulse bg-emerald-400" />
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="alchemy-heading-strong text-2xl leading-tight md:text-3xl">
                      Prospector #{address?.slice(-4)}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="border border-cyan-100/10 bg-black/40 px-2.5 py-1 text-xs text-cyan-50/50">
                        {address?.slice(0, 6)}…{address?.slice(-4)}
                      </code>
                      <span className="border border-emerald-400/45 bg-emerald-500/8 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                        Connected
                      </span>
                    </div>
                  </div>
                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex shrink-0 items-center gap-2 border border-cyan-100/12 bg-black/42 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50/58 transition-all hover:border-magma-orange/45 hover:text-magma-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="relative overflow-hidden border border-cyan-100/12 bg-black/42 p-6 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.28)] lg:w-72">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-300/5 via-transparent to-blue-500/3" />
                <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-ethereal-cyan/45 to-transparent" />
                <div className="relative">
                  <p className="alchemy-eyebrow mb-4 text-xs">Wallet Balance</p>
                  <p className="alchemy-heading text-4xl text-white mb-1">{balance || "0.00"}</p>
                  <p className="mb-5 text-sm text-cyan-50/42">{balanceSymbol || "RON"}</p>
                  <div className="divide-y divide-cyan-100/8">
                    <div className="flex justify-between py-2.5">
                      <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
                        <Zap className="h-3 w-3 text-magma-gold/65" />
                        $CORE Mined
                      </span>
                      <span className="text-xs font-semibold text-magma-gold">{stats.totalCOREMined}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
                        <TrendingUp className="h-3 w-3 text-emerald-400/65" />
                        Daily Rate
                      </span>
                      <span className="text-xs font-semibold text-emerald-300">+{stats.dailyRate}/day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ── Tabs ── */}
          <nav className="mb-8 flex flex-wrap gap-2" aria-label="Dashboard sections">
            <DashTabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={BarChart2} label="Overview" />
            <DashTabButton active={activeTab === "axies"} onClick={() => setActiveTab("axies")} icon={Users} label={`Axies (${displayAxies.length})`} />
            <DashTabButton active={activeTab === "coreminers"} onClick={() => setActiveTab("coreminers")} icon={Gem} label={`CoreMiners (${displayMiners.length})`} />
            <DashTabButton active={activeTab === "stats"} onClick={() => setActiveTab("stats")} icon={BarChart2} label="Stats" />
          </nav>

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div className="space-y-10">

              {/* PoH banner */}
              {needsPohVerification && systemInfo && (
                <PohVerificationBanner
                  isVerified={systemInfo.pohVerification.isVerified}
                  verificationLevel={systemInfo.pohVerification.level}
                  expiresAt={systemInfo.pohVerification.expiresAt}
                  onConvert={async () => {
                    try {
                      const result = await convertAll();
                      if (result.success) {
                        showSuccess("fCORE converted to CORE successfully");
                      } else {
                        showError(result.error || "Error converting fCORE");
                      }
                    } catch (error) {
                      showError(error instanceof Error ? error.message : "Unknown error");
                    }
                  }}
                  isLoading={isLoadingfCore}
                />
              )}

              {/* Stat cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} value={stats.axiesOwned} label="Axies in Wallet" />
                <StatCard icon={Gem} value={stats.coreMinersActive} label="Active CoreMiners" valueColor="text-ethereal-cyan" />
                <StatCard icon={Pickaxe} value={stats.totalCOREMined} label="$CORE Mined" valueColor="text-magma-gold" />
                <StatCard icon={TrendingUp} value={`${stats.dailyRate}`} label="$CORE / Day" valueColor="text-emerald-300" />
              </div>

              {/* Cycles summary */}
              {activeCycles.length > 0 && (
                <div className="relative overflow-hidden border border-magma-gold/28 bg-black/42 p-6 shadow-[0_0_36px_rgba(247,198,90,0.06)] backdrop-blur-md">
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-cyan-300/4" />
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/65 to-transparent" />
                  <div className="relative mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-magma-gold" />
                      <h2 className="alchemy-heading text-xl">Active Cycles</h2>
                      <span className="border border-magma-gold/35 bg-orange-500/8 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-widest text-magma-gold/75">
                        {activeCycles.length}
                      </span>
                    </div>
                    <Link href="/staking">
                      <span className="inline-flex items-center gap-2 border border-cyan-100/12 bg-black/42 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-50/58 transition-all hover:border-ethereal-cyan/45 hover:text-cyan-50">
                        View Details
                      </span>
                    </Link>
                  </div>
                  <div className="relative grid grid-cols-1 divide-y divide-cyan-100/8 md:grid-cols-3 md:divide-x md:divide-y-0">
                    {[
                      { icon: Lock, label: "Locked Miners", value: String(totalMinersLocked), color: "text-white" },
                      { icon: TrendingUp, label: "Average Bonus", value: `+${averageBonus.toFixed(1)}%`, color: "text-magma-gold" },
                      { icon: Clock, label: "Next Ending", value: nextCycleLabel, color: "text-ethereal-cyan" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="flex items-center gap-4 px-5 py-4 first:pl-0 md:first:pl-5">
                        <Icon className="h-5 w-5 shrink-0 text-cyan-50/28" />
                        <div>
                          <p className="text-xs text-cyan-50/45">{label}</p>
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main action cards */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Forge */}
                <article className="group relative overflow-hidden border border-cyan-100/12 bg-black/42 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-cyan-300/5 opacity-70 transition-opacity group-hover:opacity-100" />
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/60 to-transparent" />
                  <div className="relative">
                    <Hammer className="mb-4 h-8 w-8 text-magma-gold" />
                    <h2 className="alchemy-heading mb-2 text-2xl">The Forge</h2>
                    <p className="mb-6 text-sm leading-6 text-cyan-50/52">
                      Transmute dormant Axies into CoreMiners and start mining $CORE
                    </p>
                    <div className="mb-6 space-y-2.5">
                      {["Phase 1: Create Crystalline Geode", "Phase 2: Hatch the CoreMiner", "Phase 3: Activate Mining"].map((step, i) => (
                        <div key={step} className="flex items-center gap-2.5 text-xs text-cyan-50/52">
                          <div className={`h-1 w-1 shrink-0 ${i === 0 ? "bg-magma-orange" : i === 1 ? "bg-magma-gold" : "bg-emerald-400"}`} />
                          {step}
                        </div>
                      ))}
                    </div>
                    <Link href="/forge">
                      <span className="inline-flex items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white">
                        <Hammer className="h-3.5 w-3.5" />
                        Go to the Forge
                      </span>
                    </Link>
                  </div>
                </article>

                {/* Mining */}
                <article className="group relative overflow-hidden border border-cyan-100/12 bg-black/42 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-300/8 via-transparent to-blue-500/5 opacity-70 transition-opacity group-hover:opacity-100" />
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-ethereal-cyan/50 to-transparent" />
                  <div className="relative">
                    <Pickaxe className="mb-4 h-8 w-8 text-ethereal-cyan" />
                    <h2 className="alchemy-heading mb-2 text-2xl">Mining</h2>
                    <p className="mb-6 text-sm leading-6 text-cyan-50/52">
                      Activate CoreMiners and configure mining cycles to generate $CORE passively
                    </p>
                    <div className="mb-6 space-y-2.5">
                      {["Cycles: 1 week to 3 months", "Longer commitment = Higher bonus", "Automatic rewards distribution"].map((step) => (
                        <div key={step} className="flex items-center gap-2.5 text-xs text-cyan-50/52">
                          <div className="h-1 w-1 shrink-0 bg-ethereal-cyan/60" />
                          {step}
                        </div>
                      ))}
                    </div>
                    <Link href="/mining">
                      <span className="inline-flex items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white">
                        <Pickaxe className="h-3.5 w-3.5" />
                        View Mining
                      </span>
                    </Link>
                  </div>
                </article>
              </div>

              {/* Secondary navigation cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { icon: Layers, title: "Staking", desc: "Stake Axies to generate Resonance Power without burning them", href: "/staking", label: "View Staking" },
                  { icon: ShoppingBag, title: "Marketplace", desc: "Buy and sell CoreMiners, Geodes and resources", href: "/marketplace", label: "Explore" },
                  { icon: Backpack, title: "Inventory", desc: "Manage your Axies, CoreMiners, Geodes and assets", href: "/inventory", label: "View Inventory" },
                ].map(({ icon: Icon, title, desc, href, label }) => (
                  <article key={title} className="group relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5">
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-300/4 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-cyan-300/25 to-transparent" />
                    <div className="relative">
                      <Icon className="mb-3 h-6 w-6 text-ethereal-cyan/65" />
                      <h3 className="alchemy-heading mb-2 text-lg">{title}</h3>
                      <p className="mb-4 text-xs leading-5 text-cyan-50/45">{desc}</p>
                      <Link href={href}>
                        <span className="inline-flex items-center gap-1.5 border border-cyan-100/12 bg-black/42 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-50/58 transition-all hover:border-ethereal-cyan/45 hover:text-cyan-50">
                          {label}
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Recent Activity */}
              <section>
                <header className="mb-5 flex items-center gap-3">
                  <Activity className="h-5 w-5 text-ethereal-cyan" />
                  <h2 className="alchemy-heading text-xl">Recent Activity</h2>
                </header>
                <div className="divide-y divide-cyan-100/8 border border-cyan-100/10 bg-black/30 backdrop-blur-md">
                  {[
                    { icon: Hammer, title: "Forge Completed", desc: "Beast CoreMiner created successfully", time: "2h ago", color: "text-magma-orange" },
                    { icon: Zap, title: "Mining Reward", desc: "+42.5 $CORE claimed", time: "5h ago", color: "text-emerald-300" },
                    { icon: Layers, title: "Axie Staked", desc: "3 Axies locked for 30 days", time: "1 day ago", color: "text-ethereal-cyan" },
                  ].map(({ icon: Icon, title, desc, time, color }) => (
                    <div key={title} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-cyan-100/12 bg-black/40">
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div>
                          <p className="text-sm text-white">{title}</p>
                          <p className="text-xs text-cyan-50/42">{desc}</p>
                        </div>
                      </div>
                      <p className="shrink-0 text-xs text-cyan-50/30">{time}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── Axies Tab ── */}
          {activeTab === "axies" && (
            <div>
              <header className="mb-6">
                <h2 className="alchemy-heading text-2xl mb-1">My Axies</h2>
                <p className="text-sm text-cyan-50/45">Manage your Axies and prepare them for forging</p>
              </header>
              {displayAxies.length === 0 ? (
                <div className="border border-orange-300/18 bg-black/42 px-6 py-20 text-center backdrop-blur-md">
                  <Users className="mx-auto mb-5 h-9 w-9 text-magma-gold/55" />
                  <h3 className="alchemy-heading mb-3 text-2xl">No Axies Found</h3>
                  <p className="alchemy-copy text-sm text-cyan-50/55">Your Axie NFTs will appear here once connected</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {displayAxies.map((axie) => (
                    <article key={axie.id} className="relative overflow-hidden border border-cyan-100/12 bg-black/42 p-5 backdrop-blur-md">
                      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-magma-gold/45 to-transparent" />
                      <div className="relative mb-4 flex h-32 items-center justify-center border border-cyan-100/8 bg-black/30 text-5xl">
                        {axie.image}
                      </div>
                      <h3 className="alchemy-heading text-base mb-2">{axie.name}</h3>
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        <span className="border border-ethereal-cyan/35 bg-cyan-300/6 px-2 py-0.5 text-[0.62rem] font-semibold uppercase text-ethereal-cyan/70">{axie.class}</span>
                        <span className={`border px-2 py-0.5 text-[0.62rem] font-semibold uppercase ${
                          axie.rarity === "Epic" ? "border-magma-orange/45 bg-magma-orange/8 text-magma-orange"
                          : axie.rarity === "Rare" ? "border-ethereal-cyan/35 bg-cyan-300/6 text-ethereal-cyan/70"
                          : "border-cyan-100/12 bg-black/30 text-cyan-50/42"
                        }`}>{axie.rarity}</span>
                        {axie.isStaked && (
                          <span className="border border-emerald-400/45 bg-emerald-500/8 px-2 py-0.5 text-[0.62rem] font-semibold uppercase text-emerald-300">Staked</span>
                        )}
                      </div>
                      <div className="mb-4 divide-y divide-cyan-100/8 border border-cyan-100/8 bg-black/20">
                        <div className="flex justify-between px-3 py-2">
                          <span className="text-xs text-cyan-50/52">Level</span>
                          <span className="text-xs font-semibold text-white">{axie.level}</span>
                        </div>
                        <div className="flex justify-between px-3 py-2">
                          <span className="text-xs text-cyan-50/52">Class</span>
                          <span className="text-xs font-semibold text-white">{axie.class}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="flex-1 border border-cyan-100/12 bg-black/30 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50/52 transition-all hover:border-ethereal-cyan/35 hover:text-cyan-50">
                          Details
                        </button>
                        <button type="button" className="flex-1 border border-ethereal-cyan/55 bg-cyan-300/14 py-2.5 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_20px_rgba(125,249,255,0.12)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white">
                          Forge
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CoreMiners Tab ── */}
          {activeTab === "coreminers" && (
            <div>
              <header className="mb-6">
                <h2 className="alchemy-heading text-2xl mb-1">My CoreMiners</h2>
                <p className="text-sm text-cyan-50/45">Manage CoreMiners and optimize mining output</p>
              </header>

              {isLoadingData && (
                <div className="flex items-center justify-center py-20">
                  <Loading size="lg" text="Loading CoreMiners…" />
                </div>
              )}

              {!isLoadingData && displayMiners.length > 0 && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {displayMiners.map((miner) => (
                    <MinerCard
                      key={miner.id}
                      miner={miner}
                      onConfigure={handleConfigureMiner}
                      onActivate={(id, name) => handleConfigureMiner(id, name)}
                      onDeactivate={handleDeactivateMiner}
                      onClaim={handleClaimRewards}
                      isProcessing={isMinerActionProcessing}
                    />
                  ))}
                </div>
              )}

              {!isLoadingData && displayMiners.length === 0 && (
                <div className="border border-orange-300/18 bg-black/42 px-6 py-20 text-center backdrop-blur-md">
                  <Gem className="mx-auto mb-5 h-9 w-9 text-magma-gold/55" />
                  <h3 className="alchemy-heading mb-3 text-2xl">No CoreMiners Yet</h3>
                  <p className="alchemy-copy mx-auto max-w-md text-sm leading-6 text-cyan-50/55">
                    Forge your first Axies to create CoreMiners and start mining $CORE
                  </p>
                  <Link href="/forge">
                    <span className="mx-auto mt-8 inline-flex items-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-7 py-3 text-sm font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white">
                      <Hammer className="h-4 w-4" />
                      Go to the Forge
                    </span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── Stats Tab ── */}
          {activeTab === "stats" && (
            <StatsTab
              displayMiners={displayMiners}
              selectedMinerForStats={selectedMinerForStats}
              setSelectedMinerForStats={setSelectedMinerForStats}
            />
          )}

          {/* ── Axies section (hook data) ── */}
          {axiesHook.length > 0 && (
            <section className="mt-14">
              <header className="mb-6 flex items-center gap-3">
                <Users className="h-5 w-5 text-magma-gold" />
                <h2 className="alchemy-heading text-xl">My Axies</h2>
                <span className="border border-magma-gold/35 bg-orange-500/8 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-widest text-magma-gold/75">
                  {axiesHook.length}
                </span>
              </header>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {axiesHook.map((axie) => (
                  <AxieCard
                    key={axie.tokenId}
                    axie={axie}
                    onStake={async (axieId) => {
                      try {
                        await stakeAxie(axieId);
                        showSuccess("Axie staked successfully");
                      } catch (error) {
                        showError(`Staking error: ${error instanceof Error ? error.message : "Unknown error"}`);
                      }
                    }}
                    onUnstake={async (axieId) => {
                      try {
                        await unstakeAxie(axieId);
                        showSuccess("Axie unstaked successfully");
                      } catch (error) {
                        showError(`Unstaking error: ${error instanceof Error ? error.message : "Unknown error"}`);
                      }
                    }}
                    isLoading={isAxiesLoading}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* ── Modals & Overlays ── */}
      {selectedMinerForConfig && (
        <MinerConfigModal
          isOpen={configModalOpen}
          onClose={() => { setConfigModalOpen(false); setSelectedMinerForConfig(null); }}
          onConfirm={handleActivateMiner}
          minerName={selectedMinerForConfig.name}
          isProcessing={isMinerActionProcessing}
        />
      )}

      <FCoreExplanationModal isOpen={showfCoreModal} onClose={() => setShowfCoreModal(false)} />

      {toast && (
        <Toast message={toast.message} type={toast.type} title={toast.title} onClose={hideToast} />
      )}
    </>
  );
}
