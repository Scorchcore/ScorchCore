'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui';
import { CoreMinerVideo } from '@/components/CoreMinerVideo';
import { createServiceLogger } from '@/lib/utils/logging/logger';
import { GeodeCategory, AxieClass } from '@/lib/constants/geodes';
import { Hammer, Zap, Gem } from 'lucide-react';

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
  minerIndex: number;
  minerVideoUrl: string;
}

// Rarity → alchemy color token
const RARITY_NAME_COLOR: Record<string, string> = {
  common: 'text-cyan-50/72',
  uncommon: 'text-emerald-300',
  rare: 'text-ethereal-cyan',
  'very-rare': 'text-sky-300',
  epic: 'text-magma-orange',
  legendary: 'text-magma-gold',
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-cyan-100/12',
  uncommon: 'border-emerald-400/35',
  rare: 'border-ethereal-cyan/40',
  'very-rare': 'border-sky-400/40',
  epic: 'border-magma-orange/45',
  legendary: 'border-magma-gold/55',
};

const RARITY_LABEL: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  'very-rare': 'Very Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

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
  minerVideoUrl,
}: HatchSuccessModalProps) {
  const router = useRouter();

  const nameColor = RARITY_NAME_COLOR[minerRarity] || 'text-cyan-50/72';
  const videoBorder = RARITY_BORDER[minerRarity] || 'border-cyan-100/12';
  const rarityLabel = RARITY_LABEL[minerRarity] || minerRarity;

  const handleGoToInventory = () => {
    log.info('Navigating to inventory from success modal');
    onClose();
    router.push('/inventory');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hatch Successful" size="lg">
      <div className="space-y-5 text-center">
        {/* Video */}
        <div
          className={`mx-auto aspect-square max-w-xs overflow-hidden border ${videoBorder} bg-black/38`}
        >
          <CoreMinerVideo
            category={category}
            axieClass={axieClass}
            minerIndex={minerIndex}
            autoPlay={true}
            loop={true}
            muted={true}
            className="h-full w-full"
            showFallback={true}
          />
        </div>

        {/* Miner info */}
        <div>
          <h3 className={`alchemy-heading text-2xl leading-tight ${nameColor}`}>
            {minerName}
          </h3>
          <p className="mt-1 text-[0.65rem] text-cyan-50/38">Token ID #{minerId.toString()}</p>
        </div>

        {/* Stats */}
        <div className="mx-auto max-w-xs divide-y divide-cyan-100/8 border border-cyan-100/8 bg-black/22 text-left">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <Gem className="h-3.5 w-3.5 text-magma-gold/65" />
              Rarity
            </span>
            <span className={`text-xs font-semibold ${nameColor}`}>{rarityLabel}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs text-cyan-50/52">
              <Zap className="h-3.5 w-3.5 text-magma-gold/65" />
              Mining Power
            </span>
            <span className="text-xs font-semibold text-white">{minerPower}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleGoToInventory}
            className="inline-flex items-center justify-center gap-2 border border-ethereal-cyan/55 bg-cyan-300/14 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-cyan-50 shadow-[0_0_28px_rgba(125,249,255,0.16)] transition-all hover:border-ethereal-cyan hover:bg-cyan-300/22 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <Gem className="h-3.5 w-3.5" />
            View in Inventory
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 border border-cyan-100/12 bg-black/42 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-cyan-50/58 transition-all hover:border-ethereal-cyan/45 hover:text-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <Hammer className="h-3.5 w-3.5" />
            Hatch Another
          </button>
        </div>
      </div>
    </Modal>
  );
}
