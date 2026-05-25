'use client';

import { RefreshCw, TrendingDown, Info } from 'lucide-react';
import { Button, Loading, Card } from '@/components/ui';
import { useBuyBack } from '@/lib/hooks/economy/useBuyBack';
import { BuyBackReservesCard } from './BuyBackReservesCard';
import { BuyBackStatsTable } from './BuyBackStatsTable';

interface BuyBackDashboardProps {
  className?: string;
}

/**
 * Dashboard completo del BuyBack Fund
 * 
 * @pattern Container Component - Maneja estado y lógica
 */
export function BuyBackDashboard({ className = '' }: BuyBackDashboardProps) {
  const { info, isLoading, error, refresh, hasBalance, readyToExecute } = useBuyBack();

  if (isLoading && !info) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="p-6">
        <div className="text-center text-red-400">
          <p className="font-bold mb-2">Error al cargar información</p>
          <p className="text-sm text-gray-400">{error.message}</p>
          <Button onClick={refresh} className="mt-4">
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  if (!info) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            💰 BuyBack Fund
          </h2>
          <p className="text-gray-400">
            Sistema automático de recompra de $CORE
          </p>
        </div>
        
        <Button
          onClick={refresh}
          variant="secondary"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="glass" className="p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-300 mb-1">
              ¿Cómo funciona el BuyBack Fund?
            </p>
            <p className="text-gray-400">
              El fondo acumula 10-15% de los recursos consumidos en el ecosistema (forja, mining, etc.). 
              Cuando el precio de $CORE cae por debajo del umbral configurado, el fondo ejecuta un buyback 
              automático para estabilizar el precio.
            </p>
          </div>
        </div>
      </Card>

      {/* Grid de Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <BuyBackReservesCard info={info} />
        <BuyBackStatsTable info={info} />
      </div>

      {/* Status Indicator */}
      {readyToExecute && (
        <Card variant="glass" className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-bold text-green-300 mb-1">
                ✅ Listo para ejecutar buyback
              </p>
              <p className="text-sm text-gray-400">
                El precio está por debajo del umbral y hay fondos suficientes. 
                El buyback se ejecutará automáticamente o puede ser ejecutado manualmente por un administrador.
              </p>
            </div>
          </div>
        </Card>
      )}

      {!hasBalance && (
        <Card variant="glass" className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="font-bold text-yellow-300 mb-1">
                ⏳ Acumulando fondos
              </p>
              <p className="text-sm text-gray-400">
                El fondo está vacío actualmente. Los fondos se acumulan automáticamente 
                desde las transacciones del ecosistema.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
