'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button } from '@/components/ui';
import { CoreMinerVideo } from '@/components/CoreMinerVideo';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { GeodeCategory, AxieClass } from '@/lib/constants/geodes';

const log = createServiceLogger('HatchSuccessModal');

interface HatchSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: GeodeCategory;
  axieClass: AxieClass;
  minerId: bigint;
  minerName: string;
  minerRarity: string;
  minerPower: number;
  minerIndex: number; // Índice del miner (0-based) - CRÍTICO para mostrar video correcto
  minerVideoUrl: string; // URL del video del miner desde Piñata
}

export function HatchSuccessModal({
  isOpen,
  onClose,
  category,
  axieClass,
  minerId,
  minerName,
  minerRarity,
  minerPower,
  minerIndex,
  minerVideoUrl
}: HatchSuccessModalProps) {
  const router = useRouter();
  
  const rarityColors: Record<string, string> = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  };

  const rarityEmojis: Record<string, string> = {
    common: '✨',
    uncommon: '💚',
    rare: '💎',
    epic: '⭐',
    legendary: '👑'
  };

  const handleGoToInventory = () => {
    onClose();
    router.push('/inventory');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${rarityEmojis[minerRarity] || '✨'} ¡Eclosión Exitosa!`}
      size="lg"
    >
      <div className="text-center space-y-6">
        {/* Video del CoreMiner con fallback local→IPFS */}
        <div className="aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-gray-800">
          <CoreMinerVideo
            category={category}
            axieClass={axieClass}
            minerIndex={minerIndex}
            ipfsUrl={minerVideoUrl}
            autoPlay={true}
            loop={true}
            muted={true}
            className="w-full h-full rounded-lg"
            showFallback={true}
          />
        </div>

        {/* Información del CoreMiner */}
        <div>
          <h3 className={`text-2xl font-bold mb-2 ${rarityColors[minerRarity] || 'text-white'}`}>
            {minerName}
          </h3>
          <div className="flex items-center justify-center gap-4 text-gray-300">
            <span className="capitalize">
              {minerRarity}
            </span>
            <span>•</span>
            <span>
              ⚡ Poder: {minerPower}
            </span>
          </div>
          <p className="text-gray-400 mt-2">
            Token ID: #{minerId.toString()}
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="primary"
            onClick={handleGoToInventory}
          >
            Ver en Inventario
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Eclosionar Otro
          </Button>
        </div>
      </div>
    </Modal>
  );
}
