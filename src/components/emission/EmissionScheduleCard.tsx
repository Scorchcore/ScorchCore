/**
 * EmissionScheduleCard
 * 
 * Card principal para mostrar información del Emission Schedule
 * Incluye tasa actual, total emitido, y countdown hasta halving
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { TrendingUp, Calendar, Zap, Award } from 'lucide-react';
import type { EmissionScheduleUI } from '@/lib/services/emission';
import { HalvingCountdown } from './HalvingCountdown';

export interface EmissionScheduleCardProps {
  info: EmissionScheduleUI;
  className?: string;
}

/**
 * Card de información del Emission Schedule
 */
export function EmissionScheduleCard({
  info,
  className = '',
}: EmissionScheduleCardProps) {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Token Emission Schedule
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Halving cada año • Sistema deflacionario
            </p>
          </div>
          
          {/* Halving Badge */}
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2">
            <div className="text-xs text-purple-300 font-medium">Halving Actual</div>
            <div className="text-2xl font-bold text-purple-400">
              #{info.currentHalving}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasa Actual */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400 font-medium">Tasa Actual</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {info.currentRate}
          </div>
          <div className="text-xs text-gray-500">CORE por segundo</div>
          <div className="text-sm text-blue-400 mt-2">
            ~{info.currentRatePerDay} / día
          </div>
        </div>

        {/* Emisión Anual */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400 font-medium">Emisión Anual</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {info.yearlyEmission}
          </div>
          <div className="text-xs text-gray-500">CORE este año</div>
          <div className="text-sm text-green-400 mt-2">
            {info.emissionStarted ? 'Activo' : 'No iniciado'}
          </div>
        </div>

        {/* Total Emitido */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400 font-medium">Total Emitido</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {info.totalEmitted}
          </div>
          <div className="text-xs text-gray-500">
            de {info.totalMiningRewards} total
          </div>
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-linear-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(info.totalEmittedPercentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-yellow-400 mt-1">
              {info.totalEmittedPercentage.toFixed(2)}% emitido
            </div>
          </div>
        </div>

        {/* Rewards Restantes */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400 font-medium">Restante</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {info.remainingRewards}
          </div>
          <div className="text-xs text-gray-500">CORE por emitir</div>
          <div className="text-sm text-purple-400 mt-2">
            {info.remainingPercentage.toFixed(2)}% restante
          </div>
        </div>
      </div>

      {/* Halving Countdown */}
      <div className="px-6 pb-6">
        <HalvingCountdown
          nextHalvingDate={info.nextHalvingDate}
          timeUntilHalving={info.timeUntilHalving}
          daysUntilHalving={info.daysUntilHalving}
          currentHalving={info.currentHalving}
          halvingPeriodDays={info.halvingPeriodDays}
        />
      </div>

      {/* Info Footer */}
      <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 rounded-b-lg">
        <div className="flex items-start gap-3">
          <div className="text-blue-400 mt-1">ℹ️</div>
          <div className="text-sm text-gray-400">
            <p className="font-medium text-gray-300 mb-1">Sistema de Halving Anual</p>
            <p>
              La emisión de CORE se reduce a la mitad cada {info.halvingPeriodDays} días (~1 año).
              Iniciando con {info.initialYearlyEmission} CORE en el primer año, el sistema
              garantiza un suministro máximo de {info.totalMiningRewards} CORE para minería.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
