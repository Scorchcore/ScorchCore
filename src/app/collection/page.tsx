"use client";


import React from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useCollectionBonus } from "@/lib/hooks/economy/useCollectionBonus";
import { Card, Button, Badge, Loading } from "@/components/ui";
import {
  Award,
  TrendingUp,
  Lock,
  CheckCircle,
  XCircle,
  Target,
} from "lucide-react";
import Link from "next/link";

/**
 * Página de Collection - Sistema de Bonuses por Sets
 *
 * Muestra progreso de colecciones de NFTs y bonuses acumulados
 */
export default function CollectionPage() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const { allSets, userProgress, bonusSummary, isLoading, error } =
    useCollectionBonus();

  // Redirect si no está conectado
  React.useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => router.push("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet no conectada
          </h2>
          <p className="text-gray-400 mb-6">
            Conecta tu wallet para ver tu progreso de colecciones
          </p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Ir al Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <Loading text="Cargando colecciones..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <Card className="p-8 max-w-2xl mx-auto">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Error al cargar colecciones
          </h2>
          <p className="text-gray-400 text-center mb-6">
            {error.message || "Error desconocido"}
          </p>
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard")}
            >
              Volver al Dashboard
            </Button>
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
                🏆 Colecciones
              </h1>
              <p className="text-gray-400">
                Completa sets para desbloquear bonuses de minería
              </p>
            </div>
            {bonusSummary && (
              <Card variant="glass" className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    +{bonusSummary.totalBonus}%
                  </div>
                  <div className="text-sm text-gray-400">Bonus Total</div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Resumen de Bonuses */}
        {bonusSummary && bonusSummary.totalBonus > 0 && (
          <Card
            variant="glass"
            className="p-6 mb-6 border-2 border-green-500/50 bg-green-500/10"
          >
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 text-green-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-400 mb-2">
                  🎉 Bonuses Activos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Sets Completos</div>
                    <div className="text-xl font-bold text-white">
                      {bonusSummary.completedSets}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Bonus de Minería</div>
                    <div className="text-xl font-bold text-green-400">
                      +{bonusSummary.totalBonus}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Sets Activos</div>
                    <div className="text-xl font-bold text-white">
                      {bonusSummary.activeBonuses.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Sets de Colecciones */}
        <div className="space-y-6">
          {allSets?.map((set) => {
            const progress = userProgress?.[set.id];
            const isCompleted = progress?.isCompleted ?? false;
            const totalRequired = set.requiredCounts.reduce(
              (sum, count) => sum + count,
              0,
            );
            const totalOwned =
              progress?.requirements.reduce((sum, req) => sum + req.owned, 0) ??
              0;
            const progressPercent =
              totalRequired > 0 ? (totalOwned / totalRequired) * 100 : 0;

            return (
              <Card key={set.id} variant="glass" className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">
                        {set.name}
                      </h2>
                      {isCompleted ? (
                        <Badge
                          variant="success"
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Completado
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          {totalOwned}/{totalRequired}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 mb-4">{set.description}</p>

                    {/* Barra de Progreso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progreso</span>
                        <span>{progressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCompleted
                              ? "bg-linear-to-r from-green-500 to-emerald-600"
                              : "bg-linear-to-r from-orange-500 to-red-600"
                          }`}
                          style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Bonus Info */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">Requisito:</span>
                        <span className="text-white font-bold">
                          {totalRequired} NFTs
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">Bonus:</span>
                        <span className="text-green-400 font-bold">
                          +{set.bonusPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500/20 border-2 border-green-500"
                        : "bg-gray-800 border-2 border-gray-700"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    ) : (
                      <Lock className="w-10 h-10 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Requisitos del Set */}
                {progress?.requirements && progress.requirements.length > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-sm font-bold text-gray-400 mb-3">
                      Progreso por tipo:
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {progress.requirements.map((req, idx) => (
                        <div key={idx} className="bg-gray-800 rounded p-3">
                          <div className="text-xs text-gray-400 mb-1">
                            {req.typeName}
                          </div>
                          <div className="text-sm font-bold text-white">
                            {req.owned}/{req.required}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* No Sets Available */}
        {(!allSets || allSets.length === 0) && (
          <Card variant="glass" className="p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No hay sets disponibles
            </h3>
            <p className="text-gray-400 mb-6">
              Los sets de colecciones estarán disponibles próximamente
            </p>
          </Card>
        )}

        {/* Información del Sistema */}
        <Card variant="glass" className="p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">
            💡 Sobre el Sistema de Colecciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h3 className="font-bold text-white mb-2">
                ¿Cómo funcionan los Sets?
              </h3>
              <p>
                Los sets son colecciones temáticas de NFTs. Al completar un set
                (poseer todos los NFTs requeridos), obtienes un bonus permanente
                de minería que se acumula con otros sets completados.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Beneficios</h3>
              <ul className="space-y-1">
                <li>• Bonus de minería acumulativo por cada set</li>
                <li>• Incremento de rewards en fCORE</li>
                <li>• Badges y reconocimiento en el protocolo</li>
                <li>• Acceso a beneficios exclusivos futuros</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Estrategia Pro
            </h3>
            <p className="text-sm text-gray-300">
              Los NFTs en sets no necesitan estar stakeados para recibir el
              bonus. Puedes mantenerlos en tu wallet o stakearlos para obtener
              beneficios adicionales.
            </p>
          </div>
        </Card>

        {/* Acciones Rápidas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/forge">
            <Card
              variant="glass"
              className="p-6 hover:border-orange-500/50 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Forjar Geodas
              </h3>
              <p className="text-sm text-gray-400">
                Crea nuevas geodas y obtén más NFTs para completar sets
              </p>
            </Card>
          </Link>
          <Link href="/inventory">
            <Card
              variant="glass"
              className="p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Ver Inventario
              </h3>
              <p className="text-sm text-gray-400">
                Revisa tus NFTs y geodas disponibles
              </p>
            </Card>
          </Link>
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
                Gestiona tus miners y obtén recompensas
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
