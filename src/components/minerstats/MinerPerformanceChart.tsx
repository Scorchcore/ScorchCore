/**
 * MinerPerformanceChart
 * 
 * Gráfico visual de rendimiento del miner mostrando
 * durabilidad, eficiencia y multiplicador efectivo
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MinerStatsUI } from '@/lib/services/minerstats';

export interface MinerPerformanceChartProps {
  stats: MinerStatsUI;
  className?: string;
}

/**
 * Gráfico de barras simple para rendimiento del miner
 */
export function MinerPerformanceChart({
  stats,
  className = '',
}: MinerPerformanceChartProps) {
  // Calcular tendencias (simplificado - en producción usarías histórico real)
  const durabilityTrend = stats.durability >= 70 ? 'up' : 'down';
  const efficiencyTrend = stats.efficiency >= 70 ? 'up' : 'down';

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">
          Rendimiento del Miner
        </h3>
        <p className="text-sm text-gray-400">
          Métricas actuales de performance
        </p>
      </div>

      {/* Chart Bars */}
      <div className="space-y-6">
        {/* Durability Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">Durabilidad</span>
              {durabilityTrend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <span className="text-sm font-bold text-white">{stats.durability}%</span>
          </div>
          <div className="relative w-full bg-slate-700 rounded-full h-4">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 bg-linear-to-r from-blue-500 to-blue-400"
              style={{ width: `${stats.durabilityPercent}%` }}
            />
            {/* Threshold markers */}
            <div className="absolute top-0 left-[50%] w-0.5 h-full bg-slate-600" />
            <div className="absolute top-0 left-[80%] w-0.5 h-full bg-slate-600" />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>

        {/* Efficiency Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">Eficiencia</span>
              {efficiencyTrend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <span className="text-sm font-bold text-white">{stats.efficiency}%</span>
          </div>
          <div className="relative w-full bg-slate-700 rounded-full h-4">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 bg-linear-to-r from-purple-500 to-purple-400"
              style={{ width: `${stats.efficiencyPercent}%` }}
            />
            {/* Threshold markers */}
            <div className="absolute top-0 left-[50%] w-0.5 h-full bg-slate-600" />
            <div className="absolute top-0 left-[80%] w-0.5 h-full bg-slate-600" />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>

        {/* Effective Multiplier Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Multiplicador Efectivo</span>
            <span className="text-sm font-bold text-white">{stats.effectiveMultiplier.toFixed(1)}x</span>
          </div>
          <div className="relative w-full bg-slate-700 rounded-full h-4">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 bg-linear-to-r from-green-500 to-green-400"
              style={{ width: `${stats.effectiveMultiplier}%` }}
            />
            {/* Threshold markers */}
            <div className="absolute top-0 left-[50%] w-0.5 h-full bg-slate-600" />
            <div className="absolute top-0 left-[80%] w-0.5 h-full bg-slate-600" />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0x</span>
            <span>50x</span>
            <span>80x</span>
            <span>100x</span>
          </div>
        </div>

        {/* Experience Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Progreso a Nivel {stats.level + 1}</span>
            <span className="text-sm font-bold text-white">{stats.experienceProgress.toFixed(1)}%</span>
          </div>
          <div className="relative w-full bg-slate-700 rounded-full h-4">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 bg-linear-to-r from-yellow-500 to-yellow-400"
              style={{ width: `${stats.experienceProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.experienceToNextLevel.toLocaleString()} XP restantes
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{stats.durability}</div>
            <div className="text-xs text-gray-500">Durabilidad</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{stats.efficiency}</div>
            <div className="text-xs text-gray-500">Eficiencia</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{stats.effectiveMultiplier.toFixed(1)}x</div>
            <div className="text-xs text-gray-500">Multiplicador</div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 flex flex-wrap gap-2">
        {stats.isVoracious && (
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
            🔥 Voraz
          </span>
        )}
        {stats.needsRepair && (
          <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30">
            ⚠️ Necesita Reparación
          </span>
        )}
        {stats.isHungry && (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
            😋 Hambriento
          </span>
        )}
        {stats.isStarving && (
          <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
            😰 Hambre Crítica
          </span>
        )}
      </div>
    </div>
  );
}
