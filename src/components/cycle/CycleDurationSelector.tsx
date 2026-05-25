'use client';

import { useState } from 'react';
import { Clock, TrendingUp, Info } from 'lucide-react';
import { CycleDuration } from '@/lib/contracts/interfaces/ICycleContract';
import { CYCLE_DURATION_NAMES, type CycleBonusInfo } from '@/lib/services/cycle';

interface CycleDurationSelectorProps {
  selectedDuration: CycleDuration;
  onSelectDuration: (duration: CycleDuration) => void;
  bonusInfo: CycleBonusInfo[];
  disabled?: boolean;
  className?: string;
}

export function CycleDurationSelector({
  selectedDuration,
  onSelectDuration,
  bonusInfo,
  disabled = false,
  className = '',
}: CycleDurationSelectorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getGradientClass = (bonus: number) => {
    if (bonus === 0) return 'from-gray-500 to-gray-600';
    if (bonus < 3) return 'from-blue-500 to-blue-600';
    if (bonus < 5) return 'from-purple-500 to-purple-600';
    return 'from-amber-500 to-amber-600';
  };

  const getBadgeColor = (bonus: number) => {
    if (bonus === 0) return 'bg-gray-100 text-gray-700';
    if (bonus < 3) return 'bg-blue-100 text-blue-700';
    if (bonus < 5) return 'bg-purple-100 text-purple-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con info */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Duración del Ciclo
        </h3>
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Tooltip explicativo */}
      {showTooltip && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
          <p className="font-semibold text-white mb-2">Bonos por Compromiso</p>
          <p>
            Bloquea tus miners por períodos más largos para obtener bonos en las recompensas de minería.
            Los miners no podrán ser utilizados hasta que finalice el ciclo.
          </p>
        </div>
      )}

      {/* Grid de opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bonusInfo.map((info) => {
          const isSelected = selectedDuration === info.duration;
          const gradientClass = getGradientClass(info.bonusPercentage);
          const badgeColor = getBadgeColor(info.bonusPercentage);

          return (
            <button
              key={info.duration}
              type="button"
              onClick={() => onSelectDuration(info.duration)}
              disabled={disabled}
              className={`
                relative overflow-hidden rounded-xl p-4 transition-all duration-200
                ${isSelected
                  ? `bg-linear-to-br ${gradientClass} shadow-lg scale-105 ring-2 ring-white ring-opacity-50`
                  : 'bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Badge de bonus */}
              {info.bonusPercentage > 0 && (
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {info.bonusDisplay}
                </div>
              )}

              {/* Contenido */}
              <div className="space-y-2">
                <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {CYCLE_DURATION_NAMES[info.duration]}
                </div>
                
                <div className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
                  {info.durationDays} días
                </div>

                {info.bonusPercentage > 0 ? (
                  <div className={`text-xs font-medium ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                    +{info.bonusPercentage}% recompensas
                  </div>
                ) : (
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    Sin bonus
                  </div>
                )}
              </div>

              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute bottom-2 left-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info adicional */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-xs text-gray-400">
        <p>
          💡 <span className="font-semibold text-gray-300">Nota:</span> Los miners bloqueados en un ciclo no podrán
          ser usados para otras operaciones hasta que el ciclo finalice.
        </p>
      </div>
    </div>
  );
}
