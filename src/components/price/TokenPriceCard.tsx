/**
 * TokenPriceCard
 * 
 * Card para mostrar el precio de CORE token
 * 
 * @pattern Presentation Component
 */

import React from 'react';
import { Card, Badge, Loading } from '@/components/ui';
import { usePriceOracle } from '@/lib/hooks/economy/usePriceOracle';

export interface TokenPriceCardProps {
  variant?: 'default' | 'compact';
  showStats?: boolean;
}

export function TokenPriceCard({
  variant = 'default',
  showStats = true,
}: TokenPriceCardProps) {
  const { currentPrice, priceInfo, priceStats, isLoading, error } = usePriceOracle(true, 30000);

  if (isLoading && !currentPrice) {
    return (
      <Card variant="gradient" className="p-6">
        <Loading size="md" text="Cargando precio..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="gradient" className="p-6">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Error</div>
          <div className="text-sm text-gray-400">
            No se pudo cargar el precio
          </div>
        </div>
      </Card>
    );
  }

  if (!currentPrice || !priceInfo) {
    return (
      <Card variant="gradient" className="p-6">
        <div className="text-center text-gray-400">
          Sin datos de precio
        </div>
      </Card>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString();
  };

  if (variant === 'compact') {
    return (
      <Card variant="gradient" className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💎</div>
            <div>
              <div className="text-xs text-gray-400">CORE Price</div>
              <div className="text-2xl font-bold text-white">
                ${currentPrice.toFixed(4)}
              </div>
            </div>
          </div>
          <Badge 
            variant={priceInfo.isFresh ? 'success' : 'warning'}
            className="text-xs"
          >
            {priceInfo.isFresh ? '✅ Fresh' : '⚠️ Stale'}
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="gradient" className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl">💎</div>
          <div>
            <h3 className="text-sm text-gray-400">CORE Token</h3>
            <p className="text-xs text-gray-500">Precio en USD</p>
          </div>
        </div>
        <Badge 
          variant={priceInfo.isFresh ? 'success' : 'warning'}
          className="text-xs"
        >
          {priceInfo.isFresh ? '✅ Fresh' : '⚠️ Stale'}
        </Badge>
      </div>

      {/* Price Display */}
      <div className="mb-6">
        <div className="text-5xl font-bold text-white mb-2">
          ${currentPrice.toFixed(4)}
        </div>
        <div className="text-sm text-gray-400">
          Actualizado {formatTime(priceInfo.lastUpdate)}
        </div>
      </div>

      {/* Stats */}
      {showStats && priceStats && (
        <div className="grid grid-cols-2 gap-3">
          {/* Last Update */}
          <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Última Actualización</div>
            <div className="text-sm font-medium text-white">
              {formatTime(priceStats.lastUpdate)}
            </div>
          </div>

          {/* Age */}
          <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Edad</div>
            <div className="text-sm font-medium text-white">
              {priceInfo.age < 60 
                ? `${priceInfo.age}s` 
                : `${Math.floor(priceInfo.age / 60)}min`}
            </div>
          </div>

          {/* Status */}
          <div className="bg-black/40 rounded-lg p-3 border border-gray-700 col-span-2">
            <div className="text-xs text-gray-400 mb-1">Estado</div>
            <div className="flex items-center gap-2">
              {priceInfo.isFresh ? (
                <>
                  <span className="text-green-400">✓</span>
                  <span className="text-sm text-green-400">Precio actualizado y válido</span>
                </>
              ) : (
                <>
                  <span className="text-orange-400">⚠</span>
                  <span className="text-sm text-orange-400">Precio puede estar desactualizado</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          💡 Precio obtenido del Oracle on-chain
        </div>
      </div>
    </Card>
  );
}

/**
 * Variante compacta del TokenPriceCard para uso en badges
 */
export function TokenPriceBadge() {
  const { currentPrice, isLoading } = usePriceOracle(true, 30000);

  if (isLoading || !currentPrice) {
    return (
      <Badge variant="default" className="text-xs">
        💎 $-.----
      </Badge>
    );
  }

  return (
    <Badge variant="info" className="text-xs font-mono">
      💎 ${currentPrice.toFixed(4)}
    </Badge>
  );
}
