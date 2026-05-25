/**
 * SetBonusIndicator
 * 
 * Indicador compacto de bonuses de set activos
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { Badge } from '@/components/ui';
import { useCollectionBonus } from '@/lib/hooks/economy/useCollectionBonus';

export interface SetBonusIndicatorProps {
  variant?: 'default' | 'minimal';
  showDetails?: boolean;
}

export function SetBonusIndicator({
  variant = 'default',
  showDetails = false,
}: SetBonusIndicatorProps) {
  const { bonusSummary, isLoading } = useCollectionBonus();

  if (isLoading || !bonusSummary) {
    return null;
  }

  if (bonusSummary.totalBonus === 0) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <Badge variant="success" className="text-xs">
        📚 +{(bonusSummary.totalBonus / 100).toFixed(2)}%
      </Badge>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Badge variant="success" className="text-xs font-bold">
        📚 Set Bonus: +{(bonusSummary.totalBonus / 100).toFixed(2)}%
      </Badge>
      
      {showDetails && bonusSummary.activeBonuses.length > 0 && (
        <div className="flex gap-1">
          {bonusSummary.activeBonuses.map((bonus) => (
            <div
              key={bonus.setId}
              className="text-xs bg-green-500/10 border border-green-500/30 rounded px-2 py-1 text-green-400"
              title={`${bonus.setName}: +${(bonus.bonus / 100).toFixed(2)}%`}
            >
              {bonus.setName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Tooltip variant para mostrar detalles de bonuses
 */
export function SetBonusTooltip() {
  const { bonusSummary, isLoading } = useCollectionBonus();

  if (isLoading || !bonusSummary || bonusSummary.totalBonus === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-xl">
      <div className="text-sm font-bold text-white mb-3">
        📚 Bonuses de Set Activos
      </div>
      
      <div className="space-y-2 mb-3">
        {bonusSummary.activeBonuses.map((bonus) => (
          <div key={bonus.setId} className="flex items-center justify-between">
            <span className="text-xs text-gray-300">{bonus.setName}</span>
            <span className="text-xs font-bold text-green-400">
              +{(bonus.bonus / 100).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      
      <div className="pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Total</span>
          <span className="text-sm font-bold text-green-400">
            +{(bonusSummary.totalBonus / 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
