'use client';

import { CheckCircle, Clock, Circle } from 'lucide-react';
import { Card } from '@/components/ui';
import type { VestingScheduleUI } from '@/lib/services/vesting';

interface VestingTimelineProps {
  schedule: VestingScheduleUI;
  className?: string;
}

/**
 * Timeline visual del progreso de vesting
 * 
 * @pattern Presentation Component
 */
export function VestingTimeline({
  schedule,
  className = '',
}: VestingTimelineProps) {
  const {
    startTime,
    duration,
    progressPercent,
    isComplete,
    revoked,
  } = schedule;

  const now = BigInt(Math.floor(Date.now() / 1000));
  const endTime = startTime + duration;
  const hasStarted = now >= startTime;

  const milestones = [
    {
      label: 'Inicio',
      timestamp: startTime,
      completed: hasStarted,
    },
    {
      label: '25%',
      timestamp: startTime + (duration / 4n),
      completed: progressPercent >= 25,
    },
    {
      label: '50%',
      timestamp: startTime + (duration / 2n),
      completed: progressPercent >= 50,
    },
    {
      label: '75%',
      timestamp: startTime + (duration * 3n / 4n),
      completed: progressPercent >= 75,
    },
    {
      label: 'Completado',
      timestamp: endTime,
      completed: isComplete,
    },
  ];

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      <h3 className="font-bold text-lg text-white mb-6">📅 Timeline de Vesting</h3>
      
      <div className="relative">
        {/* Línea de progreso */}
        <div className="absolute left-0 top-6 w-full h-0.5 bg-gray-700">
          <div
            className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestones */}
        <div className="relative flex justify-between">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Icon */}
              <div className={`
                relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                ${milestone.completed
                  ? 'bg-linear-to-br from-purple-500 to-blue-500'
                  : 'bg-gray-700 border-2 border-gray-600'
                }
                ${revoked ? 'opacity-50' : ''}
              `}>
                {milestone.completed ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : index === 0 ? (
                  <Clock className="w-6 h-6 text-gray-400" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <div className={`
                  text-sm font-bold mb-1
                  ${milestone.completed ? 'text-purple-300' : 'text-gray-500'}
                `}>
                  {milestone.label}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(milestone.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {revoked && (
        <div className="mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
          <p className="text-sm text-red-300">
            ⚠️ Schedule revocado - Timeline detenido
          </p>
        </div>
      )}
    </Card>
  );
}
