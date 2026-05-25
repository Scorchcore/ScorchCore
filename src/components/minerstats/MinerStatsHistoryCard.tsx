/**
 * MinerStatsHistoryCard
 * 
 * Card para mostrar estadísticas históricas de un miner
 * con indicadores de salud, durabilidad, eficiencia y nivel
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { Activity, Zap, Wrench, Heart, TrendingUp, AlertTriangle } from 'lucide-react';
import type { MinerStatsUI } from '@/lib/services/minerstats';
import { MinerStatsService } from '@/lib/services/minerstats';

export interface MinerStatsHistoryCardProps {
  stats: MinerStatsUI;
  health: {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number;
    warnings: string[];
  };
  className?: string;
}

/**
 * Obtiene color basado en status
 */
function getStatusColor(status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'): string {
  switch (status) {
    case 'excellent': return 'text-green-400';
    case 'good': return 'text-blue-400';
    case 'fair': return 'text-yellow-400';
    case 'poor': return 'text-orange-400';
    case 'critical': return 'text-red-400';
  }
}

/**
 * Obtiene color de barra de progreso
 */
function getProgressColor(status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'): string {
  switch (status) {
    case 'excellent': return 'bg-green-500';
    case 'good': return 'bg-blue-500';
    case 'fair': return 'bg-yellow-500';
    case 'poor': return 'bg-orange-500';
    case 'critical': return 'bg-red-500';
  }
}

/**
 * Card de estadísticas históricas de miner
 */
export function MinerStatsHistoryCard({
  stats,
  health,
  className = '',
}: MinerStatsHistoryCardProps) {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Estadísticas del Miner
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {stats.levelFormatted} • {stats.experienceFormatted}
            </p>
          </div>
          
          {/* Health Score Badge */}
          <div className={`rounded-lg px-4 py-2 ${
            health.overall === 'excellent' ? 'bg-green-500/20 border-green-500/30' :
            health.overall === 'good' ? 'bg-blue-500/20 border-blue-500/30' :
            health.overall === 'fair' ? 'bg-yellow-500/20 border-yellow-500/30' :
            health.overall === 'poor' ? 'bg-orange-500/20 border-orange-500/30' :
            'bg-red-500/20 border-red-500/30'
          } border`}>
            <div className="text-xs text-gray-300 font-medium">Salud General</div>
            <div className={`text-2xl font-bold ${getStatusColor(health.overall)}`}>
              {health.score}
            </div>
            <div className="text-xs text-gray-400">/ 100</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Durability */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className={`w-4 h-4 ${getStatusColor(stats.durabilityStatus)}`} />
            <span className="text-sm text-gray-400 font-medium">Durabilidad</span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-3xl font-bold ${getStatusColor(stats.durabilityStatus)}`}>
              {stats.durability}
            </span>
            <span className="text-gray-500">/ 100</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div
              className={`${getProgressColor(stats.durabilityStatus)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${stats.durabilityPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Última reparación: {MinerStatsService.formatTime(stats.timeSinceLastRepaired)}
            </span>
            {stats.needsRepair && (
              <span className="text-orange-400 font-medium">⚠️ Reparar</span>
            )}
          </div>
        </div>

        {/* Efficiency */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap className={`w-4 h-4 ${getStatusColor(stats.efficiencyStatus)}`} />
            <span className="text-sm text-gray-400 font-medium">Eficiencia</span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-3xl font-bold ${getStatusColor(stats.efficiencyStatus)}`}>
              {stats.efficiency}
            </span>
            <span className="text-gray-500">/ 100</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div
              className={`${getProgressColor(stats.efficiencyStatus)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${stats.efficiencyPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Multiplicador: {stats.effectiveMultiplier.toFixed(1)}x
            </span>
            {stats.isVoracious && (
              <span className="text-purple-400 font-medium">🔥 Voraz</span>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400 font-medium">Experiencia</span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-white">
              {stats.experience.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">XP</span>
          </div>

          {/* Progress to next level */}
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.experienceProgress}%` }}
            />
          </div>

          <div className="text-xs text-gray-500">
            {stats.experienceToNextLevel.toLocaleString()} XP hasta nivel {stats.level + 1}
          </div>
        </div>

        {/* Hunger Status */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Heart className={`w-4 h-4 ${
              stats.hungerStatus === 'starving' ? 'text-red-400' :
              stats.hungerStatus === 'hungry' ? 'text-yellow-400' :
              'text-green-400'
            }`} />
            <span className="text-sm text-gray-400 font-medium">Estado de Alimentación</span>
          </div>
          
          <div className="mb-2">
            <span className={`text-lg font-bold ${
              stats.hungerStatus === 'starving' ? 'text-red-400' :
              stats.hungerStatus === 'hungry' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {stats.hungerStatus === 'starving' ? '😰 Hambre Crítica' :
               stats.hungerStatus === 'hungry' ? '😋 Hambriento' :
               '😊 Bien Alimentado'}
            </span>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            {stats.timeUntilHungry > 0 ? (
              <p>Hambre en: {MinerStatsService.formatTime(stats.timeUntilHungry)}</p>
            ) : (
              <p className="text-yellow-400">⚠️ Necesita alimentación</p>
            )}
            <p>Última comida: {MinerStatsService.formatTime(stats.timeSinceLastFed)}</p>
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      {health.warnings.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium text-orange-300">Atención Requerida</p>
                {health.warnings.map((warning, idx) => (
                  <p key={idx} className="text-sm text-gray-300">• {warning}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Última minería: {MinerStatsService.formatTime(stats.timeSinceLastMined)}</span>
          <span>Nivel {stats.level} • {stats.experienceProgress.toFixed(1)}% progreso</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Variante compacta del card (para usar en listas)
 */
export function MinerStatsHistoryCardCompact({
  stats,
  health,
}: MinerStatsHistoryCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Health Score */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            health.overall === 'excellent' ? 'bg-green-500/20 text-green-400' :
            health.overall === 'good' ? 'bg-blue-500/20 text-blue-400' :
            health.overall === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
            health.overall === 'poor' ? 'bg-orange-500/20 text-orange-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            <span className="text-lg font-bold">{health.score}</span>
          </div>

          {/* Stats */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-sm">
              <span className={getStatusColor(stats.durabilityStatus)}>
                🔧 {stats.durability}%
              </span>
              <span className={getStatusColor(stats.efficiencyStatus)}>
                ⚡ {stats.efficiency}%
              </span>
              <span className="text-blue-400">
                📈 Lv.{stats.level}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Multiplicador: {stats.effectiveMultiplier.toFixed(1)}x
            </div>
          </div>
        </div>

        {/* Warnings */}
        {health.warnings.length > 0 && (
          <AlertTriangle className="w-5 h-5 text-orange-400" />
        )}
      </div>
    </div>
  );
}
