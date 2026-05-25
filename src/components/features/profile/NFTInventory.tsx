// @ts-nocheck
/**
 * Componente de inventario de NFTs
 * Muestra los Axies y Mineros del usuario cargados desde su wallet
 */

"use client";

import { useMemo } from "react";
import { useNFTs } from "@/lib/hooks/nfts/useNFTs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CoreMinerCard } from "@/components/CoreMinerCard";
import Image from "next/image";
import type { AxieNFT, MinerNFT } from "./types";

interface NFTInventoryProps {
  stakingContractAddress?: string;
  minerContractAddress?: string;
}

export function NFTInventory({
  stakingContractAddress,
  minerContractAddress,
}: NFTInventoryProps) {
  const { axies, miners, isLoading, error, reload } = useNFTs({
    autoLoad: true,
    stakingContractAddress,
    minerContractAddress,
  });

  const stats = useMemo(() => {
    const totalAxies = axies.length;
    const totalMiners = miners.length;
    const totalMiningPower = miners.reduce(
      (sum, m) => sum + (m.miningPower || 0),
      0,
    );
    const voraciousMiners = miners.filter(
      (m) => (m as unknown as { isVoracious?: boolean }).isVoracious,
    ).length;
    return {
      totalAxies,
      totalMiners,
      totalResonancePower: 0,
      totalMiningPower,
      voraciousMiners,
    };
  }, [axies, miners]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={reload} className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Axies" value={stats.totalAxies} icon="🦎" />
        <StatCard label="Total Mineros" value={stats.totalMiners} icon="⛏️" />
        <StatCard
          label="Poder de Resonancia"
          value={stats.totalResonancePower}
          icon="✨"
        />
        <StatCard
          label="Poder de Minería"
          value={stats.totalMiningPower}
          icon="💎"
        />
      </div>

      {/* Axies Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Mis Axies</h2>
          <Button onClick={reload} disabled={isLoading}>
            {isLoading ? "Cargando..." : "Recargar"}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : axies.length === 0 ? (
          <EmptyState
            icon="🦎"
            title="No tienes Axies"
            description="Conecta tu wallet para ver tus Axies"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {axies.map((axie) => (
              <AxieCard key={axie.tokenId} axie={axie} />
            ))}
          </div>
        )}
      </section>

      {/* Miners Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Mis Mineros</h2>
          <div className="text-sm text-gray-600">
            {stats.voraciousMiners > 0 && (
              <span className="text-orange-600 font-medium">
                ⚠️ {stats.voraciousMiners} mineros voraces
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : miners.length === 0 ? (
          <EmptyState
            icon="⛏️"
            title="No tienes Mineros"
            description="Forja una Geoda para obtener tu primer minero"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {miners.map((miner) => (
              <MinerCard key={miner.tokenId.toString()} miner={miner} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}

// Componente de tarjeta de Axie
function AxieCard({ axie }: { axie: AxieNFT }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={axie.metadata.image}
          alt={axie.metadata.name}
          fill
          className="object-cover"
        />
        {axie.isStaked && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            Stakeado
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{axie.metadata.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
            {axie.metadata.class}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">HP:</span>{" "}
            <span className="font-medium">{axie.metadata.stats.hp}</span>
          </div>
          <div>
            <span className="text-gray-600">Speed:</span>{" "}
            <span className="font-medium">{axie.metadata.stats.speed}</span>
          </div>
          <div>
            <span className="text-gray-600">Skill:</span>{" "}
            <span className="font-medium">{axie.metadata.stats.skill}</span>
          </div>
          <div>
            <span className="text-gray-600">Morale:</span>{" "}
            <span className="font-medium">{axie.metadata.stats.morale}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Componente de tarjeta de Minero
function MinerCard({ miner }: { miner: MinerNFT }) {
  const rarityAttr = miner.metadata.attributes.find(
    (attr) => attr.trait_type === "Rarity",
  );
  const rarity = rarityAttr?.value || "Common";

  const rarityColors: Record<string, string> = {
    Common: "bg-gray-100 text-gray-700",
    Rare: "bg-blue-100 text-blue-700",
    Epic: "bg-purple-100 text-purple-700",
    Legendary: "bg-orange-100 text-orange-700",
    Mythic: "bg-red-100 text-red-700",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <Image
          src={miner.metadata.image}
          alt={miner.metadata.name}
          fill
          className="object-cover"
        />
        {miner.isVoracious && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            Voraz
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{miner.metadata.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-sm px-2 py-1 rounded ${rarityColors[rarity as string]}`}
          >
            {rarity}
          </span>
          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Nivel {miner.level.toString()}
          </span>
        </div>
        <div className="space-y-2">
          <StatBar
            label="Poder"
            value={Number(miner.power)}
            max={200}
            color="bg-red-500"
          />
          <StatBar
            label="Eficiencia"
            value={Number(miner.efficiency)}
            max={100}
            color="bg-blue-500"
          />
          <StatBar
            label="Durabilidad"
            value={Number(miner.durability)}
            max={100}
            color="bg-green-500"
          />
        </div>
      </div>
    </Card>
  );
}

// Componente de barra de estadística
function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Componente de estado vacío
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <span className="text-6xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Componente de skeleton loading
function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}
