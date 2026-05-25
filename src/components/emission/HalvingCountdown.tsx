/**
 * HalvingCountdown
 * 
 * Componente para mostrar countdown hasta el próximo halving
 * con barra de progreso y fecha estimada
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { Clock, Calendar } from 'lucide-react';

export interface HalvingCountdownProps {
  nextHalvingDate: Date | null;
  timeUntilHalving: string;
  daysUntilHalving: number;
  currentHalving: number;
  halvingPeriodDays: number;
  className?: string;
}

/**
 * Countdown visual hasta próximo halving
 */
export function HalvingCountdown({
  nextHalvingDate,
  timeUntilHalving,
  daysUntilHalving,
  currentHalving,
  halvingPeriodDays,
  className = '',
}: HalvingCountdownProps) {
  // Calcular progreso del período actual (0-100%)
  const progress = halvingPeriodDays > 0
    ? ((halvingPeriodDays - daysUntilHalving) / halvingPeriodDays) * 100
    : 0;

  const progressClamped = Math.max(0, Math.min(100, progress));

  return (
    <div className={`bg-linear-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">
            Próximo Halving #{currentHalving + 1}
          </h3>
        </div>
        
        {nextHalvingDate && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{nextHalvingDate.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
        )}
      </div>

      {/* Countdown Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-purple-400">
            {Math.floor(daysUntilHalving)}
          </span>
          <span className="text-lg text-gray-400">días restantes</span>
        </div>
        <div className="text-sm text-gray-500">
          {timeUntilHalving}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Progreso del período actual</span>
          <span>{progressClamped.toFixed(1)}%</span>
        </div>
        
        <div className="relative w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-linear-to-r from-purple-900/30 to-blue-900/30" />
          
          {/* Progress fill */}
          <div
            className="relative h-full bg-linear-to-r from-purple-500 via-purple-400 to-blue-400 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
            style={{ width: `${progressClamped}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Milestones */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-purple-400 font-medium">
            Halving #{currentHalving}
          </span>
          <span className="text-blue-400 font-medium">
            Halving #{currentHalving + 1}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-purple-500/20">
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <div className="text-purple-400 mt-0.5">💡</div>
          <p>
            Cuando ocurra el próximo halving, la tasa de emisión se reducirá a la mitad,
            disminuyendo la inflación y aumentando la escasez del token CORE.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Variante compacta del countdown (para usar en headers/badges)
 */
export function HalvingCountdownCompact({
  daysUntilHalving,
  currentHalving,
}: {
  daysUntilHalving: number;
  currentHalving: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1.5">
      <Clock className="w-4 h-4 text-purple-400" />
      <div className="text-sm">
        <span className="font-bold text-purple-400">
          {Math.floor(daysUntilHalving)}d
        </span>
        <span className="text-gray-400 ml-1">
          → Halving #{currentHalving + 1}
        </span>
      </div>
    </div>
  );
}
