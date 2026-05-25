'use client';

import { Card } from '@/components/ui/Card';
import { Coins, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { formatUnits } from 'viem';

interface fCoreBalanceCardProps {
  fCoreBalance: bigint;
  coreEstimate: bigint;
  conversionRate: bigint;
  isPohVerified: boolean;
  canConvert: boolean;
  onConvertClick: () => void;
  isLoading?: boolean;
}

/**
 * Card que muestra el balance de fCORE y estimación de conversión
 */
export function fCoreBalanceCard({
  fCoreBalance,
  coreEstimate,
  conversionRate,
  isPohVerified,
  canConvert,
  onConvertClick,
  isLoading = false,
}: fCoreBalanceCardProps) {
  const fCoreFormatted = formatUnits(fCoreBalance, 18);
  const coreFormatted = formatUnits(coreEstimate, 18);
  const rateFormatted = formatUnits(conversionRate, 18);

  const hasfCoreBalance = fCoreBalance > 0n;

  return (
    <Card variant="gradient" className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Balance fCORE</h3>
              <p className="text-sm text-gray-400">Token Anti-Bot Temporal</p>
            </div>
          </div>

          {isPohVerified && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-300">PoH Verificado</span>
            </div>
          )}
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* fCORE Balance */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-sm text-gray-400 mb-1">Tu Balance</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-400">
                {parseFloat(fCoreFormatted).toFixed(2)}
              </span>
              <span className="text-lg text-gray-400">fCORE</span>
            </div>
          </div>

          {/* CORE Estimate */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="text-sm text-gray-400 mb-1">Recibirás</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-400">
                {parseFloat(coreFormatted).toFixed(2)}
              </span>
              <span className="text-lg text-gray-400">CORE</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <span className="text-sm text-gray-300">
            Tasa de conversión: <span className="font-bold text-purple-300">1 fCORE = {rateFormatted} CORE</span>
          </span>
        </div>

        {/* Status & Actions */}
        {hasfCoreBalance ? (
          <>
            {!isPohVerified && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-300 mb-1">
                    Verificación PoH Requerida
                  </p>
                  <p className="text-xs text-gray-400">
                    Necesitas verificar tu identidad para convertir fCORE a CORE y prevenir bots.
                  </p>
                </div>
              </div>
            )}

            {/* Convert Button */}
            <button
              onClick={onConvertClick}
              disabled={!canConvert || isLoading}
              className={`
                w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold
                transition-all duration-200
                ${
                  canConvert && !isLoading
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Convirtiendo...</span>
                </>
              ) : (
                <>
                  <span>Convertir a CORE</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <Coins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              No tienes balance de fCORE. Participa en minería para ganar recompensas.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
