'use client';

import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { BuyBackDashboardInfo } from '@/lib/services/buyback';

interface BuyBackReservesCardProps {
  info: BuyBackDashboardInfo;
  className?: string;
}

/**
 * Card que muestra las reservas del BuyBack Fund
 * 
 * @pattern Presentation Component - Solo UI, sin lógica de negocio
 */
export function BuyBackReservesCard({
  info,
  className = '',
}: BuyBackReservesCardProps) {
  const {
    balanceFormatted,
    totalBuybackAmountFormatted,
    priceThresholdFormatted,
    readyToExecute,
    autoBurnEnabled,
  } = info;

  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Wallet className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Reservas del Fondo</h3>
            <p className="text-xs text-gray-400">Balance disponible para buybacks</p>
          </div>
        </div>
        
        {readyToExecute && (
          <Badge variant="success" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Listo
          </Badge>
        )}
      </div>

      {/* Balance Principal */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold text-green-400">
            {balanceFormatted}
          </span>
        </div>
        <p className="text-sm text-gray-400">Balance actual del fondo</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Total Gastado</div>
          <div className="font-bold text-white">{totalBuybackAmountFormatted}</div>
        </div>

        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Precio Umbral</div>
          <div className="font-bold text-white">{priceThresholdFormatted}</div>
        </div>
      </div>

      {/* Modo de operación */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300">
            <p className="font-medium text-blue-300 mb-1">
              {autoBurnEnabled ? '🔥 Auto-Burn Activo' : '💰 Envío a Treasury'}
            </p>
            <p className="text-gray-400">
              {autoBurnEnabled
                ? 'Los tokens $CORE comprados se queman automáticamente'
                : 'Los tokens $CORE comprados se envían al treasury'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
