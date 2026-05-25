/**
 * MinerConfigModal - Modal para configurar ciclo de minería
 * 
 * Permite al usuario seleccionar la duración del ciclo y ver bonos asociados
 * 
 * @pattern Presentational Component
 */

'use client';

import { useState } from 'react';
import { CycleDuration } from '@/lib/contracts/interfaces/ICycleContract';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface MinerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: CycleDuration) => void;
  minerName: string;
  isProcessing?: boolean;
}

interface CycleDurationOption {
  duration: CycleDuration;
  label: string;
  days: number;
  bonus: number;
  description: string;
  recommended?: boolean;
}

const DURATION_OPTIONS: CycleDurationOption[] = [
  {
    duration: CycleDuration.SHORT,
    label: '1 Semana',
    days: 7,
    bonus: 0,
    description: 'Ciclo corto - Sin bonus',
  },
  {
    duration: CycleDuration.STANDARD,
    label: '2 Semanas',
    days: 14,
    bonus: 0,
    description: 'Ciclo estándar - Sin bonus',
  },
  {
    duration: CycleDuration.COMMITTED,
    label: '1 Mes',
    days: 30,
    bonus: 2,
    description: '+2% de producción',
    recommended: true,
  },
  {
    duration: CycleDuration.STRATEGIC,
    label: '2 Meses',
    days: 60,
    bonus: 3,
    description: '+3% de producción',
  },
  {
    duration: CycleDuration.MASTER,
    label: '3 Meses',
    days: 90,
    bonus: 5,
    description: '+5% de producción - Máximo bonus',
  },
];

export function MinerConfigModal({
  isOpen,
  onClose,
  onConfirm,
  minerName,
  isProcessing = false,
}: MinerConfigModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<CycleDuration>(
    CycleDuration.COMMITTED // Default: 1 mes (recomendado)
  );

  const handleConfirm = () => {
    onConfirm(selectedDuration);
  };

  const selectedOption = DURATION_OPTIONS.find(
    opt => opt.duration === selectedDuration
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Ciclo de Minería">
      <div className="space-y-6">
        {/* Miner Info */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💎</span>
            <div>
              <h3 className="font-bold text-white">{minerName}</h3>
              <p className="text-sm text-gray-400">Selecciona la duración del ciclo</p>
            </div>
          </div>
        </div>

        {/* Duration Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duración del Ciclo
          </label>
          
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.duration}
              onClick={() => setSelectedDuration(option.duration)}
              disabled={isProcessing}
              className={`
                w-full p-4 rounded-lg border-2 transition-all
                ${selectedDuration === option.duration
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedDuration === option.duration
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-600'
                    }
                  `}>
                    {selectedDuration === option.duration && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{option.label}</span>
                      {option.recommended && (
                        <Badge variant="success" className="text-xs">
                          Recomendado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                {option.bonus > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-500">
                      +{option.bonus}%
                    </div>
                    <div className="text-xs text-gray-400">Bonus</div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Summary */}
        {selectedOption && (
          <div className="bg-linear-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Duración seleccionada:</span>
              <span className="font-bold text-white">{selectedOption.days} días</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Bonus de producción:</span>
              <span className="font-bold text-green-400">+{selectedOption.bonus}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Mineros en ciclo:</span>
              <span className="font-bold text-white">1</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
          <div className="flex gap-2">
            <span className="text-blue-400 text-sm">ℹ️</span>
            <p className="text-xs text-blue-300">
              Durante el ciclo, tu CoreMiner estará bloqueado y no podrás transferirlo. 
              Podrás reclamar recompensas cuando finalice el ciclo.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Activando...' : 'Activar Ciclo'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
