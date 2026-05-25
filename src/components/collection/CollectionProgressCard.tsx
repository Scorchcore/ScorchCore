/**
 * CollectionProgressCard
 * 
 * Card para mostrar el progreso de colecciones y sets
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { Card, Badge, Loading } from '@/components/ui';
import { useCollectionBonus } from '@/lib/hooks/economy/useCollectionBonus';
import type { SetProgress } from '@/lib/services/collection';

export interface CollectionProgressCardProps {
  variant?: 'default' | 'compact';
}

export function CollectionProgressCard({
  variant = 'default',
}: CollectionProgressCardProps) {
  const { allSets, userProgress, bonusSummary, isLoading, error } = useCollectionBonus();

  if (isLoading) {
    return (
      <Card variant="gradient" className="p-6">
        <Loading size="md" text="Cargando colecciones..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="gradient" className="p-6">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Error</div>
          <div className="text-sm text-gray-400">
            No se pudo cargar el progreso de colecciones
          </div>
        </div>
      </Card>
    );
  }

  if (allSets.length === 0) {
    return (
      <Card variant="gradient" className="p-6">
        <div className="text-center text-gray-400">
          No hay sets configurados
        </div>
      </Card>
    );
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-400';
    if (progress >= 75) return 'text-blue-400';
    if (progress >= 50) return 'text-yellow-400';
    if (progress >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (variant === 'compact') {
    return (
      <Card variant="gradient" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">📚 Sets</h3>
          {bonusSummary && bonusSummary.totalBonus > 0 && (
            <Badge variant="success" className="text-xs">
              +{(bonusSummary.totalBonus / 100).toFixed(2)}% Bonus
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          {userProgress.map((progress) => (
            <div key={progress.setId} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {allSets[progress.setId]?.emoji || '📦'} {progress.setName}
              </span>
              <span className={`text-xs font-bold ${getProgressColor(progress.progress)}`}>
                {progress.isCompleted ? '✅' : `${progress.progress}%`}
              </span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="gradient" className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">📚 Progreso de Colecciones</h3>
          <p className="text-xs text-gray-400">
            Completa sets para obtener bonuses de minado
          </p>
        </div>
        {bonusSummary && bonusSummary.totalBonus > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-400">Bonus Total</div>
            <div className="text-2xl font-bold text-green-400">
              +{(bonusSummary.totalBonus / 100).toFixed(2)}%
            </div>
          </div>
        )}
      </div>

      {/* Sets Progress */}
      <div className="space-y-4">
        {userProgress.map((progress) => {
          const set = allSets.find(s => s.id === progress.setId);
          if (!set) return null;

          return (
            <div
              key={progress.setId}
              className={`bg-black/40 rounded-lg p-4 border ${
                progress.isCompleted
                  ? 'border-green-500/50'
                  : 'border-gray-700'
              }`}
            >
              {/* Set Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{set.emoji || '📦'}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {progress.setName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {set.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={progress.isCompleted ? 'success' : 'default'}
                    className="text-xs"
                  >
                    {progress.isCompleted ? '✅ Completado' : `${progress.progress}%`}
                  </Badge>
                  <div className="text-xs text-green-400 mt-1">
                    +{(progress.bonusPercentage / 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressBarColor(progress.progress)}`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="grid grid-cols-2 gap-2">
                {progress.requirements.map((req, index) => (
                  <div
                    key={index}
                    className="bg-black/60 rounded p-2 border border-gray-700"
                  >
                    <div className="text-xs text-gray-400 mb-1">
                      {req.typeName}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${
                        req.owned >= req.required ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {req.owned}/{req.required}
                      </span>
                      {req.owned >= req.required && (
                        <span className="text-green-400">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Set Hint */}
      {bonusSummary?.nextSetProgress && (
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400">💡</span>
            <span className="text-sm font-medium text-blue-400">
              Próximo Set
            </span>
          </div>
          <p className="text-xs text-gray-300">
            Estás cerca de completar <strong>{bonusSummary.nextSetProgress.setName}</strong> ({bonusSummary.nextSetProgress.progress}%)
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          Los bonuses de set se aplican automáticamente al minado 🎯
        </div>
      </div>
    </Card>
  );
}
