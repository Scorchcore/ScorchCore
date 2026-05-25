"use client";



import React from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/hooks/user/useWallet";
import { useTrustScore } from "@/lib/hooks/user/useTrustScore";
import { Card, Button, Badge, Loading } from "@/components/ui";
import { TrustScoreBadge } from "@/components/trustscore";
import {
  Award,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

/**
 * Página de TrustScore - Sistema de Reputación
 *
 * Muestra información completa del TrustScore del usuario:
 * - Score actual y nivel
 * - Requisitos para próximo nivel
 * - Beneficios desbloqueados
 * - Estado de flagging
 */
export default function TrustScorePage() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const { trustScoreInfo, isLoading, error } = useTrustScore();

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
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet no conectada
          </h2>
          <p className="text-gray-400 mb-6">
            Conecta tu wallet para ver tu TrustScore
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
        <Loading text="Cargando TrustScore..." />
      </div>
    );
  }

  if (error || !trustScoreInfo) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <Card className="p-8 max-w-2xl mx-auto">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Error al cargar TrustScore
          </h2>
          <p className="text-gray-400 text-center mb-6">
            {typeof error === "string"
              ? error
              : error?.message ||
                "No se pudo obtener información del TrustScore"}
          </p>
          <div className="flex justify-center gap-4">
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

  const { score, level, levelName, nextLevelScore, flagged, isStale } =
    trustScoreInfo;

  // Calcular progreso al siguiente nivel
  const progressToNextLevel =
    nextLevelScore && nextLevelScore > 0
      ? trustScoreInfo.percentToNextLevel
      : 100;

  // Beneficios por nivel
  const LEVEL_BENEFITS = {
    0: ["Acceso a categoría PETIT", "Forja básica disponible"],
    1: ["Acceso a categoría ALTO", "Forja avanzada disponible"],
    2: ["Acceso a categoría ANIMAL", "Bonus de minería mejorados"],
    3: ["Acceso a categoría ULTRAMECH", "Participación en governanza"],
    4: ["Acceso a categoría TANQUE", "Rewards premium", "Acceso VIP"],
  };

  const currentBenefits =
    LEVEL_BENEFITS[level as keyof typeof LEVEL_BENEFITS] || [];
  const nextLevelBenefits =
    LEVEL_BENEFITS[(level + 1) as keyof typeof LEVEL_BENEFITS] || [];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🏆 TrustScore
              </h1>
              <p className="text-gray-400">
                Sistema de reputación del protocolo
              </p>
            </div>
            <TrustScoreBadge
              score={score}
              level={level}
              levelName={levelName}
              isFlagged={flagged}
              isStale={isStale}
              size="lg"
              showLabel={true}
            />
          </div>
        </div>

        {/* Alertas */}
        {flagged && (
          <Card
            variant="glass"
            className="p-6 mb-6 border-2 border-red-500/50 bg-red-500/10"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-2">
                  ⚠️ Cuenta Flagged
                </h3>
                <p className="text-gray-300 mb-2">
                  Tu cuenta ha sido marcada por actividad sospechosa. Algunos
                  beneficios pueden estar limitados.
                </p>
                <p className="text-sm text-gray-400">
                  Contacta al equipo de soporte si consideras que esto es un
                  error.
                </p>
              </div>
            </div>
          </Card>
        )}

        {isStale && (
          <Card
            variant="glass"
            className="p-4 mb-6 border border-yellow-500/50 bg-yellow-500/10"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-gray-300">
                Tu TrustScore no se ha actualizado recientemente. Interactúa con
                el protocolo para mejorarlo.
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Actual */}
          <Card variant="glass" className="p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Score Actual</h2>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-4 mb-4">
                <div className="text-6xl font-bold text-white">{score}</div>
                <div className="text-3xl font-bold text-gray-400 mb-2">
                  / {nextLevelScore || "∞"}
                </div>
              </div>

              {nextLevelScore && nextLevelScore > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>
                      Nivel {level}: {levelName}
                    </span>
                    <span>
                      Nivel {level + 1}: {progressToNextLevel.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-orange-500 to-red-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(progressToNextLevel, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Necesitas {nextLevelScore - score} puntos más para el
                    siguiente nivel
                  </p>
                </div>
              )}
            </div>

            {/* Beneficios Actuales */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Beneficios Desbloqueados
              </h3>
              <div className="space-y-2">
                {currentBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Beneficios */}
            {nextLevelBenefits.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Próximos Beneficios (Nivel {level + 1})
                </h3>
                <div className="space-y-2">
                  {nextLevelBenefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 opacity-60"
                    >
                      <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-400">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Información del Sistema */}
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Tu Nivel</h2>
              </div>
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-white mb-2">
                  {level}
                </div>
                <div className="text-lg text-gray-400">{levelName}</div>
                <Badge
                  variant={flagged ? "danger" : "success"}
                  className="mt-4"
                >
                  {flagged ? "Flagged" : "Verificado"}
                </Badge>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                ¿Cómo mejorarlo?
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Forja geodas regularmente
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Mantén miners en staking
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Participa en ciclos de minería
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Completa verificación PoH
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <Link href="/forge">
                  <Button variant="primary" size="sm" className="w-full">
                    🔥 Forjar Geodas
                  </Button>
                </Link>
                <Link href="/staking">
                  <Button variant="secondary" size="sm" className="w-full">
                    ⛏️ Mining Dashboard
                  </Button>
                </Link>
                <Link href="/inventory">
                  <Button variant="secondary" size="sm" className="w-full">
                    📦 Ver Inventario
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Información del Sistema */}
        <Card variant="glass" className="p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">
            💡 Sobre TrustScore
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h3 className="font-bold text-white mb-2">¿Qué es TrustScore?</h3>
              <p>
                TrustScore es un sistema de reputación on-chain que mide tu
                participación y confiabilidad en el protocolo ScorchCore. A
                mayor score, mayores beneficios.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Niveles del Sistema</h3>
              <ul className="space-y-1">
                <li>• Nivel 0: Basic (0-99 puntos)</li>
                <li>• Nivel 1: Bronze (100-299 puntos)</li>
                <li>• Nivel 2: Silver (300-699 puntos)</li>
                <li>• Nivel 3: Gold (700-1499 puntos)</li>
                <li>• Nivel 4: Platinum (1500+ puntos)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
