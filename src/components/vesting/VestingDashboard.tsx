'use client';

import { RefreshCw, Info, AlertTriangle } from 'lucide-react';
import { Button, Loading, Card } from '@/components/ui';
import { useVesting } from '@/lib/hooks/economy/useVesting';
import { VestingCard } from './VestingCard';
import { VestingStatsCard } from './VestingStatsCard';
import { useToast } from '@/components/ui';

interface VestingDashboardProps {
  className?: string;
}

/**
 * Dashboard completo del Vesting Manager
 * 
 * @pattern Container Component - Maneja estado y lógica
 */
export function VestingDashboard({ className = '' }: VestingDashboardProps) {
  const { 
    dashboard, 
    isLoading, 
    error, 
    refresh, 
    release, 
    hasSchedules,
    hasReleasable,
  } = useVesting();
  const { showSuccess, showError } = useToast();

  const handleRelease = async (scheduleId: bigint) => {
    try {
      await release(scheduleId);
      showSuccess('Tokens liberados exitosamente');
    } catch (error) {
      showError('Error al liberar tokens');
    }
  };

  if (isLoading && !dashboard) {
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

  if (!dashboard || !hasSchedules) {
    return (
      <Card variant="glass" className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Info className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="font-bold text-xl text-white mb-2">
            No tienes vesting schedules
          </h3>
          <p className="text-gray-400">
            Cuando se te asignen tokens bloqueados, aparecerán aquí.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            🔒 Vesting Manager
          </h2>
          <p className="text-gray-400">
            Gestión de tokens bloqueados con liberación gradual
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
              ¿Qué es Vesting?
            </p>
            <p className="text-gray-400">
              Los tokens en vesting están bloqueados y se liberan gradualmente durante un período de tiempo (típicamente 6 meses). 
              Puedes liberar los tokens disponibles en cualquier momento.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Card */}
      <VestingStatsCard dashboard={dashboard} />

      {/* Releasable Alert */}
      {hasReleasable && (
        <Card variant="glass" className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-bold text-green-300 mb-1">
                ✅ Tienes tokens disponibles para liberar
              </p>
              <p className="text-sm text-gray-400">
                Total disponible: {dashboard.totalReleasableFormatted}. 
                Usa los botones en cada schedule para liberar.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Schedules Grid */}
      <div>
        <h3 className="font-bold text-xl text-white mb-4">
          Mis Vesting Schedules ({dashboard.schedules.length})
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {dashboard.schedules.map((schedule) => (
            <VestingCard
              key={schedule.scheduleId.toString()}
              schedule={schedule}
              onRelease={() => handleRelease(schedule.scheduleId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
