"use client";

import { Clock, TrendingUp, Lock, CheckCircle, XCircle } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import type { VestingScheduleUI } from "@/lib/services/vesting";
import { createVestingService } from "@/lib/services/vesting";
import { ContractManager } from "@/lib/contracts/ContractManager";

interface VestingCardProps {
  schedule: VestingScheduleUI;
  onRelease?: () => void;
  className?: string;
}

/**
 * Card individual para un vesting schedule
 *
 * @pattern Presentation Component - UI con lógica mínima
 */
export function VestingCard({
  schedule,
  onRelease,
  className = "",
}: VestingCardProps) {
  const {
    scheduleId,
    totalAmountFormatted,
    vestedAmountFormatted,
    releasableAmountFormatted,
    remainingAmountFormatted,
    progressPercent,
    timeRemainingSeconds,
    isComplete,
    canRelease,
    revoked,
    startTime,
    duration,
  } = schedule;

  const vestingService = createVestingService(
    ContractManager.getInstance({ chainId: 202601 }),
  );
  const startDate = vestingService.formatDate(startTime);
  const durationStr = vestingService.formatDuration(Number(duration));
  const timeRemainingStr = vestingService.formatDuration(timeRemainingSeconds);

  const getStatusBadge = () => {
    if (revoked) {
      return (
        <Badge variant="danger" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Revocado
        </Badge>
      );
    }
    if (isComplete) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completado
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Activo
      </Badge>
    );
  };

  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              Schedule #{scheduleId.toString()}
            </h3>
            <p className="text-xs text-gray-400">
              Inicio: {startDate} • Duración: {durationStr}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Progress Bar */}
      {!revoked && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progreso</span>
            <span className="text-sm font-bold text-purple-400">
              {progressPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {!isComplete && (
            <p className="text-xs text-gray-500 mt-1">
              ⏱️ {timeRemainingStr} restantes
            </p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Total Bloqueado</div>
          <div className="font-bold text-white">{totalAmountFormatted}</div>
        </div>

        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Ya Vested</div>
          <div className="font-bold text-green-400">
            {vestedAmountFormatted}
          </div>
        </div>

        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Disponible</div>
          <div className="font-bold text-blue-400">
            {releasableAmountFormatted}
          </div>
        </div>

        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Restante</div>
          <div className="font-bold text-purple-400">
            {remainingAmountFormatted}
          </div>
        </div>
      </div>

      {/* Release Button */}
      {canRelease && !revoked && (
        <Button onClick={onRelease} className="w-full" variant="primary">
          <TrendingUp className="w-4 h-4" />
          Liberar {releasableAmountFormatted}
        </Button>
      )}

      {revoked && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
          <p className="text-sm text-red-300">
            Este schedule fue revocado por un administrador
          </p>
        </div>
      )}
    </Card>
  );
}
