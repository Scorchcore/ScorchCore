'use client';

import { Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui';

interface AxieBonusIndicatorProps {
  stakedAxiesCount: number;
  bonusPerAxie?: number;
  className?: string;
  variant?: 'compact' | 'detailed';
}

/**
 * Indicador de bonus de Axie Staking en Forge
 * 
 * Muestra visualmente el bonus de mining power que se obtiene
 * por tener Axies stakeados (+10 power por Axie)
 * 
 * @pattern Presentation Component - Solo UI
 */
export function AxieBonusIndicator({
  stakedAxiesCount,
  bonusPerAxie = 10,
  className = '',
  variant = 'detailed',
}: AxieBonusIndicatorProps) {
  const totalBonus = stakedAxiesCount * bonusPerAxie;
  const hasBonus = totalBonus > 0;

  if (!hasBonus) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/40 rounded-md ${className}`}>
        <Zap className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-medium text-purple-300">
          +{totalBonus} Power
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3 bg-linear-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Zap className="w-5 h-5 text-purple-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm text-purple-300">Bonus de Axie Staking</h4>
            <Badge variant="success" className="text-xs">
              Activo
            </Badge>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-purple-400">
              +{totalBonus}
            </span>
            <span className="text-xs text-gray-400">Mining Power</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {stakedAxiesCount} Axie{stakedAxiesCount !== 1 ? 's' : ''} stakeado{stakedAxiesCount !== 1 ? 's' : ''} × {bonusPerAxie} power
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-purple-500/20">
            <p className="text-xs text-purple-300/80">
              💡 Tus Axies stakeados aumentan el poder de minado de las geodas forjadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
