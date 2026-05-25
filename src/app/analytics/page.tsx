"use client";



import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useNFTs } from "@/lib/hooks/nfts/useNFTs";
import { useMinerComparison } from "@/lib/hooks/mining/useMinerStatsHistory";
import { Card, Button, Badge, Loading } from "@/components/ui";
import {
  MinerPerformanceChart,
  MinerComparisonTable,
} from "@/components/minerstats";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

/**
 * Página de Analytics - Análisis Profundo de Miners
 *
 * Herramientas avanzadas para comparar y analizar rendimiento de CoreMiners
 */
export default function AnalyticsPage() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const { miners, isLoading: isLoadingMiners } = useNFTs({ minersOnly: true });
  const [selectedMiners, setSelectedMiners] = useState<bigint[]>([]);

  const {
    comparisons,
    averages,
    isLoading: isLoadingComparisons,
  } = useMinerComparison(selectedMiners);

  // Redirect si no está conectado
  React.useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => router.push("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  // Auto-seleccionar primeros 3 miners
  React.useEffect(() => {
    if (miners.length > 0 && selectedMiners.length === 0) {
      const firstThree = miners.slice(0, 3).map((m) => m.tokenId);
      setSelectedMiners(firstThree);
    }
  }, [miners, selectedMiners.length]);

  const toggleMinerSelection = (minerId: bigint) => {
    setSelectedMiners((prev) => {
      const minerIdStr = minerId.toString();
      const exists = prev.some((id) => id.toString() === minerIdStr);

      if (exists) {
        return prev.filter((id) => id.toString() !== minerIdStr);
      } else {
        if (prev.length >= 5) {
          return prev; // Max 5 miners
        }
        return [...prev, minerId];
      }
    });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet no conectada
          </h2>
          <p className="text-gray-400 mb-6">
            Conecta tu wallet para analizar tus CoreMiners
          </p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Ir al Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoadingMiners) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <Loading text="Cargando miners..." />
      </div>
    );
  }

  if (miners.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            No tienes CoreMiners
          </h2>
          <p className="text-gray-400 mb-6">
            Necesitas tener al menos un CoreMiner para usar las herramientas de
            análisis
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/inventory">
              <Button variant="primary">Ver Inventario</Button>
            </Link>
            <Link href="/forge">
              <Button variant="secondary">Forjar Geodas</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
          >
            ← Volver al Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                📊 Analytics
              </h1>
              <p className="text-gray-400">
                Análisis comparativo y rendimiento de CoreMiners
              </p>
            </div>
            <Card variant="glass" className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {miners.length}
                </div>
                <div className="text-sm text-gray-400">Total Miners</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Selector de Miners */}
        <Card variant="glass" className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              Selecciona Miners para Comparar
            </h2>
            <Badge variant="default">
              {selectedMiners.length}/5 seleccionados
            </Badge>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Selecciona hasta 5 miners para comparar su rendimiento (click para
            agregar/quitar)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {miners.map((miner) => {
              const isSelected = selectedMiners.some(
                (id) => id.toString() === miner.tokenId.toString(),
              );

              return (
                <button
                  key={miner.tokenId.toString()}
                  onClick={() => toggleMinerSelection(miner.tokenId)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⛏️</div>
                    <div className="text-sm font-bold text-white mb-1">
                      #{miner.tokenId.toString()}
                    </div>
                    <div className="text-xs text-gray-400">Miner</div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedMiners.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">
                  Selecciona al menos un miner para ver estadísticas
                  comparativas
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Comparación de Miners */}
        {selectedMiners.length > 0 && (
          <>
            {isLoadingComparisons ? (
              <Card variant="glass" className="p-8">
                <Loading text="Cargando estadísticas..." />
              </Card>
            ) : (
              <>
                {/* Promedios Generales */}
                {averages && (
                  <Card variant="glass" className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                      📈 Promedios de Selección
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-white mb-1">
                          {averages.avgDurability.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">
                          Durabilidad Promedio
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-white mb-1">
                          {averages.avgEfficiency.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">
                          Eficiencia Promedio
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-white mb-1">
                          {averages.avgLevel.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Nivel Promedio
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-white mb-1">
                          {averages.avgMultiplier.toFixed(2)}x
                        </div>
                        <div className="text-sm text-gray-400">
                          Multiplicador Promedio
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Gráfico de Rendimiento - TODO: Implementar cuando esté disponible */}

                {/* Tabla Comparativa */}
                <Card variant="glass" className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    📋 Tabla Comparativa Detallada
                  </h2>
                  {comparisons.length > 0 ? (
                    <MinerComparisonTable comparisons={comparisons} />
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No hay datos de comparación disponibles
                    </div>
                  )}
                </Card>
              </>
            )}
          </>
        )}

        {/* Información y Tips */}
        <Card variant="glass" className="p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">
            💡 Tips de Análisis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Métricas Clave
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  • <strong>Durabilidad:</strong> Salud actual del miner
                  (0-100%)
                </li>
                <li>
                  • <strong>Eficiencia:</strong> Rendimiento de minería
                  (afectado por durabilidad)
                </li>
                <li>
                  • <strong>Total Rewards:</strong> fCORE acumulado histórico
                </li>
                <li>
                  • <strong>Ciclos Completados:</strong> Total de ciclos de
                  minería finalizados
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Optimización
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Miners con baja durabilidad necesitan mantenimiento</li>
                <li>• Alta eficiencia = mejor ratio rewards/tiempo</li>
                <li>
                  • Compara rarities para entender diferencias de rendimiento
                </li>
                <li>• Usa collection bonuses para maximizar rewards</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Acciones Rápidas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/staking">
            <Card
              variant="glass"
              className="p-6 hover:border-green-500/50 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-3">⛏️</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Mining Dashboard
              </h3>
              <p className="text-sm text-gray-400">
                Gestiona tus miners activos y rewards
              </p>
            </Card>
          </Link>
          <Link href="/collection">
            <Card
              variant="glass"
              className="p-6 hover:border-orange-500/50 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-bold text-white mb-2">Colecciones</h3>
              <p className="text-sm text-gray-400">
                Ver progreso de sets y bonuses activos
              </p>
            </Card>
          </Link>
          <Link href="/inventory">
            <Card
              variant="glass"
              className="p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-lg font-bold text-white mb-2">Inventario</h3>
              <p className="text-sm text-gray-400">
                Revisar geodas y NFTs disponibles
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
