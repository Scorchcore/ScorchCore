'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { CYCLE_DURATION_NAMES, type ActiveCycle } from '@/lib/services/cycle';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { Toast, useToast } from '@/components/ui';

const log = createServiceLogger('ActiveCycleCard');

interface ActiveCycleCardProps {
  cycle: ActiveCycle;
  onEndCycle?: (cycleId: bigint) => Promise<void>;
  className?: string;
}

export function ActiveCycleCard({
  cycle,
  onEndCycle,
  className = '',
}: ActiveCycleCardProps) {
  const [isEnding, setIsEnding] = useState(false);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const { toast, showError, hideToast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeRemaining = Math.max(0, cycle.endTime - currentTime);
  const progress = cycle.endTime > cycle.startTime
    ? ((currentTime - cycle.startTime) / (cycle.endTime - cycle.startTime)) * 100
    : 0;

  const handleEndCycle = async () => {
    if (!onEndCycle || isEnding) return;

    setIsEnding(true);
    try {
      await onEndCycle(cycle.cycleId);
    } catch (error) {
      log.error('Failed to end cycle', error, { 
        cycleId: cycle.cycleId.toString(),
        minerCount: cycle.minerCount 
      });
      showError(
        'No se pudo finalizar el ciclo. Por favor intenta de nuevo.',
        'Error al Finalizar Ciclo'
      );
    } finally {
      setIsEnding(false);
    }
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusColor = () => {
    if (cycle.isFinished) return 'text-green-400';
    if (timeRemaining < 3600) return 'text-amber-400';
    return 'text-blue-400';
  };

  const getStatusBg = () => {
    if (cycle.isFinished) return 'bg-green-500/10 border-green-500/30';
    if (timeRemaining < 3600) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-blue-500/10 border-blue-500/30';
  };

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">
              Ciclo #{cycle.cycleId.toString()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {cycle.durationName}
          </h3>
        </div>

        {/* Badge de bonus */}
        {cycle.bonusPercentage > 0 && (
          <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg px-3 py-1.5 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-300">
              +{cycle.bonusPercentage}%
            </span>
          </div>
        )}
      </div>

      {/* Miners bloqueados */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Miners bloqueados:</span>
        <span className="font-bold text-white">{cycle.minerIds.length}</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Progreso</span>
          <span>{Math.min(100, Math.round(progress))}%</span>
        </div>
        <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              cycle.isFinished
                ? 'bg-linear-to-r from-green-500 to-green-400'
                : 'bg-linear-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Estado */}
      <div className={`rounded-lg border p-3 ${getStatusBg()}`}>
        <div className="flex items-center gap-2">
          {cycle.isFinished ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-300">
                  Ciclo Completado
                </p>
                <p className="text-xs text-gray-400">
                  Puedes finalizar el ciclo para desbloquear tus miners
                </p>
              </div>
            </>
          ) : (
            <>
              <Clock className={`w-5 h-5 ${getStatusColor()}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Tiempo restante
                </p>
                <p className={`text-lg font-mono font-bold ${getStatusColor()}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700 text-xs">
        <div>
          <p className="text-gray-500 mb-1">Inicio</p>
          <p className="text-gray-300 font-medium">
            {new Date(cycle.startTime * 1000).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Finalización</p>
          <p className="text-gray-300 font-medium">
            {new Date(cycle.endTime * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Botón de finalizar */}
      {cycle.canClaim && onEndCycle && (
        <button
          onClick={handleEndCycle}
          disabled={isEnding}
          className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                   text-white font-bold py-3 rounded-lg transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          {isEnding ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Finalizar Ciclo
            </>
          )}
        </button>
      )}

      {/* Warning si falta poco tiempo */}
      {!cycle.isFinished && timeRemaining < 3600 && timeRemaining > 0 && (
        <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>El ciclo está por terminar. Pronto podrás finalizar y desbloquear tus miners.</p>
        </div>
      )}

      {/* Toast para errores */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
