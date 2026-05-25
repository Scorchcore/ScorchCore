'use client';

import { Wallet, TrendingUp, Lock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import type { VestingDashboard } from '@/lib/services/vesting';

interface VestingStatsCardProps {
  dashboard: VestingDashboard;
  className?: string;
}

/**
 * Card de estadísticas consolidadas de vesting
 * 
 * @pattern Presentation Component
 */
export function VestingStatsCard({
  dashboard,
  className = '',
}: VestingStatsCardProps) {
  const {
    totalLockedFormatted,
    totalReleasedFormatted,
    totalReleasableFormatted,
    activeSchedulesCount,
    completedSchedulesCount,
  } = dashboard;

  const stats = [
    {
      icon: Lock,
      label: 'Total Bloqueado',
      value: totalLockedFormatted,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Ya Liberado',
      value: totalReleasedFormatted,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      icon: Wallet,
      label: 'Disponible Ahora',
      value: totalReleasableFormatted,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: CheckCircle,
      label: 'Schedules Activos',
      value: `${activeSchedulesCount} de ${activeSchedulesCount + completedSchedulesCount}`,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      <h3 className="font-bold text-xl text-white mb-4">📊 Resumen General</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-black/40 rounded-lg hover:bg-black/60 transition-colors"
          >
            <div className={`p-2 ${stat.bgColor} rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-0.5">
                {stat.label}
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
