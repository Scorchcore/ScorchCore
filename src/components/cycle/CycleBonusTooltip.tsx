'use client';

import { TrendingUp, Clock, Lock, Award } from 'lucide-react';
import { CYCLE_DURATION_NAMES, type CycleBonusInfo } from '@/lib/services/cycle';

interface CycleBonusTooltipProps {
  bonusInfo: CycleBonusInfo[];
  className?: string;
}

export function CycleBonusTooltip({
  bonusInfo,
  className = '',
}: CycleBonusTooltipProps) {
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-purple-500/20 p-2 rounded-lg">
          <Award className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Sistema de Bonos por Compromiso</h3>
          <p className="text-sm text-gray-400">Gana más recompensas comprometiendo tus miners</p>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
        <p className="mb-3">
          Al iniciar un ciclo de minería, puedes elegir comprometer tus miners por diferentes períodos.
          Cuanto más largo el compromiso, mayor será el bonus en tus recompensas.
        </p>
        <div className="flex items-start gap-2 text-xs text-amber-400">
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold">Importante:</span> Los miners quedarán bloqueados hasta que
            finalice el ciclo y no podrán ser usados para otras operaciones.
          </p>
        </div>
      </div>

      {/* Tabla de bonos */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Bonos Disponibles
        </h4>
        
        <div className="space-y-2">
          {bonusInfo.map((info) => {
            const hasBonus = info.bonusPercentage > 0;
            
            return (
              <div
                key={info.duration}
                className={`
                  rounded-lg p-3 border transition-colors
                  ${hasBonus
                    ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30'
                    : 'bg-gray-800/50 border-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${hasBonus ? 'text-purple-400' : 'text-gray-500'}`} />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {CYCLE_DURATION_NAMES[info.duration]}
                      </p>
                      <p className="text-xs text-gray-400">
                        {info.durationDays} días
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {hasBonus ? (
                      <>
                        <p className="text-lg font-bold text-purple-400">
                          +{info.bonusPercentage}%
                        </p>
                        <p className="text-xs text-gray-500">bonus</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Sin bonus</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ejemplo */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Ejemplo
        </p>
        <p className="text-xs text-gray-300">
          Si normalmente ganarías <span className="font-bold text-white">100 CORE</span> en un mes,
          con un ciclo <span className="font-bold text-purple-400">COMMITTED (30 días)</span> ganarías{' '}
          <span className="font-bold text-green-400">102 CORE</span> gracias al bonus del 2%.
        </p>
      </div>

      {/* Tips */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400">💡 Consejos</p>
        <ul className="space-y-1.5 text-xs text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 flex-shrink-0">•</span>
            <span>Planifica con anticipación: no podrás usar los miners durante el ciclo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 flex-shrink-0">•</span>
            <span>Los bonos se aplican automáticamente a todas las recompensas del ciclo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 flex-shrink-0">•</span>
            <span>Puedes tener múltiples ciclos activos con diferentes miners</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
