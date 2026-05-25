/**
 * AxieCard - Componente para mostrar un Axie NFT con opciones de staking
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import type { AxieNFT } from '@/lib/facades/NFTFacade';

interface AxieCardProps {
  axie: AxieNFT;
  onStake?: (axieId: string) => Promise<void>;
  onUnstake?: (axieId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AxieCard({ axie, onStake, onUnstake, isLoading }: AxieCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStake = async () => {
    if (!onStake || isProcessing) return;
    setIsProcessing(true);
    try {
      await onStake(axie.tokenId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnstake = async () => {
    if (!onUnstake || isProcessing) return;
    setIsProcessing(true);
    try {
      await onUnstake(axie.tokenId);
    } finally {
      setIsProcessing(false);
    }
  };

  const getClassColor = (axieClass: string) => {
    const colors: Record<string, string> = {
      Beast: 'from-orange-500 to-red-600',
      Aquatic: 'from-blue-500 to-cyan-600',
      Plant: 'from-green-500 to-emerald-600',
      Bird: 'from-pink-500 to-purple-600',
      Bug: 'from-red-500 to-orange-600',
      Reptile: 'from-purple-500 to-indigo-600',
      Mech: 'from-gray-500 to-slate-600',
      Dawn: 'from-yellow-500 to-orange-600',
      Dusk: 'from-indigo-500 to-purple-600',
    };
    return colors[axieClass] || 'from-gray-500 to-gray-600';
  };

  return (
    <Card variant="gradient" className="p-4">
      {/* Imagen del Axie */}
      <div className="aspect-square rounded-lg overflow-hidden bg-black/20 mb-4 relative">
        <div
          className={`h-full w-full bg-linear-to-br ${getClassColor(
            axie.metadata.class
          )} flex items-center justify-center text-6xl`}
        >
          🐉
        </div>
        
        {/* Badge de staking */}
        {axie.isStaked && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" className="text-xs">
              Staked
            </Badge>
          </div>
        )}
      </div>

      {/* Info del Axie */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            {axie.metadata.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Axie #{axie.tokenId}</p>
            <Badge className={`text-xs bg-linear-to-r ${getClassColor(axie.metadata.class)}`}>
              {axie.metadata.class}
            </Badge>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-2 border-t border-gray-700">
          {axie.isStaked ? (
            <Button
              onClick={handleUnstake}
              disabled={isProcessing || isLoading}
              variant="secondary"
              className="w-full"
            >
              {isProcessing ? 'Procesando...' : 'Unstake Axie'}
            </Button>
          ) : (
            <Button
              onClick={handleStake}
              disabled={isProcessing || isLoading}
              className="w-full bg-linear-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              {isProcessing ? 'Procesando...' : 'Stake para Bonos'}
            </Button>
          )}
        </div>

        {/* Info adicional */}
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Genes:</span>
            <span className="font-mono">{axie.metadata.genes.slice(0, 8)}...</span>
          </div>
          {axie.isStaked && (
            <div className="flex justify-between text-green-400">
              <span>Bonus activo:</span>
              <span className="font-bold">+10% Mining</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
