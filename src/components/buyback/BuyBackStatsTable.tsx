'use client';

import { Card } from '@/components/ui';
import type { BuyBackDashboardInfo } from '@/lib/services/buyback';

interface BuyBackStatsTableProps {
  info: BuyBackDashboardInfo;
  className?: string;
}

/**
 * Tabla de estadísticas del BuyBack Fund
 * 
 * @pattern Presentation Component - Solo UI
 */
export function BuyBackStatsTable({
  info,
  className = '',
}: BuyBackStatsTableProps) {
  const {
    totalBuybacks,
    totalBuybackAmount,
    minBuybackAmount,
    estimatedCoreBuyable,
  } = info;

  const averagePerBuyback = Number(totalBuybacks) > 0
    ? Number(totalBuybackAmount) / Number(totalBuybacks)
    : 0;

  const formatRON = (wei: bigint | number) => {
    const value = typeof wei === 'bigint' ? Number(wei) : wei;
    const ron = value / 1e18;
    return `${ron.toFixed(4)} RON`;
  };

  const formatCORE = (wei: bigint) => {
    const core = Number(wei) / 1e18;
    return `${core.toFixed(2)} CORE`;
  };

  const stats = [
    {
      label: 'Total de Buybacks',
      value: totalBuybacks.toString(),
      description: 'Número de buybacks ejecutados',
    },
    {
      label: 'Promedio por Buyback',
      value: formatRON(averagePerBuyback),
      description: 'RON gastado en promedio',
    },
    {
      label: 'Mínimo para Ejecutar',
      value: formatRON(minBuybackAmount),
      description: 'Balance mínimo requerido',
    },
    {
      label: 'CORE Estimado',
      value: formatCORE(estimatedCoreBuyable),
      description: 'Basado en precio umbral',
    },
  ];

  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      <h3 className="font-bold text-xl text-white mb-4">📊 Estadísticas</h3>
      
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-black/40 rounded-lg hover:bg-black/60 transition-colors"
          >
            <div>
              <div className="text-sm font-medium text-white mb-0.5">
                {stat.label}
              </div>
              <div className="text-xs text-gray-400">
                {stat.description}
              </div>
            </div>
            <div className="text-lg font-bold text-blue-400">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
