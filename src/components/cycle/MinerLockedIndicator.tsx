'use client';

import { Lock, Clock } from 'lucide-react';
import { useCycleManager } from '@/lib/hooks';

interface MinerLockedIndicatorProps {
  minerId: bigint;
  variant?: 'badge' | 'overlay' | 'inline';
  className?: string;
}

export function MinerLockedIndicator({
  minerId,
  variant = 'badge',
  className = '',
}: MinerLockedIndicatorProps) {
  const { activeCycles } = useCycleManager();

  const cycleInfo = activeCycles.find(cycle =>
    cycle.minerIds.some(id => id === minerId)
  );

  if (!cycleInfo) return null;

  const timeRemaining = Math.max(0, cycleInfo.timeRemaining);
  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return '< 1h';
  };

  if (variant === 'overlay') {
    return (
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 ${className}`}>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <div className="bg-amber-500/20 p-3 rounded-full">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Bloqueado en Ciclo</p>
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {cycleInfo.isFinished ? 'Terminado' : formatTime(timeRemaining)}
            </p>
          </div>
          {cycleInfo.bonusPercentage > 0 && (
            <div className="text-xs text-purple-400 font-medium">
              +{cycleInfo.bonusPercentage}% bonus
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-amber-400 ${className}`}>
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">
          En ciclo · {cycleInfo.isFinished ? 'Terminado' : formatTime(timeRemaining)}
        </span>
        {cycleInfo.bonusPercentage > 0 && (
          <span className="text-xs text-purple-400 font-bold">
            +{cycleInfo.bonusPercentage}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-amber-500/20 border border-amber-500/40 rounded-lg px-3 py-1.5 flex items-center gap-2 ${className}`}>
      <Lock className="w-4 h-4 text-amber-400" />
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-amber-300">
          {cycleInfo.isFinished ? 'Ciclo Terminado' : formatTime(timeRemaining)}
        </span>
        {cycleInfo.bonusPercentage > 0 && (
          <span className="text-purple-400 font-bold text-xs">
            +{cycleInfo.bonusPercentage}%
          </span>
        )}
      </div>
    </div>
  );
}
