'use client';

import { X, Shield, Lock, Coins, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface fCoreExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal explicativo del sistema fCORE Anti-Bot
 */
export function fCoreExplanationModal({ isOpen, onClose }: fCoreExplanationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card variant="glass" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sistema fCORE Anti-Bot</h2>
                <p className="text-sm text-gray-400">Token temporal de recompensas verificado</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* ¿Qué es fCORE? */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              ¿Qué es fCORE?
            </h3>
            <p className="text-gray-300 leading-relaxed">
              fCORE (faux CORE) es un token <strong className="text-amber-400">soulbound temporal</strong> que 
              recibes como recompensa de minería. No es transferible y solo puede convertirse a CORE real 
              después de verificar tu identidad humana mediante Proof of Humanity (PoH).
            </p>
          </div>

          {/* ¿Por qué existe? */}
          <div className="space-y-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              ¿Por qué existe el sistema Anti-Bot?
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Previene bots:</strong> Los bots no pueden verificar 
                  su humanidad, así que no pueden convertir fCORE a CORE.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Protege el ecosistema:</strong> Reduce farming 
                  automatizado y mantiene recompensas justas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Usuarios reales primero:</strong> Prioriza a 
                  jugadores genuinos sobre actores maliciosos.
                </span>
              </li>
            </ul>
          </div>

          {/* Cómo funciona */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-400" />
              ¿Cómo funciona?
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Gana fCORE minando</h4>
                  <p className="text-sm text-gray-400">
                    Al minar con tus CoreMiners, recibes fCORE como recompensa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Verifica tu identidad (PoH)</h4>
                  <p className="text-sm text-gray-400">
                    Completa la verificación Proof of Humanity para demostrar que eres humano.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Convierte fCORE → CORE</h4>
                  <p className="text-sm text-gray-400">
                    Una vez verificado, convierte tu fCORE a CORE real en ratio 1:1.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Importante */}
          <div className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Importante
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 shrink-0">•</span>
                <span>fCORE <strong>no es transferible</strong> entre wallets (token soulbound)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 shrink-0">•</span>
                <span>Solo se puede convertir a CORE con <strong>verificación PoH activa</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 shrink-0">•</span>
                <span>La conversión es <strong>irreversible</strong> y en ratio 1:1</span>
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-200"
          >
            Entendido
          </button>
        </div>
      </Card>
    </div>
  );
}
