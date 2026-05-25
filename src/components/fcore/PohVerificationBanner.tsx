'use client';

import { Shield, AlertCircle, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface PohVerificationBannerProps {
  isVerified: boolean;
  verificationLevel?: number;
  expiresAt?: bigint;
  onConvert?: () => Promise<void>;
  onLearnMore?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Banner que muestra el estado de verificación PoH y acciones
 */
export function PohVerificationBanner({
  isVerified,
  verificationLevel = 0,
  expiresAt,
  onConvert,
  onLearnMore,
  isLoading = false,
  className = '',
}: PohVerificationBannerProps) {
  // Calcular si está próximo a expirar (menos de 7 días)
  const isExpiringSoon = expiresAt && expiresAt > 0n 
    ? (Number(expiresAt) - Math.floor(Date.now() / 1000)) < 7 * 24 * 60 * 60
    : false;

  // Formatear fecha de expiración
  const expirationDate = expiresAt && expiresAt > 0n
    ? new Date(Number(expiresAt) * 1000).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  if (isVerified && !isExpiringSoon) {
    // Usuario verificado y no próximo a expirar
    return (
      <Card variant="glass" className={`p-4 bg-green-500/10 border-green-500/30 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-green-300">Verificado PoH</h4>
              <p className="text-sm text-gray-400">
                Puedes convertir fCORE a CORE libremente
                {expirationDate && ` • Válido hasta ${expirationDate}`}
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
            <span className="text-xs font-medium text-green-300">Nivel {verificationLevel}</span>
          </div>
        </div>
      </Card>
    );
  }

  if (isVerified && isExpiringSoon) {
    // Usuario verificado pero próximo a expirar
    return (
      <Card variant="glass" className={`p-4 bg-amber-500/10 border-amber-500/30 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-amber-300 mb-1">Tu verificación PoH expira pronto</h4>
            <p className="text-sm text-gray-400 mb-3">
              {expirationDate && `Expira el ${expirationDate}. Renueva tu verificación para seguir convirtiendo fCORE.`}
            </p>
            <button
              onClick={() => window.open('https://poh.ronin.com', '_blank')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <span>Renovar Verificación</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Usuario no verificado
  return (
    <Card variant="glass" className={`p-4 bg-purple-500/10 border-purple-500/30 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="font-bold text-purple-300 mb-1">Verificación PoH Requerida</h4>
            <p className="text-sm text-gray-400 mb-2">
              Para convertir fCORE a CORE, necesitas verificar que eres humano mediante Proof of Humanity.
              Esto protege el ecosistema contra bots.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span>Proceso seguro y rápido • Sin costo de gas</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:shrink-0">
          <button
            onClick={() => window.open('https://poh.ronin.com', '_blank')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 text-sm"
          >
            <span>Verificar Ahora</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              ¿Cómo funciona?
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
